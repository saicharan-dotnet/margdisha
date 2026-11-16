// 3D cartoon versions of Ravi and Priya for the ad (Gemini image model via the Vertex key).
// Output goes to ad-out/<set>/. Run by the "Make ad assets" workflow with set=3d or set=3dreal.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
const KEY = process.env.VERTEX_API_KEY; const SET = process.env.SET || '3d'; const OUT = `ad-out/${SET}`; mkdirSync(OUT, { recursive: true });
const log = []; const note = (s) => { console.log(s); log.push(s); };
const STYLES = {
  '3d': 'High-quality 3D animated movie style, stylized cartoon characters with big expressive eyes, soft subsurface skin, cinematic lighting, vertical 9:16 frame. No text, no logos, no watermark.',
  '3dreal': 'Semi-realistic 3D CGI render like a high-end video game cinematic: realistic human proportions and natural-sized eyes, detailed realistic skin with pores and subsurface scattering, realistic hair strands and fabric, cinematic warm afternoon lighting, shallow depth of field, vertical 9:16 frame. Clearly a 3D render, not a photo. No text, no logos, no watermark.',
};
const STYLE = STYLES[SET] || STYLES['3d'];
const WHO = 'Two Indian college students about 19 years old: on the left RAVI, a boy with short black hair, light blue shirt and khaki trousers; on the right PRIYA, a girl with long black hair in a single braid, orange kurta and small red bindi.';
const SHOTS = [
  ['scene-confused', null, `${STYLE} ${WHO} They sit side by side on a wooden bench on a sunny green college campus with big trees and a college building behind. Both look worried and confused, Ravi holds a printed result sheet and scratches his head, Priya rests her chin on her hand.`],
  ['ravi', 'scene-confused', `Using the same 3D style and the exact same character design, make a vertical 9:16 medium close-up (head and upper chest filling the top half of the frame) of RAVI alone (the boy in the light blue shirt) sitting on the same bench, facing the camera and slightly turned to his left, face clearly visible and well lit, mouth closed, slightly worried expression, campus softly blurred behind. No text.`],
  ['priya', 'scene-confused', `Using the same 3D style and the exact same character design, make a vertical 9:16 medium close-up (head and upper chest filling the top half of the frame) of PRIYA alone (the girl in the orange kurta with the braid) sitting on the same bench, facing the camera and slightly turned to her right, face clearly visible and well lit, mouth closed, thoughtful expression, campus softly blurred behind. No text.`],
  ['scene-idea', 'scene-confused', `Edit this image: same 3D characters, same faces, clothes and place. Priya now holds up her smartphone excitedly with a bright "I have an idea" smile, Ravi turns to look at it curiously. No text.`],
  ['scene-phone', 'scene-confused', `Edit this image: same 3D characters, same faces, clothes and place. Both lean in together, smiling, looking at Priya's smartphone screen. No text.`],
  ['scene-happy', 'scene-confused', `Edit this image: same 3D characters, same faces, clothes and place. Both are smiling happily and relieved, Ravi gives a big thumbs up, Priya holds her phone. No text.`],
];
// Same close-up, different feelings, so each voice line can start from the right face.
const MOODS = [
  ['ravi-worried', 'ravi', 'Edit this image: keep everything identical (same character, same pose, same framing, same background, same lighting). Change ONLY his facial expression to clearly worried and stressed: eyebrows pulled up and together, slight frown, tense lips. Mouth closed. No text.'],
  ['ravi-excited', 'ravi', 'Edit this image: keep everything identical (same character, same pose, same framing, same background, same lighting). Change ONLY his facial expression to excited and amazed: eyebrows raised, eyes wide and bright, big open smile. No text.'],
  ['ravi-happy', 'ravi', 'Edit this image: keep everything identical (same character, same pose, same framing, same background, same lighting). Change ONLY his facial expression to happy and relieved: warm natural smile, relaxed eyebrows, eyes slightly crinkled. Mouth closed. No text.'],
  ['priya-worried', 'priya', 'Edit this image: keep everything identical (same character, same pose, same framing, same background, same lighting). Change ONLY her facial expression to clearly worried and confused: eyebrows pulled up and together, slight frown. Mouth closed. No text.'],
  ['priya-excited', 'priya', 'Edit this image: keep everything identical (same character, same pose, same framing, same background, same lighting). Change ONLY her facial expression to excited, like she just had a great idea: eyebrows raised, eyes wide and sparkling, big bright smile. No text.'],
  ['priya-happy', 'priya', 'Edit this image: keep everything identical (same character, same pose, same framing, same background, same lighting). Change ONLY her facial expression to happy and confident: warm natural smile, relaxed eyebrows. Mouth closed. No text.'],
];
// 16:9 commercial: a student lost at a crossroads of signposts, a golden compass beam shows the way.
const PSTYLE = 'Stylized 3D animated feature film style with vibrant Pixar-inspired lighting, high-detail 3D textures, soft depth of field, cinematic composition, widescreen 16:9 frame. No logos, no watermark.';
const KID = 'A young Indian student about 17 years old with short neat black hair, a white school shirt with rolled sleeves, navy trousers and a navy backpack.';
const PROMO = [
  ['p-crossroads', null, `${PSTYLE} ${KID} He stands small in the centre of a glowing digital crossroads at cool blue twilight, surrounded by many floating, tangled, crooked signposts pointing in every direction. Five big signs clearly read "10th", "12th", "Exams", "Jobs" and "Scholarships" in clean bold letters. Mist, floating particles, faint glowing grid lines on the ground. He looks up at them overwhelmed and confused. Wide shot. No other text.`],
  ['p-beam', 'p-crossroads', `Edit this image: same student, same crossroads, same signposts with the same words, same camera. A warm golden beam of light shaped like a glowing compass descends from the sky above him, casting warm golden light on him and the signs; the tangled signs start to straighten and glow gold. He looks up in wonder. No other text.`],
  ['p-path', 'p-crossroads', `${PSTYLE} The same student seen from behind and slightly to the side, stepping forward confidently onto a sleek glowing golden pathway that stretches far ahead. Along and at the end of the path stand glowing 3D portals (tall arches of light) showing a grand school, a university with a clock tower, an Indian government building with a dome, and a modern glass office tower. Warm sunrise light, golden sky, floating light particles. No text.`],
  ['p-ui', 'p-crossroads', `${PSTYLE} The same student in a medium shot on the glowing golden pathway at warm sunrise, smiling confidently, his left hand raised as if touching a floating hologram. The RIGHT half of the frame is open soft-focus sunrise sky and path with glowing portals far behind, left empty for a hologram to be added later. No hologram, no text.`],
  ['p-sunrise', 'p-path', `${PSTYLE} Very wide establishing shot: the glowing golden pathway winding toward the glowing portals of a school, university, government building and modern office under a huge warm sunrise, the small figure of the student walking on it far away. Lots of calm open sky in the upper half. No text.`],
];
const ASPECT = SET === 'promo' ? '16:9' : '9:16';
if (SET === 'promo') SHOTS.splice(0, SHOTS.length, ...PROMO);
else if (process.env.MOODS === '1') SHOTS.push(...MOODS);
async function gen(prompt, refPath) {
  const parts = [{ text: prompt }];
  if (refPath) parts.unshift({ inlineData: { mimeType: 'image/png', data: readFileSync(refPath).toString('base64') } });
  for (const model of ['gemini-2.5-flash-image', 'gemini-2.5-flash-image', 'gemini-2.5-flash-image', 'gemini-2.5-flash-image']) {
    const r = await fetch(`https://aiplatform.googleapis.com/v1/publishers/google/models/${model}:generateContent?key=${KEY}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: ASPECT } } }),
    });
    const j = await r.json().catch(() => ({}));
    const img = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data;
    if (img) return { img, model };
    if (r.status === 429) { note('  busy (429), waiting 40s'); await new Promise((ok) => setTimeout(ok, 40000)); continue; }
    note(`  ${model}: HTTP ${r.status} ${JSON.stringify(j.error?.message ?? j.candidates?.[0]?.finishReason ?? '').slice(0, 200)}`);
  }
  return null;
}
if (!KEY) note('VERTEX_API_KEY is not set');
else for (const [name, ref, prompt] of SHOTS) {
  if (existsSync(`${OUT}/${name}.png`)) { note(`3d ${name}: already made`); continue; }
  const rp = ref ? `${OUT}/${ref}.png` : null;
  const res = await gen(prompt, rp && existsSync(rp) ? rp : null);
  if (res) { writeFileSync(`${OUT}/${name}.png`, Buffer.from(res.img, 'base64')); note(`3d ${name}: ok (${res.model})`); } else note(`3d ${name}: FAILED`);
}
writeFileSync(`${OUT}/log.txt`, log.join('\n') + '\n');
