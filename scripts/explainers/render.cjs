// Long explainer videos, step 2: render each job in explainer-out/ to a 16:9 MP4 (4K by default) with the female
// voiceover and original music, plus a 1280x720 thumbnail and a .txt with the YouTube title, description, chapters and tags.
// Frames are drawn by explainer.html in headless Chromium, split between WORKERS processes, and piped straight into ffmpeg.
// Env: SCALE=2 (3840x2160) or 1 (1920x1080), WORKERS=4, ONLY=<topic id>, FPS=30.
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path'); const { execFileSync, spawn } = require('child_process');
const OUT = path.resolve(process.env.OUT || 'explainer-out'); const HERE = __dirname;
const SCALE = Number(process.env.SCALE || 2); const WORKERS = Number(process.env.WORKERS || 4); const FPS = Number(process.env.FPS || 30);
const sh = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'inherit'], maxBuffer: 1 << 26 }).toString().trim();
const dur = (f) => parseFloat(sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]));
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

async function renderRange(G, TL, from, to, file) {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: SCALE });
  await pg.addInitScript((d) => { window.G = d.G; window.TL = d.TL; }, { G, TL });
  await pg.goto('file://' + path.join(HERE, 'explainer.html'));
  await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(600);
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', SCALE > 1 ? 'veryfast' : 'medium', '-crf', '16', '-tune', 'animation', '-pix_fmt', 'yuv420p', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((ok, bad) => ff.on('close', (c) => (c === 0 ? ok() : bad(new Error('ffmpeg exited ' + c)))));
  for (let i = from; i < to; i++) {
    await pg.evaluate((t) => window.setT(t), i / FPS);
    const buf = await pg.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise((ok) => ff.stdin.once('drain', ok));
  }
  ff.stdin.end(); await done; await b.close();
}

async function thumbnail(job, cover, logo, file) {
  const T = job.thumb; const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const big = T.top.length > 11 ? 92 : 112;
  const tmp = file.replace(/\.jpg$/, '.html');
  fs.writeFileSync(tmp, `<html><head><link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800;900&display=block" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}body{width:1280px;height:720px;overflow:hidden;background:#071a18;font-family:'Inter Display','Inter',sans-serif;color:#fff}
#bg{position:absolute;left:660px;top:0;width:620px;height:720px;background:url('${cover}') 50% 66%/cover}
#sh{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,20,18,1) 0%,rgba(5,20,18,1) 51%,rgba(5,20,18,.55) 60%,rgba(5,20,18,0) 72%)}
.t{position:absolute;left:56px;top:54px;width:860px}.k{display:flex;align-items:center;gap:16px;font-weight:900;font-size:42px}.k img{width:64px;height:64px;border-radius:16px}
h1{margin-top:30px;font-weight:900;font-size:${big}px;line-height:1;letter-spacing:-3px;text-shadow:0 4px 20px rgba(0,0,0,.6)}h2{margin-top:12px;font-weight:900;font-size:66px;line-height:1.05;letter-spacing:-2px;color:#ffd567}
.chips{margin-top:34px;display:flex;flex-wrap:wrap;gap:12px;width:720px}.chips span{font-weight:800;font-size:31px;padding:8px 20px;border-radius:999px;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.4)}
.free{position:absolute;right:40px;bottom:40px;font-weight:900;font-size:46px;color:#3a2300;background:linear-gradient(160deg,#fff1b8,#ffd567 40%,#f0a830);padding:10px 34px;border-radius:999px;box-shadow:0 0 40px rgba(255,190,60,.7);transform:rotate(-4deg)}
</style></head><body><div id="bg"></div><div id="sh"></div><div class="t"><div class="k"><img src="${logo}">MargDisha</div><h1>${esc(T.top)}</h1><h2>${esc(T.bottom)}</h2>
<div class="chips">${T.chips.map((c) => `<span>${esc(c)}</span>`).join('')}</div></div><div class="free">FULL GUIDE</div></body></html>`);
  await p.goto('file://' + tmp); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500); fs.rmSync(tmp); await p.screenshot({ path: file, type: 'jpeg', quality: 92 }); await b.close();
}

function description(job, TL) {
  // YouTube chapters: start at 0:00, at least 3, each at least 10 seconds long.
  const ch = [[0, 'Introduction']];
  job.scenes.forEach((s, i) => { if (s.type === 'title' || s.type === 'end') return; const at = Math.max(0, TL.v[i][0] - 0.45);
    if (at - ch[ch.length - 1][0] >= 10) ch.push([at, s.h]); });
  const lines = [job.summary, ''];
  if (ch.length >= 3) lines.push('Chapters', ...ch.map(([t, h]) => `${mmss(t)} ${h}`), '');
  lines.push(`Official website: ${job.url}`);
  if (job.trigger) lines.push(`New official notice: ${job.trigger.title}`, job.trigger.url);
  const more = job.notices.filter((n) => !job.trigger || n.url !== job.trigger.url).slice(0, 4);
  if (more.length) lines.push('', 'Latest official notices', ...more.map((n) => `- ${n.title}: ${n.url}`));
  lines.push('', 'Free updates on exams, jobs, admissions and scholarships: https://margdisha.com', '',
    'MargDisha is free and links you to the official websites. Dates, fees and rules change every year, so always read the latest official notification before applying. We do not guarantee selection.', '',
    job.tags.slice(0, 8).map((t) => '#' + t.replace(/\s+/g, '')).join(' '));
  return lines.join('\n');
}

