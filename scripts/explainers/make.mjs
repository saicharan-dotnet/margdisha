// Long explainer videos, step 1: choose a main exam or job, write a 5-8 minute script with Gemini from the
// facts on the website (job calendar, exam guide, school calendar) and the latest official notices, and record
// each scene's voiceover with Google Text-to-Speech (female voice).
// Output: explainer-out/<topic>/{job.json, v01.wav, v02.wav, ...} and explainer-out/made.json.
// Run with: node --experimental-strip-types scripts/explainers/make.mjs
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { JOB_CALENDAR } from '../../src/data/job-calendar.ts';
import { EXAM_GUIDE } from '../../src/data/exam-guide.ts';
import { SCHOOL_CALENDAR } from '../../src/data/school-calendar.ts';

const SB = 'https://rimsuaeqnxntgfmbicyb.supabase.co';
const PUB = 'sb_publishable_DsgrdpIRi7RHuOwtqi6RWw_vC7uRw91'; // public read key, same one the website uses
const VKEY = process.env.VERTEX_API_KEY, TTS = process.env.GOOGLE_TTS_API_KEY;
const VOICE = process.env.VOICE || 'en-IN-Chirp3-HD-Kore';
const COUNT = Number(process.env.COUNT || 1);
const STATE = process.env.STATE || 'state/explainers.json';
const COOLDOWN_DAYS = Number(process.env.COOLDOWN_DAYS || 21); // a big notice remakes a topic only if its last video is older than this
const OUT = 'explainer-out'; mkdirSync(OUT, { recursive: true });
const TOPICS = JSON.parse(readFileSync(new URL('./topics.json', import.meta.url), 'utf8'));
const DATA = { job: JOB_CALENDAR, exam: EXAM_GUIDE, school: SCHOOL_CALENDAR };
const entryOf = (t) => { const [k, id] = t.data.split(':'); return DATA[k].find((e) => e.id === id); };
const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : {};
state.made ??= {}; state.notices ??= [];
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

let notices = [];
try {
  const r = await fetch(`${SB}/rest/v1/official_notices?select=id,url,title,source_id,source_name,first_seen,status&status=neq.ignored&order=first_seen.desc&limit=600`,
    { headers: { apikey: PUB, Authorization: `Bearer ${PUB}` } });
  if (r.ok) notices = await r.json(); else console.log('Could not read notices:', r.status, (await r.text()).slice(0, 200));
} catch (err) { console.log('Could not read notices:', err.cause?.code || err.message); }
const matchRe = (t) => { const m = t.match || entryOf(t)?.match; return m ? new RegExp(m, 'i') : null; };
const noticesFor = (t) => { const re = matchRe(t); return notices.filter((n) => t.sources.includes(n.source_id) && (!re || re.test(n.title || ''))); };

// Which topics to make:
//  TOPIC=ssc-cgl,neet  those topics
//  MAIN=1              a big exam body just posted a new notification (not an admit card or result) for one of the topics
//  otherwise           the topics whose video is oldest (never-made topics first, in the order of topics.json)
const BIG = /notification|recruitment|advertisement|apply online|online application|registration|vacanc|\bCEN\b|employment notice|examination[, ]+20\d\d|exam(ination)? 20\d\d/i;
const NOT_BIG = /admit card|hall ticket|result|answer key|cut[- ]?off|marks|merit list|call letter|city intimation|interview schedule|corrigendum|extension|extended|postpone|resched/i;
let picks = []; let trigger = {};
const TOPIC = (process.env.TOPIC || '').split(',').map((x) => x.trim()).filter(Boolean);
const MAIN = process.env.MAIN === '1' || process.env.MAIN === 'true';
if (TOPIC.length) picks = TOPICS.filter((t) => TOPIC.includes(t.id));
else if (MAIN) {
  const since = Date.now() - Number(process.env.MAIN_HOURS || 12) * 36e5;
  const seen = new Set(state.notices);
  for (const t of TOPICS) {
    const last = Date.parse(state.made[t.id] || 0);
    if (Date.now() - last < COOLDOWN_DAYS * 864e5) continue;
    const n = noticesFor(t).find((n) => !seen.has(n.id) && Date.parse(n.first_seen) >= since && BIG.test(n.title || '') && !NOT_BIG.test(n.title || ''));
    if (n) { picks.push(t); trigger[t.id] = n; }
    if (picks.length >= COUNT) break;
  }
} else picks = [...TOPICS].sort((a, b) => (Date.parse(state.made[a.id] || 0) - Date.parse(state.made[b.id] || 0))).slice(0, COUNT);
// CHECK=<file>: only write how many videos would be made, and stop (no Gemini or voice calls).
if (process.env.CHECK) { writeFileSync(process.env.CHECK, String(picks.length)); console.log(`${picks.length} to make: ${picks.map((t) => t.id).join(', ')}`); process.exit(0); }
console.log(`${notices.length} notices read. Making: ${picks.map((t) => t.id).join(', ') || 'nothing'}`);

