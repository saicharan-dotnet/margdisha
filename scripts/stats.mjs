// Prints how many people have signed up on MargDisha. Counts only, no names or emails.
const URL = process.env.SUPABASE_URL || 'https://rimsuaeqnxntgfmbicyb.supabase.co';
const KEY = process.env.SUPABASE_SECRET_KEY;
if (!KEY) { console.log('SUPABASE_SECRET_KEY is not set'); process.exit(1); }
const h = { apikey: KEY, authorization: `Bearer ${KEY}` };

let total = 0, last7 = 0, last1 = 0, signedInWeek = 0;
const now = Date.now(), day = 86400000;
for (let page = 1; page < 200; page++) {
  const r = await fetch(`${URL}/auth/v1/admin/users?page=${page}&per_page=1000`, { headers: h });
  if (!r.ok) { console.log('auth list failed', r.status); break; }
  const { users = [] } = await r.json();
  for (const u of users) {
    total++;
    const c = Date.parse(u.created_at);
    if (now - c < 7 * day) last7++;
    if (now - c < day) last1++;
    if (u.last_sign_in_at && now - Date.parse(u.last_sign_in_at) < 7 * day) signedInWeek++;
  }
  if (users.length < 1000) break;
}
async function count(table) {
  const r = await fetch(`${URL}/rest/v1/${table}?select=*`, { method: 'HEAD', headers: { apikey: KEY, prefer: 'count=exact', range: '0-0' } });
  return r.headers.get('content-range')?.split('/')[1] ?? `error ${r.status}`;
}
const lines = [
  '### MargDisha sign-ups',
  `| | Count |`, `|---|---|`,
  `| Accounts in total | ${total} |`,
  `| New in the last 24 hours | ${last1} |`,
  `| New in the last 7 days | ${last7} |`,
  `| Signed in during the last 7 days | ${signedInWeek} |`,
  `| Saved profiles | ${await count('profiles')} |`,
  `| Saved items (bookmarks) | ${await count('saved_items')} |`,
];
console.log(lines.join('\n'));
if (process.env.GITHUB_STEP_SUMMARY) (await import('node:fs')).appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