(async () => {
  let made = JSON.parse(fs.readFileSync(path.join(OUT, 'made.json'), 'utf8'));
  if (process.env.ONLY) made = made.filter((m) => m === process.env.ONLY);
  if (!made.length) { console.log('Nothing to render.'); return; }
  const logo = 'file://' + path.resolve(HERE, '../shorts/logo.png');
  for (const id of made) {
    const dir = path.join(OUT, id); const job = JSON.parse(fs.readFileSync(path.join(dir, 'job.json'), 'utf8'));
    const bgf = path.resolve(HERE, '../shorts/bg', `${job.bg}.jpg`);
    const cover = 'file://' + (fs.existsSync(bgf) ? bgf : path.resolve(HERE, '../shorts/bg/bg-exam.jpg'));
    // Voice timings: each scene's line starts after the previous one plus a short pause.
    const v = []; let t = 1.0;
    job.scenes.forEach((s, i) => { const d = dur(path.join(dir, `v${String(i + 1).padStart(2, '0')}.wav`)); v.push([+t.toFixed(3), +d.toFixed(3)]); t += d + (i === 0 ? 1.4 : 0.9); });
    const END = +(v[v.length - 1][0] + v[v.length - 1][1] + 3.5).toFixed(2);
    const TL = { v, end: END };
    // A dark, blurred copy of the picture for the background (drawn once here; a CSS blur on every frame is slow).
    const blur = path.join(dir, 'blur.jpg');
    sh('ffmpeg', ['-v', 'error', '-y', '-i', cover.replace('file://', ''), '-vf', 'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,gblur=sigma=40,eq=brightness=-0.12:saturation=1.2,colorlevels=romax=0.42:gomax=0.42:bomax=0.42', '-q:v', '3', blur]);
    // Each part shows a different picture, so a long video does not sit on one image: the topic's own picture first,
    // then general exam and job pictures (school pictures for school admissions).
    const pool = [job.bg, ...(job.kind === 'school' ? ['bg-school', 'bg-school2', 'bg-exam', 'bg-result'] : ['bg-examhall', 'bg-job', 'bg-exam', 'bg-admit', 'bg-result', 'bg-answerkey'])]
      .filter((b, i, a) => a.indexOf(b) === i && fs.existsSync(path.resolve(HERE, '../shorts/bg', `${b}.jpg`)));
    let k = 0; job.scenes.forEach((s) => { if (s.type !== 'title' && s.type !== 'end') s.pic = 'file://' + path.resolve(HERE, '../shorts/bg', `${pool[k++ % pool.length]}.jpg`); });
    const G = { ...job, cover, logo, blur: 'file://' + blur };
    const N = Math.ceil(END * FPS); const per = Math.ceil(N / WORKERS);
    console.log(`${id}: ${mmss(END)} long, ${N} frames at ${1920 * SCALE}x${1080 * SCALE}, ${WORKERS} workers`);
    const t0 = Date.now();
    const segs = [...Array(WORKERS)].map((_, w) => path.join(dir, `seg${w}.mp4`));
    await Promise.all(segs.map((f, w) => renderRange(G, TL, w * per, Math.min(N, (w + 1) * per), f)));
    console.log(`  frames done in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
    // Music under the voice, ducked while she speaks.
    const music = path.join(dir, 'music.wav');
    sh('python3', [path.resolve(HERE, '../shorts/score.py'), String(Math.max(0.5, v[1][0] - 0.5)), String(v[v.length - 1][0] - 0.4), String(END), music]);
    const ins = [], f = []; let L = '';
    v.forEach(([st], i) => { ins.push('-i', path.join(dir, `v${String(i + 1).padStart(2, '0')}.wav`)); const ms = Math.round(st * 1000);
      f.push(`[${i + 1}:a]aresample=48000,adelay=${ms}|${ms},aformat=channel_layouts=stereo[d${i}]`); L += `[d${i}]`; });
    const audio = path.join(dir, 'audio.wav');
    sh('ffmpeg', ['-v', 'error', '-y', '-i', music, ...ins, '-filter_complex',
      `${f.join(';')};${L}amix=inputs=${v.length}:normalize=0,highpass=f=70,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,volume=1.5[vo];[vo]apad=whole_dur=${END},asplit[vo1][vo2];[0:a]aresample=48000,volume=0.3[mu];[mu][vo1]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[duck];[duck][vo2]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5,atrim=0:${END}[out]`,
      '-map', '[out]', '-ar', '48000', audio]);
    fs.writeFileSync(path.join(dir, 'segs.txt'), segs.map((s) => `file '${s}'`).join('\n'));
    const mp4 = path.join(OUT, `explainer-${id}.mp4`);
    sh('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'segs.txt'), '-i', audio, '-map', '0:v', '-map', '1:a',
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', mp4]);
    segs.forEach((s) => fs.rmSync(s, { force: true }));
    await thumbnail(job, cover, logo, path.join(OUT, `explainer-${id}-thumb.jpg`));
    fs.writeFileSync(path.join(OUT, `explainer-${id}.txt`), `TITLE\n${job.title}\n\nDESCRIPTION\n${description(job, TL)}\n\nTAGS\n${job.tags.join(', ')}\n`);
    // The narration as plain text, to check the facts quickly before uploading.
    fs.writeFileSync(path.join(OUT, `explainer-${id}-script.txt`), job.scenes.map((s, i) => `[${mmss(Math.max(0, TL.v[i][0] - 0.45))}] ${s.h || (s.type === 'title' ? 'Introduction' : 'End')}\n${s.say}`).join('\n\n') + '\n');
    console.log(`  rendered ${mp4} (${mmss(dur(mp4))}, ${(fs.statSync(mp4).size / 1e6).toFixed(0)} MB) in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
  }
})().catch((e) => { console.error(e); process.exit(1); });
