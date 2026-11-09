// Reads official websites and records new notice links in Supabase (table official_notices).
// Runs on a schedule in GitHub Actions (.github/workflows/notices.yml).
// Without SUPABASE_SECRET_KEY it only prints what it found (dry run).
import { appendFileSync } from 'node:fs';
import { NOTICE_SOURCES } from '../src/notices/sources';
import { extractLinks, pickNotices, type FoundNotice } from '../src/notices/extract';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rimsuaeqnxntgfmbicyb.supabase.co';
const KEY = process.env.SUPABASE_SECRET_KEY || '';
const only = (process.env.ONLY ?? '').split(',').map((s) => s.trim()).filter(Boolean);

async function fetchPage(url: string): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30_000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: 'follow', headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MargDishaNoticeBot/1.0; +https://margdisha.com)',
      'Accept': 'text/html,application/xhtml+xml', 'Accept-Language': 'en-IN,en;q=0.9' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally { clearTimeout(timer); }
}

async function save(rows: object[]): Promise<number> {
  const headers: Record<string, string> = { apikey: KEY, 'Content-Type': 'application/json', Prefer: 'resolution=ignore-duplicates,return=representation' };
  if (!KEY.startsWith('sb_')) headers.Authorization = `Bearer ${KEY}`; // legacy JWT service_role key
  const res = await fetch(`${SUPABASE_URL}/rest/v1/official_notices?on_conflict=url&select=id`, { method: 'POST', headers, body: JSON.stringify(rows) });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return ((await res.json()) as unknown[]).length;
}

const lines: string[] = ['| Source | Status | Notices found | New |', '|---|---|---|---|'];
let ok = 0, totalNew = 0;
for (const src of NOTICE_SOURCES.filter((s) => !only.length || only.includes(s.id))) {
  let found: FoundNotice[] = [];
  try {
    const html = await fetchPage(src.url);
    found = pickNotices(extractLinks(html, src.url), src);
    let fresh = 0;
    if (KEY && found.length)
      fresh = await save(found.map((f) => ({ url: f.url, title: f.title, source_id: src.id, source_name: src.name, sector: src.sector ?? null, area: src.area })));
    ok++; totalNew += fresh;
    console.log(`✓ ${src.id}: ${found.length} notices, ${fresh} new`);
    for (const f of found.slice(0, 5)) console.log(`    · ${f.title}  ${f.url}`);
    lines.push(`| ${src.name} | ok | ${found.length} | ${KEY ? fresh : 'dry run'} |`);
  } catch (e) {
    const cause = e instanceof Error && e.cause ? ` (${(e.cause as { code?: string; message?: string }).code ?? ''} ${(e.cause as Error).message ?? ''})` : '';
    const msg = (e instanceof Error ? (e.name === 'AbortError' ? 'timed out' : e.message) : String(e)) + cause;
    console.log(`✗ ${src.id}: ${msg}`);
    lines.push(`| ${src.name} | failed: ${msg.replace(/\|/g, '/')} | – | – |`);
  }
}
const summary = `### Notice collector\n${KEY ? `${totalNew} new notices saved.` : 'Dry run: SUPABASE_SECRET_KEY is not set, nothing was saved.'}\n\n${lines.join('\n')}\n`;
console.log('\n' + summary);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
if (ok === 0) process.exit(1);
