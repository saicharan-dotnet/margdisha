// Shared by the GitHub Actions script (Node) and the Supabase Edge Function (Deno).
import type { NoticeSource } from './sources';
import { extractLinks, isOfficialLink, pickNotices, type FoundNotice } from './extract';

export async function fetchPage(url: string, timeoutMs = 25_000): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: 'follow', headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MargDishaNoticeBot/1.0; +https://margdisha.com)',
      'Accept': 'text/html,application/xhtml+xml', 'Accept-Language': 'en-IN,en;q=0.9' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally { clearTimeout(timer); }
}

const keyHeaders = (key: string): Record<string, string> =>
  key.startsWith('sb_') ? { apikey: key } : { apikey: key, Authorization: `Bearer ${key}` }; // legacy JWT keys need both

/** Insert notices, skipping links already saved. Returns how many were new. */
export async function saveNotices(supabaseUrl: string, key: string, rows: object[]): Promise<number> {
  const res = await fetch(`${supabaseUrl}/rest/v1/official_notices?on_conflict=url&select=id`, {
    method: 'POST', body: JSON.stringify(rows),
    headers: { ...keyHeaders(key), 'Content-Type': 'application/json', Prefer: 'resolution=ignore-duplicates,return=representation' } });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return ((await res.json()) as unknown[]).length;
}

/** True only for a key that may write notices (the secret key). The anon/publishable key is refused by the database. */
export async function canWrite(supabaseUrl: string, key: string): Promise<boolean> {
  if (!key) return false;
  const res = await fetch(`${supabaseUrl}/rest/v1/official_notices?id=eq.-1`, {
    method: 'PATCH', body: JSON.stringify({ status: 'new' }), headers: { ...keyHeaders(key), 'Content-Type': 'application/json' } });
  return res.ok;
}

export interface CollectResult { id: string; ok: boolean; found: number; fresh: number; error?: string; sample?: FoundNotice[] }

export function errorText(e: unknown): string {
  const c = (e as { cause?: { code?: string; message?: string } } | null)?.cause;
  const cause = c ? ` (${c.code ?? ''} ${c.message ?? ''})` : '';
  return (e instanceof Error ? (e.name === 'AbortError' ? 'timed out' : e.message) : String(e)) + cause;
}

/** Read one source and save what it lists. With no key, nothing is saved (dry run). */
export async function collectSource(src: NoticeSource, supabaseUrl: string, key: string): Promise<CollectResult> {
  try {
    const html = await fetchPage(src.url);
    const found = pickNotices(extractLinks(html, src.url).filter((l) => isOfficialLink(l.url, src.url)), src);
    const fresh = key && found.length
      ? await saveNotices(supabaseUrl, key, found.map((f) => ({ url: f.url, title: f.title, source_id: src.id, source_name: src.name, sector: src.sector ?? null, area: src.area })))
      : 0;
    return { id: src.id, ok: true, found: found.length, fresh, sample: found.slice(0, 5) };
  } catch (e) {
    return { id: src.id, ok: false, found: 0, fresh: 0, error: errorText(e) };
  }
}
