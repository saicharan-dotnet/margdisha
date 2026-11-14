// Makes the pictures and voices for the "two students" ad with Google AI.
// Run by the "Make ad assets" workflow, which reads the keys from GitHub secrets.
// Output goes to ad-out/ and is pushed to the ad-assets branch (never to main).
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';

const VERTEX = process.env.VERTEX_API_KEY, TTS = process.env.GOOGLE_TTS_API_KEY;
const OUT = 'ad-out'; mkdirSync(OUT, { recursive: true });
const log = [];
const note = (s) => { console.log(s); log.push(s); };

// ---------- pictures ----------
const BASE = 'Photorealistic vertical photo, 9:16. Two Indian college students, about 19 years old, sitting together on a bench on a green college campus in Telangana, soft afternoon light, natural skin, realistic faces, shallow depth of field. On the left a young man named Ravi with short black hair, light blue shirt. On the right a young woman named Priya with long black hair in a braid, orange kurta, small bindi. No text, no logos, no watermark.';
const SHOTS = [
  ['scene-confused', null, BASE + ' Both look worried and confused, Ravi holds a printed exam result sheet and scratches his head, Priya frowns thoughtfully.'],
  ['scene-idea', 'scene-confused', 'Edit this photo: keep the same two people, same faces, clothes and place. Priya now holds up her smartphone with an excited "I have an idea" expression, Ravi looks at her curiously. No text.'],
  ['scene-phone', 'scene-confused', 'Edit this photo: keep the same two people, same faces, clothes and place. Both lean in together looking at Priya\'s smartphone screen, interested and starting to smile. No text.'],
  ['scene-happy', 'scene-confused', 'Edit this photo: keep the same two people, same faces, clothes and place. Both are smiling happily and relieved, Ravi gives a thumbs up, Priya holds her phone. No text.'],
  ['ravi-face', 'scene-confused', 'Make a close-up head-and-shoulders portrait of the young man on the left (Ravi) from this photo, same face, smiling slightly, plain soft campus background, square 1:1.'],
  ['priya-face', 'scene-confused', 'Make a close-up head-and-shoulders portrait of the young woman on the right (Priya) from this photo, same face, smiling slightly, plain soft campus background, square 1:1.'],
];
async function geminiImage(prompt, refPath, aspect) {
  const parts = [{ text: prompt }];
  if (refPath) parts.unshift({ inlineData: { mimeType: 'image/png', data: readFileSync(refPath).toString('base64') } });
  for (const model of ['gemini-2.5-flash-image', 'gemini-2.5-flash-image-preview']) {
    const r = await fetch(`https://aiplatform.googleapis.com/v1/publishers/google/models/${model}:generateContent?key=${VERTEX}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: aspect } } }),
    });
    const j = await r.json().catch(() => ({}));
    const img = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data;
    if (img) return { img, model };
    note(`  ${model}: HTTP ${r.status} ${JSON.stringify(j.error?.message ?? j.candidates?.[0]?.finishReason ?? '').slice(0, 200)}`);
  }
  return null;
}
async function imagen(prompt, aspect) {
  for (const model of ['imagen-4.0-generate-001', 'imagen-3.0-generate-002']) {
    const r = await fetch(`https://aiplatform.googleapis.com/v1/publishers/google/models/${model}:predict?key=${VERTEX}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio: aspect, personGeneration: 'allow_adult' } }),
    });
    const j = await r.json().catch(() => ({}));
    const img = j.predictions?.[0]?.bytesBase64Encoded;
    if (img) return { img, model };
    note(`  ${model}: HTTP ${r.status} ${JSON.stringify(j.error?.message ?? '').slice(0, 200)}`);
  }
  return null;
}
if (VERTEX) {
  for (const [name, ref, prompt] of SHOTS) {
    const aspect = name.endsWith('face') ? '1:1' : '9:16';
    const refPath = ref ? `${OUT}/${ref}.png` : null;
    let res = await geminiImage(prompt, refPath && existsSync(refPath) ? refPath : null, aspect);
    if (!res) res = await imagen(ref ? BASE + ' ' + prompt.replace(/^Edit this photo:.*?place\. /, '') : prompt, aspect);
    if (res) { writeFileSync(`${OUT}/${name}.png`, Buffer.from(res.img, 'base64')); note(`picture ${name}: ok (${res.model})`); }
    else note(`picture ${name}: FAILED`);
  }
} else note('VERTEX_API_KEY is not set');

// ---------- voices ----------
const LINES = {
  r1: 'Inter results are out. But what do I do now? Engineering, degree, or a job?',
  p1: "Same confusion here. I don't even know which entrance exams are open, or when the forms come out.",
  r2: 'And my brother wants a government job. Railways, banks, BHEL. Where do we even start?',
  p2: "Wait! My teacher shared a website. It's called Marg Disha. Look.",
  p3: 'Just tap what you have finished, and it shows what comes next.',
  r3: 'Every exam after Inter is here! JEE, EAPCET, NEET, with how to apply, step by step.',
  p4: 'And government jobs. U P S C, railways, banks, even TTD and hospital jobs.',
  r4: 'Private jobs too, sorted by qualification. My brother can use this!',
  p5: "It's free, no sign up needed, and it works in Telugu and Hindi too.",
  r5: 'We found our way. Marg Disha dot com.',
  p6: 'Share it with a friend who needs it!',
};
const VOICES = { r: ['en-IN-Chirp3-HD-Charon', 'en-IN-Neural2-B', 'en-IN-Wavenet-B'], p: ['en-IN-Chirp3-HD-Kore', 'en-IN-Neural2-A', 'en-IN-Wavenet-A'] };
async function speak(text, who) {
  for (const name of VOICES[who]) {
    const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${TTS}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ input: { text }, voice: { languageCode: 'en-IN', name }, audioConfig: { audioEncoding: 'LINEAR16', sampleRateHertz: 24000 } }),
    });
    const j = await r.json().catch(() => ({}));
    if (j.audioContent) return { audio: j.audioContent, name };
    note(`  ${name}: HTTP ${r.status} ${JSON.stringify(j.error?.message ?? '').slice(0, 160)}`);
  }
  return null;
}
if (TTS) {
  for (const [k, text] of Object.entries(LINES)) {
    const res = await speak(text, k[0]);
    if (res) { writeFileSync(`${OUT}/${k}.wav`, Buffer.from(res.audio, 'base64')); note(`voice ${k}: ok (${res.name})`); }
    else note(`voice ${k}: FAILED`);
  }
} else note('GOOGLE_TTS_API_KEY is not set');

writeFileSync(`${OUT}/log.txt`, log.join('\n') + '\n');
if (process.env.GITHUB_STEP_SUMMARY) writeFileSync(process.env.GITHUB_STEP_SUMMARY, '### Ad assets\n\n```\n' + log.join('\n') + '\n```\n', { flag: 'a' });
