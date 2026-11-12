// Weekly check that every official-site link on MargDisha still opens.
// Fails (so GitHub emails the owner) only when a link is clearly gone: 404/410 or the site name no longer exists.
// Slow, blocked or certificate-problem sites are listed as warnings, since many government sites are flaky or block foreign servers.
import { readFileSync, readdirSync, statSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(f) && !/\.test\./.test(f)) files.push(p);
  }
})('src');

const SKIP = /(margdisha\.com|supabase\.co|googlesyndication|google\.com|googleapis|gstatic|aboutads\.info|w3\.org|example\.)/i;
const urls = new Map();
for (const f of files) {
  for (const m of readFileSync(f, 'utf8').matchAll(/https?:\/\/[^\s'"`)<>\\]+/g)) {
    const u = m[0].replace(/[.,;]+$/, '');
    if (SKIP.test(u) || u.includes('${')) continue;
    if (!urls.has(u)) urls.set(u, f);
  }
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
async function check(u) {
  let last;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const r = await fetch(u, { redirect: 'follow', headers: { 'user-agent': UA, accept: 'text/html,*/*' }, signal: AbortSignal.timeout(25000) });
      r.body?.cancel().catch(() => {});
      if (r.status === 404 || r.status === 410) return { kind: 'broken', note: `HTTP ${r.status}` };
      if (r.status >= 400) last = { kind: 'warn', note: `HTTP ${r.status}` };
      else return { kind: 'ok', note: `HTTP ${r.status}` };
    } catch (e) {
      const code = e?.cause?.code || e?.name || 'error';
      if (code === 'ENOTFOUND') { last = { kind: 'broken', note: 'site name not found' }; await new Promise((s) => setTimeout(s, 3000)); continue; }
      last = { kind: 'warn', note: /CERT|SSL|TLS|SELF_SIGNED|UNABLE_TO/i.test(code) ? 'certificate problem' : code === 'TimeoutError' ? 'timed out' : code };
    }
    await new Promise((s) => setTimeout(s, 3000));
  }
  return last;
}

const list = [...urls.keys()];
const results = [];
let i = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (i < list.length) { const u = list[i++]; results.push({ u, file: urls.get(u), ...(await check(u)) }); }
}));

const broken = results.filter((r) => r.kind === 'broken');
const warn = results.filter((r) => r.kind === 'warn');
const row = (r) => `| ${r.u} | ${r.note} | ${r.file} |`;
const md = [
  '### Official link check',
  `${results.length} links checked: ${results.length - broken.length - warn.length} open, ${broken.length} broken, ${warn.length} could not be reached.`,
  broken.length ? '\n**Broken (fix these):**\n\n| Link | Problem | File |\n|---|---|---|\n' + broken.map(row).join('\n') : '',
  warn.length ? '\n**Could not reach (often temporary, or the site blocks servers outside India):**\n\n| Link | Problem | File |\n|---|---|---|\n' + warn.map(row).join('\n') : '',
].join('\n');
console.log(md);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + '\n');
process.exit(broken.length ? 1 : 0);
