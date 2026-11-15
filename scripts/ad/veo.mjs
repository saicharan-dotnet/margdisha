// Makes real talking video clips for the ad with Google Veo (image-to-video with speech).
// Run by the "Make Veo clips" workflow. Each clip starts from one of the semi-realistic 3D pictures.
// PAID: every second of video is billed to the Google Cloud project behind VERTEX_API_KEY.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
const KEY = process.env.VERTEX_API_KEY;
const MODEL = process.env.MODEL || 'veo-3.0-fast-generate-001';
const WANT = (process.env.CLIPS || 'c1').split(',').map((s) => s.trim()).filter(Boolean);
const OUT = 'ad-out/veo'; mkdirSync(OUT, { recursive: true });
const log = []; const note = (s) => { console.log(s); log.push(s); };
const LOOK = 'Semi-realistic 3D animated film style, exactly the same two characters, faces, clothes and campus as the starting image. RAVI is the boy in the light blue shirt, PRIYA is the girl in the orange kurta with a braid. Both speak natural Indian English with an Indian accent, young college-student voices (boy and girl, about 19). Lips match the words exactly. Natural facial expressions, eyebrows, blinking, hand gestures and small body movements. Camera: gentle slow push-in. Soft campus ambience, no music, no on-screen text, no subtitles.';
const CLIPS = {
  c1: ['scene-confused', `${LOOK} Both look worried. Ravi scratches his head, looks at his result sheet and says: "Inter results are out... but what do I do now? Engineering, degree, or a job?" Priya sighs, turns to him and says: "Same here! I don't even know which exams are open."`],
  c2: ['scene-idea', `${LOOK} Ravi says, frustrated: "And my brother wants a government job. Where do we even start?" Priya's face lights up, she holds up her phone excitedly and says: "Wait! My teacher shared a website. MargDisha! Look."`],
  c3: ['scene-phone', `${LOOK} Both lean in looking at the phone, getting more and more amazed. Ravi points at the screen and says: "Every exam after Inter is here, with how to apply!" Priya smiles and says: "And government and private jobs too. All free!"`],
  c4: ['scene-happy', `${LOOK} Both are happy and relieved, smiling. Ravi gives a thumbs up to the camera and says: "We found our way. MargDisha dot com!" Priya smiles at the camera and says: "Share it with a friend who needs it!"`],
};
const base = `https://aiplatform.googleapis.com/v1/publishers/google/models/${MODEL}`;
for (const id of WANT) {
  const c = CLIPS[id]; if (!c) { note(`${id}: unknown clip`); continue; }
  const img = `assets/3dreal/${c[0]}.png`;
  if (!existsSync(img)) { note(`${id}: missing ${img}`); continue; }
  const body = { instances: [{ prompt: c[1], image: { bytesBase64Encoded: readFileSync(img).toString('base64'), mimeType: 'image/png' } }],
    parameters: { aspectRatio: '9:16', durationSeconds: 8, sampleCount: 1, generateAudio: true, personGeneration: 'allow_adult' } };
  const r = await fetch(`${base}:predictLongRunning?key=${KEY}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!j.name) { note(`${id}: start failed HTTP ${r.status} ${JSON.stringify(j.error?.message ?? j).slice(0, 300)}`); continue; }
  note(`${id}: started (${MODEL})`);
  let done = null;
  for (let i = 0; i < 60 && !done; i++) {
    await new Promise((ok) => setTimeout(ok, 10000));
    const p = await fetch(`${base}:fetchPredictOperation?key=${KEY}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ operationName: j.name }) });
    const pj = await p.json().catch(() => ({}));
    if (pj.done) done = pj;
  }
  if (!done) { note(`${id}: timed out`); continue; }
  if (done.error) { note(`${id}: failed ${JSON.stringify(done.error).slice(0, 300)}`); continue; }
  const v = done.response?.videos?.[0];
  if (v?.bytesBase64Encoded) { writeFileSync(`${OUT}/${id}.mp4`, Buffer.from(v.bytesBase64Encoded, 'base64')); note(`${id}: ok`); }
  else note(`${id}: no video in reply ${JSON.stringify(done.response ?? {}).slice(0, 300)}`);
}
writeFileSync(`${OUT}/log.txt`, log.join('\n') + '\n');
