// Shared by the GitHub Actions script (Node) and the Supabase Edge Function (Deno).
import type { NoticeSource } from './sources';
import { extractLinks, isOfficialLink, pickNotices, type FoundNotice } from './extract';

export async function fetchPage(url: string, timeoutMs = 25_000, depth = 0): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: 'follow', headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MargDishaNoticeBot/1.0; +https://margdisha.com)',
      'Accept': 'text/html,application/xhtml+xml', 'Accept-Language': 'en-IN,en;q=0.9' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    // Some sites answer with a tiny page that only redirects (<meta http-equiv="refresh" ... URL=...>).
    const refresh = html.length < 2000 && /<meta[^>]+http-equiv=["']?refresh[^>]+url=([^"'>\s]+)/i.exec(html);
    if (refresh && depth < 2) return fetchPage(new URL(refresh[1], res.url || url).toString(), timeoutMs, depth + 1);
    return html;
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

export interface CollectResult { id: string; ok: boolean; found: number; fresh: number; error?: string; sample?: FoundNotice[];
  /** Diagnostics only: page size, start of the page, and every link before filtering. */
  debug?: { bytes: number; head: string; links: FoundNotice[]; apis?: string[] } }

export function errorText(e: unknown): string {
  const c = (e as { cause?: { code?: string; message?: string } } | null)?.cause;
  const cause = c ? ` (${c.code ?? ''} ${c.message ?? ''})` : '';
  return (e instanceof Error ? (e.name === 'AbortError' ? 'timed out' : e.message) : String(e)) + cause;
}

/** Read one source and save what it lists. With no key, nothing is saved (dry run). */
export async function collectSource(src: NoticeSource, supabaseUrl: string, key: string, debug = false): Promise<CollectResult> {
  try {
    const html = await fetchPage(src.url);
    const all = extractLinks(html, src.url);
    const found = pickNotices(all.filter((l) => isOfficialLink(l.url, src.url)), src);
    if (debug) return { id: src.id, ok: true, found: found.length, fresh: 0, sample: found,
      debug: { bytes: html.length, head: html.replace(/\s+/g, ' ').slice(0, html.length < 10_000 ? 6000 : 600), links: all.slice(0, 150),
        apis: await findApis(html, src.url) } };
    const fresh = key && found.length
      ? await saveNotices(supabaseUrl, key, found.map((f) => ({ url: f.url, title: f.title, source_id: src.id, source_name: src.name, sector: src.sector ?? null, area: src.area })))
      : 0;
    return { id: src.id, ok: true, found: found.length, fresh, sample: found.slice(0, 5) };
  } catch (e) {
    return { id: src.id, ok: false, found: 0, fresh: 0, error: errorText(e) };
  }
}

/** Diagnostics for script-built pages: look inside the page's scripts for data addresses. */
async function findApis(html: string, base: string): Promise<string[]> {
  const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((m) => new URL(m[1], base).toString())
    .filter((u) => new URL(u).hostname === new URL(base).hostname).slice(0, 4);
  const out = new Set<string>();
  for (const u of scripts) {
    try {
      const js = await fetchPage(u, 20_000);
      for (const m of js.matchAll(/["'`]((?:https?:\/\/[^"'`\s]*)?\/[A-Za-z0-9_\-./]*(?:api|notice|notification|advert|latest|news|whatsnew|recruit)[A-Za-z0-9_\-./?=&]*)["'`]/gi)) {
        if (m[1].length < 160 && !/\.pdf$/i.test(m[1])) out.add(m[1]);
        if (out.size > 60) break;
      }
      // Where the script builds its request addresses (base URL + path).
      for (const m of js.matchAll(/(?:baseURL|apiUrl|API_URL|apiBase|BASE_URL|baseUrl|environment)[^;]{0,160}/g)) { out.add('ctx: ' + m[0].slice(0, 170)); if (out.size > 100) break; }
      for (const m of js.matchAll(/.{0,90}(?:getNotifications|whatsNew|latestNews|notice-board|noticeboard|getLatest).{0,90}/gi)) { out.add('ctx: ' + m[0]); if (out.size > 120) break; }
    } catch { /* skip */ }
  }
  return [...out];
}
