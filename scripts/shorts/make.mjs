// Daily notice Shorts, step 1: pick the newest official notices, write a short script for each with Gemini,
// and record the voiceover with Google Text-to-Speech. Output: shorts-out/<id>/{job.json,voice.wav}.
// Facts come only from the notice title and source; the script never adds dates, numbers or promises.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';

const SB = 'https://rimsuaeqnxntgfmbicyb.supabase.co';
const PUB = 'sb_publishable_DsgrdpIRi7RHuOwtqi6RWw_vC7uRw91'; // public read key, same one the website uses
const VKEY = process.env.VERTEX_API_KEY, TTS = process.env.GOOGLE_TTS_API_KEY;
const COUNT = Number(process.env.COUNT || 3);
const DAYS = Number(process.env.DAYS || 3);
const VOICE = process.env.VOICE || 'en-IN-Chirp3-HD-Charon';
const STATE = process.env.STATE || 'state/processed.json';
const OUT = 'shorts-out'; mkdirSync(OUT, { recursive: true });
const done = new Set(existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : []);
const AREA = { job: 'Government jobs', school: 'School admissions', exam: 'Entrance exams', scholarship: 'Scholarships' };

const r = await fetch(`${SB}/rest/v1/official_notices?select=id,url,title,source_name,sector,area,first_seen,status&status=neq.ignored&order=first_seen.desc&limit=80`,
  { headers: { apikey: PUB, Authorization: `Bearer ${PUB}` } });
const all = r.ok ? await r.json() : [];
if (!r.ok) console.log('Could not read notices:', r.status, await r.text());
const since = Date.now() - DAYS * 864e5;
const JUNK = /^(click here|notice|notices|read more|more|download|view|new|details|apply online|login|home)\b.{0,12}$/i;
const fresh = all.filter((n) => !done.has(n.id) && Date.parse(n.first_seen) >= since && /^https?:\/\//.test(n.url)
  && n.title && n.title.length >= 20 && n.title.length <= 260 && !JUNK.test(n.title.trim()));
// One per area in turn, so a day's Shorts are not all from the same site.
const byArea = {}; for (const n of fresh) (byArea[n.area] ??= []).push(n);
const picks = []; const areas = Object.keys(byArea);
while (picks.length < COUNT && areas.some((a) => byArea[a].length)) for (const a of areas) if (byArea[a].length && picks.length < COUNT) picks.push(byArea[a].shift());
console.log(`${all.length} notices read, ${fresh.length} new and usable, making ${picks.length}.`);

const RULES = `You write scripts for 15-second vertical YouTube Shorts for MargDisha.com, a free Indian website that helps students and parents find school admissions, entrance exams, scholarships and government and private jobs, and links to official notices.
Use ONLY the facts in the notice title and source below. Never invent dates, numbers of posts, fees, eligibility or deadlines. Never promise selection, admission or a job. Expand common abbreviations only if certain (for example SSC = Staff Selection Commission). Keep it energetic, clear Indian English.
Return JSON with:
- usable: false if the title is not a real notice students would care about (for example a menu link, tender, RTI, court case, or unclear text); else true
- name: the exam, scheme or organisation in at most 22 characters (for example "NVS", "SSC CGL 2026", "TS ePASS")
- badge: what happened in at most 18 characters, chosen from words in the title (for example "Result Out", "Admit Card", "Apply Now", "Answer Key", "New Notice")
- hook: a punchy hook of at most 34 characters
- update: the key update in at most 70 characters, using only the title's facts
- voiceover: at most 36 words; start with the hook, state the update, end exactly with "Check the official notice free on Marg Disha dot com."
- youtube_title: at most 62 characters, high click-through but truthful, ends with " #Shorts"
- summary: two sentences summarising the notice for the video description, only from the title and source
- tags: 6 to 10 short tags without # (include MargDisha and the exam or organisation name)`;

async function gemini(n) {
  const body = { contents: [{ role: 'user', parts: [{ text: `${RULES}\n\nNotice title: ${n.title}\nSource: ${n.source_name}\nArea: ${AREA[n.area] || n.area}\nOfficial link: ${n.url}` }] }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.4 } };
  for (let i = 0; i < 4; i++) {
    const res = await fetch(`https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash:generateContent?key=${VKEY}`,
      { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
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
const cut = (s, n) => (s || '').trim().slice(0, n);
const made = [];
for (const n of picks) {
  console.log(`- [${n.area}] ${n.title} (${n.source_name})`);
  const g = await gemini(n);
  if (!g || g.usable === false) { console.log('  skipped (not usable)'); done.add(n.id); continue; }
  let vo = String(g.voiceover || '').trim();
  if (!/Marg Disha dot com\.?$/i.test(vo)) vo = vo.replace(/[.!]?$/, '.') + ' Check the official notice free on Marg Disha dot com.';
  if (vo.split(/\s+/).length > 44) { console.log('  skipped (voiceover too long)'); continue; }
  const audio = TTS ? await speak(vo) : null;
  if (!audio) { console.log('  skipped (no voice)'); continue; }
  const dir = `${OUT}/${n.id}`; mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/voice.wav`, audio);
  let title = cut(g.youtube_title, 70); if (!/#Shorts$/.test(title)) title = cut(title.replace(/\s*#Shorts$/i, ''), 61) + ' #Shorts';
  const tags = [...new Set(['MargDisha', 'EducationUpdates', 'Shorts', ...(g.tags || []).map((t) => String(t).replace(/^#/, '').trim()).filter(Boolean)])].slice(0, 12);
  const description = [cut(g.summary, 400), '',
    `Official notice: ${n.url}`, `Source: ${n.source_name}`, '',
    'MargDisha collects official notices and links you to the official website for free. Always read the full official notification before applying. We do not guarantee selection or admission.', '',
    'Find exams, jobs, school admissions and scholarships free: https://margdisha.com', '', tags.map((t) => '#' + t.replace(/\s+/g, '')).join(' ')].join('\n');
  const job = { id: n.id, area: n.area, areaLabel: AREA[n.area] || 'Updates', source: n.source_name, noticeTitle: n.title, url: n.url,
    name: cut(g.name, 24), badge: cut(g.badge, 20), hook: cut(g.hook, 40), update: cut(g.update, 90), voiceover: vo, title, description, tags };
  writeFileSync(`${dir}/job.json`, JSON.stringify(job, null, 2));
  console.log(`  ok: ${title}`); made.push(n.id); done.add(n.id);
}
mkdirSync(STATE.replace(/\/[^/]+$/, ''), { recursive: true });
writeFileSync(STATE, JSON.stringify([...done].slice(-2000)));
writeFileSync(`${OUT}/made.json`, JSON.stringify(made));
