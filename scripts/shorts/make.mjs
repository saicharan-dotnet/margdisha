// Daily notice Shorts, step 1: pick the newest official notices, write a short script for each with Gemini,
// and record the voiceover with Google Text-to-Speech. Output: shorts-out/<id>/{job.json,voice.wav}.
// Facts come only from the notice title and source; the script never adds dates, numbers or promises.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';

const SB = 'https://rimsuaeqnxntgfmbicyb.supabase.co';
const PUB = 'sb_publishable_DsgrdpIRi7RHuOwtqi6RWw_vC7uRw91'; // public read key, same one the website uses
const VKEY = process.env.VERTEX_API_KEY, TTS = process.env.GOOGLE_TTS_API_KEY;
const COUNT = Number(process.env.COUNT || 3);
const DAYS = Number(process.env.DAYS || 3);
const VOICE = process.env.VOICE || 'en-IN-Chirp3-HD-Kore';
const STATE = process.env.STATE || 'state/processed.json';
const OUT = 'shorts-out'; mkdirSync(OUT, { recursive: true });
const done = new Set(existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : []);
// The common RRB website rejects direct visits to its inner getdata pages: link the RRB's own page instead (as on the site).
const openUrl = (u) => { const m = /^https:\/\/rrb\.indianrailways\.gov\.in\/getdata\?.*\bloc=([a-z]+)/i.exec(u); return m ? `https://rrb.indianrailways.gov.in/${m[1].toLowerCase()}` : u; };
const AREA = { job: 'Government jobs', school: 'School admissions', exam: 'Entrance exams', scholarship: 'Scholarships' };

const r = await fetch(`${SB}/rest/v1/official_notices?select=id,url,title,source_id,source_name,sector,area,first_seen,status&status=neq.ignored&order=first_seen.desc&limit=80`,
  { headers: { apikey: PUB, Authorization: `Bearer ${PUB}` } });
