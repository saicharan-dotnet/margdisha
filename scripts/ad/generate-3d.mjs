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
  ['p-cross2', 'p-crossroads', `Edit this image: keep everything exactly the same (same student, same signs, same camera, same lighting). Change ONLY the text on the SMALL sign just right of the student's head, which now says "Exams", so that it reads "12th" in the same font and glow. The big sign at the top still says "Exams". No other changes.`],
  ['p-beam2', 'p-cross2', `Edit this image: same student, same crossroads, same signposts with exactly the same words, same camera. A warm golden beam of light shaped like a glowing compass descends from the sky above him, casting warm golden light on him and the signs; the tangled signs start to straighten and glow gold. He looks up in wonder. No other text.`],
  ['p-sunrise', 'p-path', `${PSTYLE} Very wide establishing shot: the glowing golden pathway winding toward the glowing portals of a school, university, government building and modern office under a huge warm sunrise, the small figure of the student walking on it far away. Lots of calm open sky in the upper half. No text.`],
];
// Photorealistic version of the same commercial (live-action look with VFX).
const RSTYLE = 'Photorealistic cinematic live-action film still with high-end photorealistic VFX, shot on ARRI Alexa Mini LF with a 35mm lens, natural skin texture, realistic hair, shallow depth of field, volumetric haze, 16:9 widescreen. Not a cartoon, not 3D animation. No logos, no watermark.';
const RKID = 'A real 18-year-old Indian student with short neat black hair, wearing a crisp white school shirt, navy blue tie, dark trousers and a dark backpack.';
const PROMOREAL = [
  ['r-cross', null, `${RSTYLE} ${RKID} He stands in the centre of a dark, misty, reflective studio space at night, full body visible. Floating around him in 3D space are translucent frosted-glass holographic arrow signs with subtle glowing blue edges, pointing in different directions. Exactly five signs, each clearly labelled in clean bold white letters: "10th", "12th", "Exams", "Jobs", "Scholarships". He looks up at the floating signs with an authentic, concerned expression. Cool blue tones. No other text.`],
  ['r-beam', 'r-cross', `Edit this image: same real student, same pose, same signs with exactly the same words, same camera. Overhead, a realistic golden holographic compass projects warm amber volumetric light rays downward, lighting dust motes in the air and turning the frosted-glass arrows from cool blue to warm sunlit gold. Warm natural rim light on his face and clothes; his expression changes from worry to awe and hope. Subtle 35mm anamorphic lens flare. No other text.`],
  ['r-cross2', 'r-cross', `Edit this image: keep everything exactly the same (same real student, same pose, same lighting, same camera, same five arrows above and beside him). REMOVE ONLY the frosted-glass arrow that points DOWN in front of his legs and reads "Jobs", so his trousers and shoes are fully visible. Keep the "Jobs" arrow on the left. No other changes, no new text.`],
  ['r-beam2', 'r-cross2', `Edit this image: same real student, same pose, same five frosted-glass arrows with exactly the same words in the same places, same camera. High above the "12th" arrow, near the top edge of the frame and NOT covering any arrow, a realistic golden holographic compass projects warm amber volumetric light rays downward, lighting dust motes in the air and turning all the frosted-glass arrows from cool blue to warm sunlit gold. Warm natural rim light on his face and clothes; his expression shows awe and hope. Subtle 35mm anamorphic lens flare. No other text.`],
  ['r-path', null, `${RSTYLE} Over-the-shoulder wide shot from behind the same kind of student (white school shirt, navy tie, dark trousers, backpack, short black hair) standing on a sleek dark reflective glass walkway lined with warm golden LED strips. Ahead of him stand five tall glowing rectangular light portals side by side against a real golden-hour sunset sky. Inside each portal is a real-world view, from left to right: an Indian government building with a dome, a prestigious school campus, a historic Indian university clock tower (centre, tallest portal), a modern glass corporate skyscraper, and a modern IT office park. Leave clear sky above each portal. Realistic reflections on the floor. No text.`],
  ['r-ui', 'r-path', `${RSTYLE} Medium shot of the same real student (white school shirt, navy tie, backpack) walking slowly along the illuminated golden glass walkway at sunset, on the LEFT third of the frame, smiling naturally and gesturing with his left hand toward the empty space on the RIGHT side of the frame. The right half of the frame is soft sunset bokeh with the glowing portals far behind, left empty for a floating interface to be added later. Authentic skin tones, natural fabric. No interface, no text.`],
];
// 9:16 scholarship Reel (photorealistic): worry about fees, discovery on the phone, relief with a parent.
const SSTYLE = 'Photorealistic cinematic film still, shot on a 35mm cinema lens, authentic natural skin texture, realistic hair and clothing, shallow depth of field, vertical 9:16 frame. Not a cartoon, not 3D. No logos, no watermark.';
const GIRL = 'an Indian 17-year-old girl student who just finished 12th class, long black hair in a neat braid, wearing a simple light-blue cotton kurta';
const SCHOLAR = [
  ['s-worry', null, `${SSTYLE} Medium close-up of ${GIRL}, sitting at a wooden study table at home in dim warm evening lamp light, looking stressed and worried while holding a college admission brochure in one hand and a calculator in the other; a few fee papers on the table. Keep the top 15 percent and the bottom 25 percent of the frame plain and uncluttered (dark wall above, plain table below). No readable text.`],
  ['s-phone', 's-worry', `${SSTYLE} Over-the-shoulder shot from behind the same girl (same braid, same light-blue kurta) at the same study table, holding a smartphone and tapping its bright screen with her thumb. Warm golden light from the phone fills the room. Keep the CENTRE of the frame above the phone open, softly blurred and uncluttered so graphics can be added later. The phone screen is a plain bright glow with no readable text.`],
  ['s-happy', 's-worry', `${SSTYLE} Medium shot of the same girl (same braid, same light-blue kurta) smiling brightly next to her proud mother (Indian woman about 45, in a cotton saree) in a sunlit Indian living room, both holding one smartphone together, warm morning sunlight streaming through the window. Their faces are in the upper half of the frame; the lower-middle part of the frame is clean, simple background (sofa and floor) for text to be added. No readable text.`],
];
const FULL = 'Tall vertical portrait composition that fills the ENTIRE 9:16 frame edge to edge: no black bars, no borders, no letterbox, no frame within the frame.';
SCHOLAR.push(
  ['s-worry2', null, `${SSTYLE} ${FULL} Medium shot of ${GIRL}, sitting at a wooden study table at home in dim warm evening lamp light, seen from the front, looking stressed and worried while holding a college admission brochure in one hand and a calculator in the other; a few fee papers on the table. Generous headroom with a softly lit plain wall above her head, the table and papers fill the bottom of the frame. No readable text.`],
  ['s-phone2', 's-worry2', `${SSTYLE} ${FULL} Over-the-shoulder shot from behind the same girl (same braid, same light-blue kurta) at the same study table, her shoulder and braid in the lower right, holding a smartphone in the lower part of the frame and tapping its bright screen. Warm golden light from the phone fills the room. The upper and middle part of the frame is the softly blurred room, open and uncluttered. The phone screen is a plain bright glow with no readable text.`],
  ['s-happy2', 's-worry2', `${SSTYLE} ${FULL} The same girl (same braid, same light-blue kurta) smiling brightly, standing close beside her proud mother (Indian woman about 45 in a cotton saree) in a sunlit Indian living room, the mother's arm around her shoulder, both looking at one smartphone the girl holds, warm morning sunlight streaming through the window behind. Their faces in the upper-middle part of the frame, framed from the waist up. No readable text.`],
);
// 3D scholarship ads: a 16:9 commercial (k-*) and a 9:16 Reel (v-*), same student and style.
const KSTYLE = 'Stylized 3D animated feature film style with vibrant Pixar-inspired cinematic lighting, expressive character, clean high-detail 3D textures, soft depth of field. No logos, no watermark, no readable text.';
const KSTU = 'a young Indian college student about 18, short neat black hair, wearing a college uniform: white shirt, navy blazer with no logo, navy trousers';
const KEYS = [
  ['k-desk', null, `${KSTYLE} Widescreen 16:9. ${KSTU} sits at a study desk in his room in cool blue evening light, a desk lamp, a few papers and a closed laptop, looking worried and overwhelmed, hand on his forehead. He is in the centre; lots of empty dark air around him on both sides and above, for floating graphics to be added later. Full frame, no borders.`, '16:9'],
  ['k-desk-gold', 'k-desk', `Edit this image: same student, same room, same camera. A warm golden glow now comes from in front of him (from below the camera), lighting his face gold; the room turns from cool blue to warm amber. His expression changes to amazed and hopeful, eyes wide, small smile, hand lowered. No text.`, '16:9'],
  ['k-path', 'k-desk', `${KSTYLE} Widescreen 16:9. Wide shot from behind: the same student (white shirt, navy blazer, short black hair) walking with his proud mother (in a saree) and father (in a shirt) along a bright glowing golden pathway that leads up to grand gates of a sunlit Indian university campus with a clock tower and green lawns, warm sunrise sky, golden light particles in the air. Lots of open sky in the upper third. Full frame, no borders.`, '16:9'],
  ['v-desk', 'k-desk', `${KSTYLE} Vertical 9:16 portrait composition that fills the entire frame edge to edge, no borders. Medium shot of the same student (white shirt, navy blazer, short black hair) standing in his room in dim cool-blue twilight light, holding a tall stack of college fee brochures against his chest, looking overwhelmed and worried. Plenty of empty air around his head and on the sides for floating graphics. No text.`, '9:16'],
  ['v-glow', 'k-desk-gold', `${KSTYLE} Vertical 9:16 portrait composition that fills the entire frame edge to edge, no borders. A soft, out-of-focus warm golden abstract background: blurred room with golden bokeh lights and floating light particles, brighter in the centre. No people, no objects in focus, no text.`, '9:16'],
  ['v-gates', 'k-path', `${KSTYLE} Vertical 9:16 portrait composition that fills the entire frame edge to edge, no borders. Wide tracking shot of the same smiling student (white shirt, navy blazer) walking confidently through grand sunlit university gates, his proud mother (saree) and father beside him, all three seen from the front and smiling, warm morning sun and gentle lens flare behind them, golden light. The upper quarter of the frame is open bright sky. No text.`, '9:16'],
];
// Backgrounds for the daily notice Shorts, one per notice area. People stay in the lower half; the upper half is
// soft open background where the notice card is drawn.
const BSTYLE = 'Stylized 3D animated feature film style with vibrant Pixar-inspired lighting, warm hopeful mood, soft depth of field. Vertical 9:16 portrait composition that fills the ENTIRE frame edge to edge: no black bars, no borders. The characters are in the LOWER half of the frame; the UPPER half is soft, out-of-focus open background (sky or wall) with gentle golden light particles. No readable text, no logos.';
const SBG = [
  ['bg-school', null, `${BSTYLE} A proud Indian mother and her 10-year-old son in a neat school uniform with a backpack, standing hand in hand in front of the gates of a grand green residential school campus in warm morning sun, the boy looking up excitedly.`],
  ['bg-job', null, `${BSTYLE} A confident young Indian graduate (about 23) in a formal shirt holding a document folder, standing in front of a large Indian government office building with steps and columns, warm morning light, determined smile.`],
  ['bg-exam', null, `${BSTYLE} A focused Indian teenage student (about 17) at a study desk with neat stacks of books and a pencil, a window behind with soft dawn light, looking up with a hopeful, determined expression.`],
  ['bg-scholarship', null, `${BSTYLE} A happy Indian college student (about 19) holding a graduation cap, with her proud father beside her, on a sunlit university lawn with a clock tower softly blurred far behind.`],
  // More backgrounds so Shorts do not all look the same: picked by the notice's words (scripts/shorts/render.cjs).
  ['bg-police', null, `${BSTYLE} A fit young Indian man and woman (about 22) in sports kit running on a police training ground track at sunrise, cones and a stopwatch, a training academy building far behind, cool blue morning light with orange sunrise.`],
  ['bg-defence', null, `${BSTYLE} A proud young Indian cadet (about 20) in a smart olive uniform saluting on a parade ground, mountains and a clear sky far behind, crisp morning light, heroic low angle.`],
  ['bg-railway', null, `${BSTYLE} A cheerful young Indian job seeker (about 23) with a backpack on a busy Indian railway platform, a modern blue and white train arriving with its headlight glowing, warm evening light and soft station lamps.`],
  ['bg-bank', null, `${BSTYLE} A smart young Indian woman (about 24) in formal clothes smiling at a bank counter with a laptop, a modern bright bank interior with glass and plants softly blurred, clean teal and white tones.`],
  ['bg-teacher', null, `${BSTYLE} A friendly young Indian teacher (about 26) in a classroom pointing to a green board while happy children raise their hands, bright window light, colourful charts on the walls softly blurred.`],
  ['bg-office', null, `${BSTYLE} A determined young Indian man (about 24) in a formal shirt studying with a laptop and notes at night, a city skyline with lights through the window behind him, cool purple and blue night tones with warm desk lamp light.`],
  ['bg-engineer', null, `${BSTYLE} A young Indian engineer (about 24) in a white safety helmet holding rolled plans at a construction site with a crane and a bridge, bright midday sky, energetic mood.`],
  ['bg-result', null, `${BSTYLE} An overjoyed Indian student (about 18) jumping with both fists in the air holding a phone, confetti and colourful light bursts around, a festive bright background, pure celebration.`],
  ['bg-admit', null, `${BSTYLE} An Indian student (about 19) holding a printed admit card and a pen, walking confidently towards the entrance of an exam centre building, other students softly blurred, crisp morning light.`],
  ['bg-answerkey', null, `${BSTYLE} An Indian student (about 20) checking answers on a laptop with a question paper and a highlighter, a cosy room at night, warm lamp light and cool screen glow, eager expression.`],
  ['bg-examhall', null, `${BSTYLE} A large calm Indian exam hall with rows of desks and students writing, one focused student in the front, big windows with soft daylight, quiet determined mood.`],
  ['bg-sainik', null, `${BSTYLE} A proud Indian boy and girl about 11 years old in khaki cadet school uniforms with berets marching on a grand residential school parade ground, red-brick buildings and tall trees behind, golden light.`],
  ['bg-school2', null, `${BSTYLE} A smiling Indian girl about 11 years old in a school uniform with two braids and a backpack, running happily towards a big green school campus gate with friends, bright spring morning.`],
  ['bg-scholar2', null, `${BSTYLE} A delighted Indian college girl (about 19) on a laptop seeing good news, holding a certificate, with a glowing golden coin and book icons floating softly around her, warm purple and gold light.`],
];
const GSTYLE = 'Stylized 3D animated feature film style with vibrant Pixar-inspired cinematic lighting, warm hopeful mood, high-detail 3D textures, soft depth of field. Widescreen 16:9 composition that fills the ENTIRE frame edge to edge: no black bars, no borders. The characters stand in the RIGHT half of the frame; the LEFT half is soft, out-of-focus open background with gentle golden light. No readable text, no logos, no flags.';
const GUIDES = [
  ['g-sainik', null, `${GSTYLE} An Indian boy and girl, about 11 years old, in neat khaki cadet-style school uniforms with berets, standing proudly at attention on the parade ground of a grand old residential school with red-brick buildings and tall trees, golden morning sun.`, '16:9'],
  ['g-kv', null, `${GSTYLE} Happy Indian children about 6 to 10 years old in simple school uniforms with backpacks, walking hand in hand with their mother towards the gate of a clean, green central government school campus with white buildings, warm morning light.`, '16:9'],
  ['g-scholar', null, `${GSTYLE} A joyful Indian college student (about 19) holding a glowing golden scroll tied with a ribbon, with a softly glowing globe, books and a graduation cap floating gently around her, warm golden light.`, '16:9'],
  ['g-career', null, `${GSTYLE} A thoughtful Indian teenager (about 15) with a school bag looking up at softly glowing floating holographic icons of a stethoscope, a gear, a laptop, a balance scale, a graduation cap and books, each on its own glowing path, warm sunrise light.`, '16:9'],
];
// Study-abroad scholarship Shorts (9:16). People in the LOWER half; the upper half stays soft for text.
const ASTYLE = 'Stylized 3D animated feature film style with vibrant Pixar-inspired cinematic lighting, aspirational hopeful mood, rich colours, soft depth of field. Vertical 9:16 portrait composition that fills the ENTIRE frame edge to edge: no black bars, no borders. The characters are in the LOWER half of the frame; the UPPER half is soft, out-of-focus open background with gentle light. No readable text, no logos.';
const ABROAD = [
  ['ab-hook', null, `${ASTYLE} An excited Indian student (about 22) with a backpack, a passport and a boarding pass, at a big modern airport window with a plane taking off into a glowing pink and orange sunset sky.`],
  ['ab-uk', null, `${ASTYLE} A smiling Indian woman (about 25) in a smart coat with a scarf walking past an old stone British university building with gothic windows, a red double-decker bus softly blurred behind, misty golden morning.`],
  ['ab-usa', null, `${ASTYLE} A confident Indian man (about 26) with books on a beautiful American college campus lawn with red-brick buildings and bright orange autumn trees, clear blue sky.`],
  ['ab-india', null, `${ASTYLE} A joyful Indian student (about 23) hugging proud parents in a simple Indian home, holding an envelope with a university acceptance letter, warm evening light through the window.`],
  ['ab-europe', null, `${ASTYLE} A happy Indian student (about 23) with a backpack on a scenic European train platform, a sleek train and snowy Alps mountains behind, crisp blue morning light.`],
  ['ab-germany', null, `${ASTYLE} A cheerful Indian student (about 24) with a bicycle on a colourful old-town street of a German university city with timber-framed houses, spring blossoms, soft sunlight.`],
  ['ab-docs', null, `${ASTYLE} An organised Indian student (about 22) at a tidy desk with a passport, certificates in a clear folder, a laptop and a cup of tea, looking satisfied, warm lamp light with a night window behind.`],
  ['ab-plan', null, `${ASTYLE} A thoughtful Indian student (about 21) looking at a large glowing world map on a wall with pins and a calendar, planning, cool blue and warm gold light.`],
  ['ab-interview', null, `${ASTYLE} A confident Indian student (about 24) in a formal shirt smiling during a video interview on a laptop, a neat room with a plant and soft daylight.`],
  ['ab-visa', null, `${ASTYLE} A thrilled Indian student (about 23) holding up a passport at an airport gate with family waving goodbye in the background, golden hour light.`],
  ['ab-zurich', null, `${ASTYLE} A happy Indian college student (about 21) with a laptop backpack standing on a stone bridge over a clear blue river in a beautiful Swiss old town with church spires and a lakeside promenade, bright summer morning light.`],
  ['ab-lab', null, `${ASTYLE} Two focused Indian college students (a young man and a young woman, about 21) doing computer science research in a modern university lab with a small robot arm, large monitors showing abstract colourful graphs and code-like shapes (not readable), glass walls, soft blue and warm light.`],
  ['ab-lab2', null, `${ASTYLE} One single continuous scene, NOT a photo inside a frame, no blurred bands at the top or bottom. Two focused Indian college students (a young man in a hoodie and a young woman with a braid, about 21) sit close to the camera at a desk in the bottom part of the frame, working with a small robot arm and a laptop in a modern university computer science lab; behind them tall glass windows, big screens with colourful abstract graphs, and soft blue and warm evening light filling the upper part.`],
];
// Private job alert Shorts (9:16), reusable for any fresher job. Same style as the study-abroad set.
const JOBS = [
  ['job-hook', null, `${ASTYLE} An excited young Indian man (about 22) in a neat shirt holding a phone showing a job alert notification, standing on a busy modern Bengaluru street with glass office towers and a metro line, bright morning light.`],
  ['job-role', null, `${ASTYLE} A focused young Indian man (about 23) with a headset working at a modern operations desk with two monitors showing simple charts and spreadsheets, a bright open-plan office with plants and a city view.`],
  ['job-who', null, `${ASTYLE} A confident young Indian graduate (about 22) in a formal shirt holding his degree certificate in a folder, smiling in front of a modern office building entrance, soft golden light.`],
  ['job-apply', null, `${ASTYLE} A hopeful young Indian man (about 22) at a simple home desk sending his resume by email on a laptop, a printed CV beside him, warm lamp light with an evening window behind.`],
];
const ASPECT = SET.startsWith('promo') ? '16:9' : '9:16';
if (SET === 'shortsbg') SHOTS.splice(0, SHOTS.length, ...SBG);
else if (SET === 'guides') SHOTS.splice(0, SHOTS.length, ...GUIDES);
else if (SET === 'abroad') SHOTS.splice(0, SHOTS.length, ...ABROAD);
else if (SET === 'jobs') SHOTS.splice(0, SHOTS.length, ...JOBS);
else if (SET === 'keys3d') SHOTS.splice(0, SHOTS.length, ...KEYS);
else if (SET === 'scholar') SHOTS.splice(0, SHOTS.length, ...SCHOLAR);
else if (SET === 'promo') SHOTS.splice(0, SHOTS.length, ...PROMO);
else if (SET === 'promoreal') SHOTS.splice(0, SHOTS.length, ...PROMOREAL);
else if (process.env.MOODS === '1') SHOTS.push(...MOODS);
async function gen(prompt, refPath, aspect = ASPECT) {
  const parts = [{ text: prompt }];
  if (refPath) parts.unshift({ inlineData: { mimeType: 'image/png', data: readFileSync(refPath).toString('base64') } });
  for (const model of ['gemini-2.5-flash-image', 'gemini-2.5-flash-image', 'gemini-2.5-flash-image', 'gemini-2.5-flash-image']) {
    const r = await fetch(`https://aiplatform.googleapis.com/v1/publishers/google/models/${model}:generateContent?key=${KEY}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: aspect } } }),
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
else for (const [name, ref, prompt, aspect] of SHOTS) {
  if (existsSync(`${OUT}/${name}.png`)) { note(`3d ${name}: already made`); continue; }
  const rp = ref ? `${OUT}/${ref}.png` : null;
  const res = await gen(prompt, rp && existsSync(rp) ? rp : null, aspect || ASPECT);
  if (res) { writeFileSync(`${OUT}/${name}.png`, Buffer.from(res.img, 'base64')); note(`3d ${name}: ok (${res.model})`); } else note(`3d ${name}: FAILED`);
}
writeFileSync(`${OUT}/log.txt`, log.join('\n') + '\n');
