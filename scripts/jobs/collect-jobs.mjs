// Collects fresher and entry-level jobs in India from companies' official job boards
// (Greenhouse, Lever and Ashby publish them as public JSON for exactly this kind of use).
// Writes src/data/live-jobs.json. Each job keeps the date we first saw it and drops off
// 14 days later, or as soon as the company removes it.
// DISCOVER=1 prints how many India jobs each board has, to choose which boards to keep.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { BOARDS } from './boards.mjs';

const OUT = 'src/data/live-jobs.json';
const KEEP_DAYS = 14;
const DISCOVER = process.env.DISCOVER === '1';
const today = new Date().toISOString().slice(0, 10);

const INDIA = /\b(india|bengaluru|bangalore|hyderabad|chennai|mumbai|pune|gurugram|gurgaon|noida|delhi|new delhi|kolkata|ahmedabad|jaipur|kochi|coimbatore|visakhapatnam|vizag|vijayawada|indore|chandigarh|mysuru|mysore|trivandrum|thiruvananthapuram|bhubaneswar|lucknow|nagpur)\b/i;
const SENIOR = /\b(senior|sr\.?|lead|principal|staff|manager|director|head|architect|vp|vice president|chief|expert|specialist ii|ii|iii|iv|sde[- ]?(2|3)|l[4-9])\b/i;
// Titles that are entry-level on their own. Others (associate, analyst, executive ...) only count when
// the description asks for 0 or 1 years of experience.
const ENTRY = /\b(intern(ship)?|trainee|fresher|graduate|new grad|entry[- ]level|junior|jr\.?|apprentice(ship)?|campus|sde[- ]?1|engineer i|level 1|l1)\b/i;
const NOT_ENTRY = /\b(enterprise|majors?|strategic|mid[- ]market|commercial|account executive)\b/i;
const strip = (h = '') => h.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ');
/** Smallest "N years" or "N-M years" of experience mentioned in the description, if any. */
function minYears(text) {
  let min = null;
  for (const m of text.matchAll(/(\d{1,2})\s*(?:\+|-|–|to)?\s*(\d{1,2})?\s*\+?\s*(?:years|yrs)/gi)) {
    const n = Number(m[1]); if (n <= 15 && (min === null || n < min)) min = n;
  }
  if (/\b(fresher|freshers|no experience|0 years)\b/i.test(text)) min = 0;
  return min;
}
function entryLevel(title, text) {
  if (SENIOR.test(title) || NOT_ENTRY.test(title)) return false;
  const y = minYears(text);
  if (y !== null) return y <= 1;
  return ENTRY.test(title);
}

async function getJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'MargDisha job collector (https://margdisha.com)' }, signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function readBoard(b) {
  if (b.ats === 'greenhouse') {
    const d = await getJson(`https://boards-api.greenhouse.io/v1/boards/${b.slug}/jobs?content=true`);
    return d.jobs.map((j) => ({ id: `gh-${b.slug}-${j.id}`, title: j.title, location: j.location?.name ?? '', url: j.absolute_url, posted: (j.updated_at ?? '').slice(0, 10), text: strip(j.content) }));
  }
  if (b.ats === 'lever') {
    const d = await getJson(`https://api.lever.co/v0/postings/${b.slug}?mode=json`);
    return d.map((j) => ({ id: `lv-${b.slug}-${j.id}`, title: j.text, location: [j.categories?.location, ...(j.categories?.allLocations ?? [])].filter(Boolean).join(', '), url: j.hostedUrl, posted: new Date(j.createdAt).toISOString().slice(0, 10), text: strip(j.descriptionPlain ?? j.description) + ' ' + strip((j.lists ?? []).map((l) => l.content).join(' ')), commitment: j.categories?.commitment }));
  }
  if (b.ats === 'ashby') {
    const d = await getJson(`https://api.ashbyhq.com/posting-api/job-board/${b.slug}`);
    return d.jobs.filter((j) => j.isListed !== false).map((j) => ({ id: `ab-${b.slug}-${j.id}`, title: j.title, location: [j.location, ...(j.secondaryLocations ?? []).map((s) => s.location)].filter(Boolean).join(', '), url: j.jobUrl, posted: (j.publishedAt ?? '').slice(0, 10), text: strip(j.descriptionPlain ?? j.descriptionHtml), commitment: j.employmentType }));
  }
  throw new Error('unknown board type ' + b.ats);
}

const old = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { jobs: [] };
const firstSeen = new Map(old.jobs.map((j) => [j.id, j.firstSeen]));
const jobs = []; const report = [];
const queue = [...BOARDS];
await Promise.all(Array.from({ length: 6 }, async () => {
  for (let b = queue.shift(); b; b = queue.shift()) {
    try {
      const all = await readBoard(b);
      const india = all.filter((j) => INDIA.test(j.location));
      const entry = india.filter((j) => entryLevel(j.title, j.text));
      report.push(`${b.ats}/${b.slug}: ${all.length} jobs, ${india.length} in India, ${entry.length} entry-level`);
      if (DISCOVER) entry.slice(0, 4).forEach((j) => report.push(`    · ${j.title} | ${j.location}`));
      for (const j of entry) {
        const seen = firstSeen.get(j.id) ?? today;
        const expires = new Date(new Date(seen + 'T00:00:00Z').getTime() + KEEP_DAYS * 864e5).toISOString().slice(0, 10);
        if (expires < today) continue;
        const intern = /\bintern(ship)?\b/i.test(j.title) || /intern/i.test(j.commitment ?? '');
        jobs.push({ id: j.id, title: j.title.trim(), company: b.name, location: j.location.replace(/\s+/g, ' ').trim().slice(0, 120), url: j.url, intern, firstSeen: seen, expires, source: `${b.name} careers` });
      }
    } catch (e) {
      report.push(`${b.ats}/${b.slug}: FAILED ${e.message}`);
    }
  }
}));
report.sort();
console.log(report.join('\n'));
jobs.sort((a, b) => b.firstSeen.localeCompare(a.firstSeen) || a.company.localeCompare(b.company));
console.log(`\n${jobs.length} entry-level jobs in India kept.`);
if (!DISCOVER) {
  const body = { updated: today, jobs };
  const same = JSON.stringify(old.jobs) === JSON.stringify(jobs);
  if (!same) writeFileSync(OUT, JSON.stringify(body, null, 1) + '\n');
  console.log(same ? 'No change.' : `Wrote ${OUT}.`);
}
