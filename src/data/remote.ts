import { supabase } from '../lib/supabase';
import type { Opportunity, Profile } from './types';
import { oppToRow, rowToOpp, type OppRow } from './remote-map';

const COLS = 'id,kind,scope,sector,title,provider,summary,criteria,details,deadline,source_url,source_label,published_on,last_verified_on,verified_by,status,sample';

export async function fetchOpportunities(): Promise<Opportunity[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('opportunities').select(COLS).order('deadline', { ascending: true, nullsFirst: false });
  if (error || !data) return null;
  return (data as unknown as OppRow[]).map(rowToOpp);
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
