// Reads official websites and records new notice links in Supabase (table official_notices).
// Runs on a schedule in GitHub Actions (.github/workflows/notices.yml).
// Sites that refuse servers outside India (marked `india: true`) are read through the
// "collect-notices" Supabase Edge Function in the Mumbai region instead.
// Without SUPABASE_SECRET_KEY it only prints what it found (dry run).
import { appendFileSync } from 'node:fs';
import { NOTICE_SOURCES, type NoticeSource } from '../src/notices/sources';
import { collectSource, errorText, type CollectResult } from '../src/notices/collect';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rimsuaeqnxntgfmbicyb.supabase.co';
const KEY = process.env.SUPABASE_SECRET_KEY || '';
const only = (process.env.ONLY ?? '').split(',').map((s) => s.trim()).filter(Boolean);
let functionMissing = false;

/** Ask the Mumbai Edge Function to read one site. Falls back to reading it directly if the function is not set up. */
async function viaMumbai(src: NoticeSource): Promise<CollectResult & { route: string }> {
  if (KEY && !functionMissing) {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/collect-notices`, {
        method: 'POST', body: JSON.stringify({ only: [src.id] }),
        headers: { apikey: KEY, 'Content-Type': 'application/json', 'x-region': 'ap-south-1',
          ...(KEY.startsWith('sb_') ? {} : { Authorization: `Bearer ${KEY}` }) },
        signal: AbortSignal.timeout(60_000),
      });
      if (res.status === 404) functionMissing = true;
      else if (!res.ok) throw new Error(`function HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      else {
        const body = (await res.json()) as { results: CollectResult[] };
        return { ...body.results[0], route: 'Mumbai' };
      }
    } catch (e) {
      return { id: src.id, ok: false, found: 0, fresh: 0, error: errorText(e), route: 'Mumbai' };
    }
  }
  return { ...(await collectSource(src, SUPABASE_URL, KEY)), route: functionMissing ? 'direct (function not deployed)' : 'direct' };
}

const lines: string[] = ['| Source | Read from | Status | Notices found | New |', '|---|---|---|---|---|'];
let ok = 0, totalNew = 0;
const run = async (src: NoticeSource) => {
  const r = src.india ? await viaMumbai(src) : { ...(await collectSource(src, SUPABASE_URL, KEY)), route: 'GitHub' };
  if (r.ok) {
    ok++; totalNew += r.fresh;
    console.log(`✓ ${src.id} [${r.route}]: ${r.found} notices, ${r.fresh} new`);
    for (const f of r.sample ?? []) console.log(`    · ${f.title}  ${f.url}`);
    lines.push(`| ${src.name} | ${r.route} | ok | ${r.found} | ${KEY ? r.fresh : 'dry run'} |`);
  } else {
    console.log(`✗ ${src.id} [${r.route}]: ${r.error}`);
    lines.push(`| ${src.name} | ${r.route} | failed: ${(r.error ?? '').replace(/\|/g, '/')} | – | – |`);
  }
};
// Read a few sites at a time; each site still gets only one request.
const queue = NOTICE_SOURCES.filter((s) => !only.length || only.includes(s.id));
await Promise.all(Array.from({ length: 5 }, async () => { for (let s = queue.shift(); s; s = queue.shift()) await run(s); }));
const summary = `### Notice collector\n${KEY ? `${totalNew} new notices saved.` : 'Dry run: SUPABASE_SECRET_KEY is not set, nothing was saved.'}` +
  `${functionMissing ? '\n\nThe Mumbai function is not deployed yet, so blocked sites were tried directly. See docs/NOTICES.md.' : ''}\n\n${lines.join('\n')}\n`;
console.log('\n' + summary);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
if (ok === 0) process.exit(1);