const all = r.ok ? await r.json() : [];
if (!r.ok) console.log('Could not read notices:', r.status, await r.text());
const since = Date.now() - DAYS * 864e5;
const JUNK = /^(click here|notice|notices|read more|more|download|view|new|details|apply online|login|home)\b.{0,12}$/i;
// MAIN=1: only new notices from the big exam bodies, made as soon as they appear (the notices job starts this).
const MAIN = process.env.MAIN === '1' || process.env.MAIN === 'true';
const MAIN_IDS = new Set(JSON.parse(readFileSync(new URL('../../src/notices/main-sources.json', import.meta.url), 'utf8')));
const MAIN_SINCE = Date.now() - Number(process.env.MAIN_HOURS || 12) * 36e5;
// Old news must not become a Short. A website added recently lists months of old notices that look new to us, so skip:
// - a notice whose title only mentions dates that have passed (a deadline or exam date already over),
// - a notice whose address carries an upload time (many sites name files by Unix time) more than 3 weeks ago,
// - the first batch a new source listed (src/notices/shorts-skip-before.json: source id -> time of that first run).
const MONTHS = 'jan feb mar apr may jun jul aug sep oct nov dec'.split(' ');
function titleDates(t) {
  const out = [];
  for (const m of t.matchAll(/\b(\d{1,2})[./-](\d{1,2})[./-](20\d{2})\b/g)) out.push(Date.UTC(+m[3], +m[2] - 1, +m[1]));
  for (const m of t.matchAll(/(?:^|[^\d])([0-3]\d)([01]\d)(20\d{2})(?!\d)/g)) if (+m[2] >= 1 && +m[2] <= 12) out.push(Date.UTC(+m[3], +m[2] - 1, +m[1]));
  for (const m of t.matchAll(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]{3})[a-z]*\.?,?\s+(20\d{2})\b/gi)) { const i = MONTHS.indexOf(m[2].toLowerCase()); if (i >= 0) out.push(Date.UTC(+m[3], i, +m[1])); }
  for (const m of t.matchAll(/\b([a-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(20\d{2})\b/gi)) { const i = MONTHS.indexOf(m[1].toLowerCase()); if (i >= 0) out.push(Date.UTC(+m[3], i, +m[2])); }
  return out.filter((d) => !Number.isNaN(d));
}
const DAY = 864e5;
// Three days' grace, so a press note dated yesterday is still news.
const pastOnly = (t) => { const d = titleDates(t); return d.length > 0 && d.every((x) => x < Date.now() - 3 * DAY); };
const oldFile = (u) => { const m = /(?:^|[^\d])(1[5-9]\d{8})(?!\d)/.exec(u); return !!m && +m[1] * 1000 < Date.now() - 21 * DAY && +m[1] * 1000 > Date.UTC(2017, 0, 1); };
const SKIP_BEFORE = JSON.parse(readFileSync(new URL('../../src/notices/shorts-skip-before.json', import.meta.url), 'utf8'));
const backlog = (n) => SKIP_BEFORE[n.source_id] && Date.parse(n.first_seen) <= Date.parse(SKIP_BEFORE[n.source_id]);
// How-to-fill guides and manuals are not news; they repeat the notification they belong to.
const howTo = (n) => /user[\s_-]*guide|user[\s_-]*manual|guidelines?[\s_-]*for[\s_-]*filling|how[\s_-]*to[\s_-]*apply/i.test(`${n.title} ${n.url}`);
const stale = (n) => pastOnly(n.title) || oldFile(n.url) || backlog(n) || howTo(n);
const fresh = all.filter((n) => !stale(n) && (!MAIN || (MAIN_IDS.has(n.source_id) && Date.parse(n.first_seen) >= MAIN_SINCE)) && !done.has(n.id) && Date.parse(n.first_seen) >= since && /^https?:\/\//.test(n.url)
  && n.title && n.title.length >= 20 && n.title.length <= 260 && !JUNK.test(n.title.trim()));
// One per area in turn, so a day's Shorts are not all from the same site.
const byArea = {}; for (const n of fresh) (byArea[n.area] ??= []).push(n);
const picks = []; const areas = Object.keys(byArea);
while (picks.length < COUNT && areas.some((a) => byArea[a].length)) for (const a of areas) if (byArea[a].length && picks.length < COUNT) picks.push(byArea[a].shift());
// REDO=id,id remakes those notices' Shorts (for example after a design change), even if already made.
const REDO = (process.env.REDO || '').split(',').map((x) => x.trim()).filter(Boolean);
if (REDO.length) picks.splice(0, picks.length, ...all.filter((n) => REDO.includes(String(n.id))));
// CHECK=<file>: only write how many Shorts would be made, and stop (no Gemini or voice calls).
if (process.env.CHECK) { writeFileSync(process.env.CHECK, String(picks.length)); console.log(`${picks.length} to make.`); process.exit(0); }
console.log(`${all.length} notices read, ${fresh.length} new and usable, making ${picks.length}.`);

const RULES = `You write scripts for 15-second vertical YouTube Shorts for MargDisha.com, a free Indian website that helps students and parents find school admissions, entrance exams, scholarships and government and private jobs, and links to official notices.
Use ONLY the facts in the notice title and source below. Never invent dates, numbers of posts, fees, eligibility or deadlines. Never promise selection, admission or a job. Today is ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })}. Expand common abbreviations only if certain (for example SSC = Staff Selection Commission). Keep it energetic, clear Indian English.
Return JSON with:
- usable: false if the notice is about something already over (an exam, interview, deadline or event whose date in the title is before today). Otherwise true ONLY if the notice is something a student, parent or job seeker can act on: an application or registration opening, recruitment, admission, admit card, exam date or schedule, result, answer key, merit list, counselling, cut-off or scholarship. false for news stories, events, speeches, visits, awards, tenders, RTI, court cases, internal circulars, user guides or manuals on how to fill a form, menu links or unclear text
- name: the exam, scheme or organisation in at most 22 characters (for example "NVS", "SSC CGL 2026", "TS ePASS")
- badge: what happened in at most 18 characters, chosen from words in the title (for example "Result Out", "Admit Card", "Apply Now", "Answer Key", "New Notice")
- hook: a punchy hook of at most 34 characters
- update: the key update in at most 70 characters, using only the title's facts
- voiceover: at most 38 words; the very first words are the hook (viewers decide to stay or swipe in the first two seconds, so no greeting and no channel name first), then the update, and end exactly with "Official link in the description. Subscribe to Marg Disha for daily updates."
- youtube_title: at most 70 characters, truthful, without hashtags. Most viewers find these videos by searching, so start with the exact words a student would type: the exam or organisation short name, then the year ONLY if it is in the notice title, then the update in plain search words (Admit Card Out, Result Out, Apply Online, Notification, Answer Key, Exam Date, Interview Schedule, Merit List). After that, a few words of detail may follow a " | ". No clickbait words, no emojis, no ALL CAPS sentences. Examples: "SSC CGL 2026 Admit Card Out | Download Steps", "NTPC Deputy Manager Interview Schedule ", "UPSC Online Application Open | ORA Portal "
- summary: two sentences summarising the notice for the video description, only from the title and source; the first sentence starts with the same search words as youtube_title
- pinned_comment: one friendly question (at most 110 characters) that invites viewers to comment, about this exam or update, for example "Which post are you applying for? Tell us in the comments 👇". No promises, no links
- hashtags: exactly 3 hashtags without #, most specific first: the exam or organisation with the update (for example "SSCCHSLAdmitCard"), the exam or organisation (for example "SSCCHSL"), and the broad area (for example "GovernmentJobs")
- tags: 6 to 10 short tags without # (include MargDisha, the exam or organisation name, and 2 or 3 phrases students would search, for example "ssc cgl admit card")`;

// Text models to try, newest first; the first one this Google project can use is kept.
const MODELS = (process.env.TEXT_MODELS || 'gemini-3-flash-preview,gemini-3.0-flash,gemini-2.5-flash,gemini-2.5-flash-lite,gemini-2.0-flash-001,gemini-flash-latest').split(',');
async function gemini(n) {
  const body = { contents: [{ role: 'user', parts: [{ text: `${RULES}\n\nNotice title: ${n.title}\nSource: ${n.source_name}\nArea: ${AREA[n.area] || n.area}\nOfficial link: ${n.url}` }] }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.4 } };
  for (let i = 0; i < 6; i++) {
    const model = MODELS[0];
    const res = await fetch(`https://aiplatform.googleapis.com/v1/publishers/google/models/${model}:generateContent?key=${VKEY}`,
      { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (res.status === 404 && MODELS.length > 1) { console.log(`  ${model} not available, trying ${MODELS[1]}`); MODELS.shift(); i--; continue; }
    const j = await res.json().catch(() => ({}));
    const txt = j.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
    if (txt) { try { return JSON.parse(txt.replace(/^```json|```$/g, '')); } catch { console.log('  bad JSON', txt.slice(0, 200)); } }
    else console.log('  gemini', res.status, JSON.stringify(j.error?.message ?? '').slice(0, 160));
    await new Promise((ok) => setTimeout(ok, res.status === 429 ? 30000 : 3000));
  }
  return null;
}
async function speak(text) {
  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${TTS}`, { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ input: { text }, voice: { languageCode: 'en-IN', name: VOICE }, audioConfig: { audioEncoding: 'LINEAR16', sampleRateHertz: 24000 } }) });
  const j = await res.json().catch(() => ({}));
  if (!j.audioContent) console.log('  tts', res.status, JSON.stringify(j.error?.message ?? '').slice(0, 160));
  return j.audioContent ? Buffer.from(j.audioContent, 'base64') : null;
}
const cut = (s, n) => String(s ?? '').trim().slice(0, n);
// Gemini sometimes returns a list as one string ("a, b, c"): accept both.
const list = (v) => (Array.isArray(v) ? v : String(v ?? '').split(/[,\n]+|\s+(?=#)/)).map((x) => String(x).replace(/^#/, '').trim()).filter(Boolean);
const made = [];
for (const n of picks) {
  console.log(`- [${n.area}] ${n.title} (${n.source_name})`);
  const g = await gemini(n);
  if (!g) { console.log('  skipped (script failed, will retry next run)'); continue; }
  if (g.usable === false) { console.log('  skipped (not a useful notice)'); done.add(n.id); continue; }
  if (!String(g.youtube_title || '').trim() || !String(g.voiceover || '').trim() || !String(g.name || '').trim() || !String(g.summary || '').trim()) { console.log('  skipped (script came back incomplete, will retry next run)'); continue; }
  let vo = String(g.voiceover || '').trim();
  const ENDING = 'Official link in the description. Subscribe to Marg Disha for daily updates.';
  if (!vo.endsWith(ENDING)) vo = vo.replace(/(?:[^.!?]*(?:Marg Disha|description)[^.!?]*[.!]?\s*)+$/i, '').trim().replace(/[.!]?$/, '.') + ' ' + ENDING;
  if (vo.split(/\s+/).length > 48) { console.log('  skipped (voiceover too long)'); continue; }
  const audio = TTS ? await speak(vo) : null;
  if (!audio) { console.log('  skipped (no voice)'); continue; }
  const dir = `${OUT}/${n.id}`; mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/voice.wav`, audio);
  // No #Shorts in the title: YouTube already knows it is a Short, and the space is better spent on search words.
  const title = cut(String(g.youtube_title).replace(/\s*#\w+/g, ''), 70);
  const tags = [...new Set(['MargDisha', ...list(g.tags)])].slice(0, 12);
  // The official link and the website go in the description (the channel is verified, so links are allowed).
  const description = [cut(g.summary, 400), '', `Official notice (${n.source_name}): ${openUrl(n.url)}`, 'More free updates: https://margdisha.com', '',
    'MargDisha collects official notices and links you to the official website for free. Always read the full official notification before applying. We do not guarantee selection or admission.', '',
    'Subscribe for a new official update every day: https://www.youtube.com/@margdishaindia?sub_confirmation=1', '',
    // YouTube shows the first three hashtags above the title, so the most specific ones go first.
    [...new Set([...list(g.hashtags).map((h) => h.replace(/[^\p{L}\p{N}]/gu, '')).filter(Boolean).slice(0, 3), 'MargDisha'])].map((h) => '#' + h).join(' ')].join('\n');
  const pinned = cut(g.pinned_comment, 140) || 'Which exam are you preparing for? Tell us in the comments 👇';
  const job = { id: n.id, area: n.area, areaLabel: AREA[n.area] || 'Updates', source: n.source_name, noticeTitle: n.title, url: openUrl(n.url),
    name: cut(g.name, 24), badge: cut(g.badge, 20), hook: cut(g.hook, 40), update: cut(g.update, 90), voiceover: vo, title, description, tags, pinned };
  writeFileSync(`${dir}/job.json`, JSON.stringify(job, null, 2));
  console.log(`  ok: ${title}`); made.push(n.id); done.add(n.id);
}
mkdirSync(STATE.replace(/\/[^/]+$/, ''), { recursive: true });
writeFileSync(STATE, JSON.stringify([...done].slice(-2000)));
writeFileSync(`${OUT}/made.json`, JSON.stringify(made));