const END_LINE = 'That is the complete guide. If it helped you, subscribe to Marg Disha India, because we explain every new notification for free. All official links are in the description below, and your next video is on the screen now.';
const RULES = `You write the script for a 5 to 8 minute YouTube explainer video (16:9, one female narrator) for MargDisha.com, a free Indian website that helps students, parents and job seekers with entrance exams, government and private jobs, school admissions and scholarships, always linking to the official website.
The audience: students and job seekers from small towns in India, many reading English as a second language. Use clear, simple, friendly Indian English, short sentences, no slang.

FACTS. Use the facts given below. You may also explain well-known, long-standing things about this exam or job that you are very sure of (for example what the posts are, the stages of selection, the subjects tested, the kind of questions, and general preparation advice). Never state an exact date, year-specific schedule, number of vacancies, salary figure, fee, cut-off, number of questions, marks or time limit unless it appears in the facts below. When something changes every year, say "usually" or "in recent years" and tell viewers to check the latest official notification. Never promise selection or a job. Never mention coaching centres or paid courses.

Return JSON with:
- youtube_title: at most 90 characters, truthful, no emojis, no hashtags, no ALL CAPS sentences, no clickbait. Most viewers find these videos by searching, so start with the exact words a student types: the exam name, then the year ONLY if it appears in a latest notice title below, then "Notification" if a new notification is listed below or "Complete Guide" otherwise, then a colon and what the video covers in search words, e.g. "SSC CGL 2026 Notification: Eligibility, Exam Pattern, Syllabus, How to Apply"
- sub: one line under the title on screen, at most 60 characters, e.g. "Eligibility · Exam pattern · How to apply"
- summary: 3 sentences for the YouTube description. YouTube shows only the first two lines in search, so the first sentence must contain the exam name and the main search words (eligibility, exam pattern, how to apply)
- hashtags: exactly 3 hashtags without #, most specific first: the exam with the topic (e.g. "SSCCGL2026" or "SSCCGLEligibility"), the exam (e.g. "SSCCGL"), and the broad area (e.g. "GovernmentJobs")
- pinned_comment: one friendly question (at most 110 characters) that invites viewers to comment about this exam, e.g. "Which SSC CGL post is your dream job? Tell us in the comments 👇". No promises, no links
- tags: 10 to 14 short tags without # (include MargDisha and phrases students search, e.g. "ssc cgl eligibility", "ssc cgl exam pattern")
- thumb: { top: the exam name in at most 14 characters (e.g. "SSC CGL"), bottom: 1 or 2 words, at most 14 characters, the strongest reason to click (e.g. "Full Guide", "Who Can Apply", "Exam Pattern") }. The whole thumbnail must read in 3 or 4 big words, so nothing else
- scenes: an array of 12 to 16 scenes, in this order:
  1. {type:"title", say}: 20 to 35 words. No greeting, no "welcome", no channel name: the first sentence states exactly what the viewer will know by the end (e.g. "In the next six minutes you will know if you can apply for SSC CGL, how the exam works, and how to apply step by step.").
  2. Then 10 to 14 body scenes, each {type, h, items, say}, covering in a sensible order: what this exam or job is and what you get; who can apply (education); age limit and relaxation; how selection works, stage by stage (one scene per main stage if there are several); what is tested (subjects); when the notification usually comes (use type "calendar" for this one, ONLY if usual months are given in the facts); how to apply, step by step (type "steps"); documents to keep ready; the latest official notices (only if notices are listed below; name them plainly, never read a web address aloud); preparation tips; common mistakes to avoid. Use type "points" for the rest.
     h: heading of at most 34 characters. items: 3 to 5 short on-screen lines of at most 46 characters each (2 or 3 for "calendar"), which the narrator's lines expand on, in the same order. say: 60 to 95 words of narration.
  3. {type:"end", say}: exactly "${END_LINE}"
In "say", write "Marg Disha dot com" for the website, never read out a web address, and never use bullet symbols, brackets or emojis. Total narration: 800 to 1150 words.`;

