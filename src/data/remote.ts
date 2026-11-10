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

/** Latest notices collected from official websites (newest first). Null if the table is not set up yet. */
export async function fetchNotices(limit = 300): Promise<Notice[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('official_notices').select('*').order('first_seen', { ascending: false }).order('id', { ascending: true }).limit(limit);
  if (error || !data) return null;
  return (data as Notice[]).filter((n) => isWebUrl(n.url));
}

/** Admin-only (enforced by RLS). */
export async function setNoticeStatus(id: number, status: Notice['status'], listingId?: string): Promise<string | null> {
  if (!supabase) return 'Database not available';
  const { error } = await supabase.from('official_notices').update({ status, listing_id: listingId ?? null }).eq('id', id);
  return error ? error.message : null;
}
