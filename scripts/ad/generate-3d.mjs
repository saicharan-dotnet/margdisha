// 3D cartoon versions of Ravi and Priya for the ad (Gemini image model via the Vertex key).
// Output goes to ad-out/3d/. Run by the "Make ad assets" workflow with set=3d.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
const KEY = process.env.VERTEX_API_KEY; const OUT = 'ad-out/3d'; mkdirSync(OUT, { recursive: true });
const log = []; const note = (s) => { console.log(s); log.push(s); };
const STYLE = 'High-quality 3D animated movie style, stylized cartoon characters with big expressive eyes, soft subsurface skin, cinematic lighting, vertical 9:16 frame. No text, no logos, no watermark.';
const WHO = 'Two Indian college students about 19 years old: on the left RAVI, a boy with short black hair, light blue shirt and khaki trousers; on the right PRIYA, a girl with long black hair in a single braid, orange kurta and small red bindi.';
const SHOTS = [
  ['scene-confused', null, `${STYLE} ${WHO} They sit side by side on a wooden bench on a sunny green college campus with big trees and a college building behind. Both look worried and confused, Ravi holds a printed result sheet and scratches his head, Priya rests her chin on her hand.`],
  ['ravi', 'scene-confused', `Using the same 3D cartoon style and the exact same character design, make a vertical 9:16 medium close-up of RAVI alone (the boy in the light blue shirt) sitting on the same bench, facing the camera and slightly turned to his left, face clearly visible and well lit, mouth closed, slightly worried expression, campus softly blurred behind. No text.`],
  ['priya', 'scene-confused', `Using the same 3D cartoon style and the exact same character design, make a vertical 9:16 medium close-up of PRIYA alone (the girl in the orange kurta with the braid) sitting on the same bench, facing the camera and slightly turned to her right, face clearly visible and well lit, mouth closed, thoughtful expression, campus softly blurred behind. No text.`],
  ['scene-idea', 'scene-confused', `Edit this image: same 3D cartoon characters, same faces, clothes and place. Priya now holds up her smartphone excitedly with a bright "I have an idea" smile, Ravi turns to look at it curiously. No text.`],
  ['scene-phone', 'scene-confused', `Edit this image: same 3D cartoon characters, same faces, clothes and place. Both lean in together, smiling, looking at Priya's smartphone screen. No text.`],
  ['scene-happy', 'scene-confused', `Edit this image: same 3D cartoon characters, same faces, clothes and place. Both are smiling happily and relieved, Ravi gives a big thumbs up, Priya holds her phone. No text.`],
];
async function gen(prompt, refPath) {
  const parts = [{ text: prompt }];
  if (refPath) parts.unshift({ inlineData: { mimeType: 'image/png', data: readFileSync(refPath).toString('base64') } });
  for (const model of ['gemini-2.5-flash-image', 'gemini-2.5-flash-image-preview']) {
    const r = await fetch(`https://aiplatform.googleapis.com/v1/publishers/google/models/${model}:generateContent?key=${KEY}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '9:16' } } }),
    });
    const j = await r.json().catch(() => ({}));
    const img = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data;
    if (img) return { img, model };
    note(`  ${model}: HTTP ${r.status} ${JSON.stringify(j.error?.message ?? j.candidates?.[0]?.finishReason ?? '').slice(0, 200)}`);
  }
  return null;
}
if (!KEY) note('VERTEX_API_KEY is not set');
else for (const [name, ref, prompt] of SHOTS) {
  const rp = ref ? `${OUT}/${ref}.png` : null;
  const res = await gen(prompt, rp && existsSync(rp) ? rp : null);
  if (res) { writeFileSync(`${OUT}/${name}.png`, Buffer.from(res.img, 'base64')); note(`3d ${name}: ok (${res.model})`); } else note(`3d ${name}: FAILED`);
}
writeFileSync(`${OUT}/log.txt`, log.join('\n') + '\n');