const MODELS = (process.env.TEXT_MODELS || 'gemini-3-pro-preview,gemini-2.5-pro,gemini-3-flash-preview,gemini-2.5-flash').split(',');
async function gemini(prompt) {
  const body = { contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.5 } };
  for (let i = 0; i < 6; i++) {
    const model = MODELS[0];
    const res = await fetch(`https://aiplatform.googleapis.com/v1/publishers/google/models/${model}:generateContent?key=${VKEY}`,
      { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if ((res.status === 404 || res.status === 400) && MODELS.length > 1) { console.log(`  ${model} not available (${res.status}), trying ${MODELS[1]}`); MODELS.shift(); i--; continue; }
    const j = await res.json().catch(() => ({}));
    const txt = j.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
    if (txt) { try { return JSON.parse(txt.replace(/^```json|```$/g, '')); } catch { console.log('  bad JSON', txt.slice(0, 200)); } }
    else console.log('  gemini', res.status, JSON.stringify(j.error?.message ?? '').slice(0, 160));
    await new Promise((ok) => setTimeout(ok, res.status === 429 ? 30000 : 3000));
  }
  return null;
}
async function speak(text) {
  for (let i = 0; i < 3; i++) {
    const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${TTS}`, { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ input: { text }, voice: { languageCode: 'en-IN', name: VOICE }, audioConfig: { audioEncoding: 'LINEAR16', sampleRateHertz: 24000 } }) });
    const j = await res.json().catch(() => ({}));
    if (j.audioContent) return Buffer.from(j.audioContent, 'base64');
    console.log('  tts', res.status, JSON.stringify(j.error?.message ?? '').slice(0, 160));
    await new Promise((ok) => setTimeout(ok, 5000));
  }
  return null;
}
// Gemini sometimes returns a list as one comma-separated string.
const list = (x) => (Array.isArray(x) ? x : String(x || '').split(/[,\n]/)).map((v) => String(v).replace(/^#/, '').trim()).filter(Boolean);
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const cut = (s, n) => String(s || '').trim().slice(0, n);
function check(g, hasMonths) {
  const sc = g?.scenes;
  if (!Array.isArray(sc) || sc.length < 10 || sc.length > 18) return 'wrong number of scenes';
  if (sc[0].type !== 'title') return 'first scene is not the title';
  if (!String(g.youtube_title || '').trim() || !g.thumb?.top) return 'title or thumbnail text missing';
  for (const s of sc.slice(1, -1)) {
    if (!['points', 'steps', 'calendar'].includes(s.type)) return `unknown scene type ${s.type}`;
    if (s.type === 'calendar' && !hasMonths) return 'calendar scene without usual months';
    if (!s.h || !Array.isArray(s.items) || s.items.length < 2 || s.items.length > 5) return `scene "${s.h}" has bad items`;
    if (words(s.say) < 25 || words(s.say) > 130) return `scene "${s.h}" narration is ${words(s.say)} words`;
  }
  const total = sc.reduce((n, s) => n + words(s.say), 0);
  if (total < 600 || total > 1400) return `narration is ${total} words`;
  return '';
}

const made = [];
for (const t of picks) {
  const e = entryOf(t); if (!e) { console.log(`- ${t.id}: no data entry ${t.data}`); continue; }
  const latest = noticesFor(t).slice(0, 6);
  const hasMonths = !e.irregular && e.formsFrom && e.formsTo;
  const facts = [`Exam or job: ${e.school}`, `Sector: ${e.sector}`, e.gives && `What it gives: ${e.gives}`, `Who can apply: ${e.who}`, e.joins && `Minimum level: ${e.joins}`,
    hasMonths ? `Usual months the application form is open (past years, may change): ${MON[e.formsFrom - 1]} to ${MON[e.formsTo - 1]}` : 'No fixed yearly cycle: notified only when there are vacancies (do not use a calendar scene)',
    `Selection: ${e.selection}`, e.state && `State: ${e.state}`, e.note && `Note: ${e.note}`, `Official website: ${e.url}`,
    e.steps?.length && `How to apply (official process):\n${e.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
    latest.length ? `Latest official notices collected by MargDisha (newest first):\n${latest.map((n) => `- ${n.title} (${n.source_name}, first seen ${n.first_seen.slice(0, 10)})`).join('\n')}` : 'No recent official notices collected (skip the latest notices scene).',
  ].filter(Boolean).join('\n');
  console.log(`- ${t.id}: ${e.school}`);
  let g = null, why = '';
  for (let k = 0; k < 3; k++) {
    g = await gemini(`${RULES}\n\nTopic: ${t.name}\n\nFACTS\n${facts}${why ? `\n\nYour last answer was rejected: ${why}. Fix that.` : ''}`);
    why = g ? check(g, hasMonths) : 'no answer';
    if (!why) break; console.log(`  script rejected: ${why}`);
  }
  if (why) { console.log('  skipped (no usable script, will retry next run)'); continue; }
  const scenes = g.scenes.filter((s) => s.type !== 'end').map((s) => ({ type: s.type, h: cut(s.h, 40), items: (s.items || []).map((x) => cut(x, 52)), say: String(s.say).trim().replace(/\s+/g, ' ') }));
  scenes[0] = { type: 'title', say: String(g.scenes[0].say).trim() };
  scenes.push({ type: 'end', say: END_LINE });
  const dir = `${OUT}/${t.id}`; mkdirSync(dir, { recursive: true });
  let ok = true;
  for (let i = 0; i < scenes.length && ok; i++) {
    const a = TTS ? await speak(scenes[i].say) : null;
    if (!a) { ok = false; break; }
    writeFileSync(`${dir}/v${String(i + 1).padStart(2, '0')}.wav`, a);
  }
  if (!ok) { console.log('  skipped (no voice)'); continue; }
  const tags = [...new Set(['MargDisha', ...list(g.tags).map((x) => String(x).replace(/^#/, '').trim()).filter(Boolean)])].slice(0, 15);
  const job = { id: t.id, name: t.name, entry: e.school, kind: t.data.split(':')[0], bg: t.bg, url: e.url, months: hasMonths ? [e.formsFrom, e.formsTo] : null,
    title: cut(g.youtube_title, 100), sub: cut(g.sub, 64), summary: cut(g.summary, 700), tags, thumb: { top: cut(g.thumb.top, 16), bottom: cut(g.thumb.bottom, 16) },
    hashtags: list(g.hashtags).map((h) => h.replace(/[^\p{L}\p{N}]/gu, '')).filter(Boolean).slice(0, 3),
    pinned: cut(g.pinned_comment, 140) || `Which ${t.name} topic should we explain next? Tell us in the comments 👇`,
    notices: latest.map((n) => ({ title: n.title, url: n.url, source: n.source_name, date: n.first_seen.slice(0, 10) })), trigger: trigger[t.id] ? { title: trigger[t.id].title, url: trigger[t.id].url } : null, scenes };
  writeFileSync(`${dir}/job.json`, JSON.stringify(job, null, 2));
  console.log(`  ok: ${job.title} (${scenes.length} scenes, ${scenes.reduce((n, s) => n + words(s.say), 0)} words)`);
  made.push(t.id); state.made[t.id] = new Date().toISOString();
  if (trigger[t.id]) state.notices.push(trigger[t.id].id);
}
state.notices = state.notices.slice(-500);
mkdirSync(STATE.replace(/\/[^/]+$/, ''), { recursive: true });
writeFileSync(STATE, JSON.stringify(state, null, 1));
writeFileSync(`${OUT}/made.json`, JSON.stringify(made));
