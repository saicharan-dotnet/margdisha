import { supabase } from '../lib/supabase';
import type { Opportunity, Profile } from './types';
import { oppToRow, rowToOpp, type OppRow } from './remote-map';

const COLS = 'id,kind,scope,sector,title,provider,summary,criteria,details,deadline,source_url,source_label,published_on,last_verified_on,verified_by,status,sample';

/** Only web links are rendered: a javascript: or data: URL in a row must never reach an href. */
export const isWebUrl = (u: unknown): u is string => typeof u === 'string' && /^https?:\/\//i.test(u.trim());

export async function fetchOpportunities(): Promise<Opportunity[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('opportunities').select(COLS).order('deadline', { ascending: true, nullsFirst: false });
  if (error || !data) return null;
  return (data as unknown as OppRow[]).filter((r) => isWebUrl(r.source_url)).map(rowToOpp);
}

/** Admin-only (enforced by RLS and the verification trigger in the database). */
export async function saveOpportunity(o: Opportunity): Promise<{ ok: true; opp: Opportunity } | { ok: false; error: string }> {
  if (!supabase) return { ok: false, error: 'Database not available' };
  const { data, error } = await supabase.from('opportunities').upsert(oppToRow(o)).select(COLS).single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, opp: rowToOpp(data as unknown as OppRow) };
}

export async function checkIsAdmin(): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('is_admin');
  return !error && data === true;
}

export async function loadUserData(): Promise<{ profile?: Profile; saved: string[] }> {
  if (!supabase) return { saved: [] };
  const [p, s] = await Promise.all([
    supabase.from('profiles').select('data').maybeSingle(),
    supabase.from('saved_items').select('opportunity_id'),
  ]);
  return {
    profile: (p.data?.data as Profile | undefined) ?? undefined,
    saved: (s.data ?? []).map((r: { opportunity_id: string }) => r.opportunity_id),
  };
}

export async function saveProfileRemote(profile: Profile) {
  if (!supabase) return;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from('profiles').upsert({ user_id: data.user.id, data: profile, updated_at: new Date().toISOString() });
}

export async function setSavedRemote(id: string, on: boolean) {
  if (!supabase) return;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  if (on) await supabase.from('saved_items').upsert({ user_id: data.user.id, opportunity_id: id });
  else await supabase.from('saved_items').delete().eq('opportunity_id', id);
}

export async function deleteOpportunity(id: string): Promise<string | null> {
  if (!supabase) return 'Database not available';
  const { error } = await supabase.from('opportunities').delete().eq('id', id);
  return error ? error.message : null;
}

export interface Notice {
  id: number; url: string; title: string; source_id: string; source_name: string;
  sector: string | null; area: 'job' | 'school' | 'exam' | 'scholarship';
  first_seen: string; status: 'new' | 'listed' | 'ignored'; listing_id: string | null;
}

/** Where a notice's link should open. The common RRB website rejects visitors who open its inner
 *  "getdata?cennum=..." pages directly, so those open the RRB's own page, where the CEN is listed. */
export function openUrl(url: string): string {
  const m = /^https:\/\/rrb\.indianrailways\.gov\.in\/getdata\?.*\bloc=([a-z]+)/i.exec(url);
  return m ? `https://rrb.indianrailways.gov.in/${m[1].toLowerCase()}` : url;
}

const MONTHS = 'jan feb mar apr may jun jul aug sep oct nov dec'.split(' ');
const DAY = 864e5;
/** Dates written in a notice title: 04.10.2026, 4/10/2026, 4 Oct 2026, October 4, 2026. */
function titleDates(t: string): number[] {
  const out: number[] = [];
  for (const m of t.matchAll(/\b(\d{1,2})[./-](\d{1,2})[./-](20\d{2})\b/g)) out.push(Date.UTC(+m[3], +m[2] - 1, +m[1]));
  for (const m of t.matchAll(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]{3})[a-z]*\.?,?\s+(20\d{2})\b/gi)) { const i = MONTHS.indexOf(m[2].toLowerCase()); if (i >= 0) out.push(Date.UTC(+m[3], i, +m[1])); }
  for (const m of t.matchAll(/\b([a-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(20\d{2})\b/gi)) { const i = MONTHS.indexOf(m[1].toLowerCase()); if (i >= 0) out.push(Date.UTC(+m[3], i, +m[2])); }
  return out.filter((d) => !Number.isNaN(d));
}
/** Old news that a newly added website listed as if new: every date in the title has passed, or the file's
 *  name carries an upload time (Unix seconds, as on the AP High Court site) more than 3 weeks ago. */
export function isOver(n: { title: string; url: string }, now = Date.now()): boolean {
  const d = titleDates(n.title);
  if (d.length && d.every((x) => x < now - DAY)) return true;
  const m = /(?:^|[^\d])(1[5-9]\d{8})(?!\d)/.exec(n.url);
  return !!m && +m[1] * 1000 < now - 21 * DAY && +m[1] * 1000 > Date.UTC(2017, 0, 1);
}

/** Latest notices collected from official websites (newest first). Null if the table is not set up yet. */
export async function fetchNotices(limit = 300): Promise<Notice[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('official_notices').select('*').order('first_seen', { ascending: false }).order('id', { ascending: true }).limit(limit);
  if (error || !data) return null;
  return (data as Notice[]).filter((n) => isWebUrl(n.url) && !isOver(n)).map((n) => ({ ...n, url: openUrl(n.url) }));
}

/** Admin-only (enforced by RLS). */
export async function setNoticeStatus(id: number, status: Notice['status'], listingId?: string): Promise<string | null> {
  if (!supabase) return 'Database not available';
  const { error } = await supabase.from('official_notices').update({ status, listing_id: listingId ?? null }).eq('id', id);
  return error ? error.message : null;
}
