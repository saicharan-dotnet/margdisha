// Render a study-abroad / job explainer Short (1080x1920) from scripts/ad/guides/<name>.json.
// usage: node ashort.cjs <name> <work-dir>
// work-dir needs: bg/<picture>.png (from the ad-assets branch: abroad/ or jobs/), v01-f.wav ... (from ad-assets guide-<name>/).
// Writes <work-dir>/<name>.mp4, <name>-thumb.jpg and <name>-small.mp4 (preview).
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path'); const { execFileSync } = require('child_process');
const [name, workArg] = process.argv.slice(2); const W = path.resolve(workArg);
const S = JSON.parse(fs.readFileSync(path.join(__dirname, '..', `${name}.json`), 'utf8'));
const sh = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'inherit'] }).toString().trim();
fs.copyFileSync(path.join(__dirname, 'ashort.html'), path.join(W, 'ashort.html'));
fs.copyFileSync(path.join(__dirname, '..', '..', '..', 'shorts', 'logo.png'), path.join(W, 'logo.png'));
// Timing: each scene starts a little before its voice clip; short pauses between clips; the end card holds 2 s.
const TL = { s: [], v: [] }; let c = 0;
S.scenes.forEach((sc, i) => {
  const wav = path.join(W, `v${String(i + 1).padStart(2, '0')}-f.wav`);
  const d = parseFloat(sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav]));
  TL.s.push(c); const vs = c + (i === 0 ? 0.5 : 0.35); TL.v.push([vs, d]); c = vs + d + 0.4;
});
TL.end = c + 1.8;
fs.writeFileSync(path.join(W, 'tl.json'), JSON.stringify(TL));
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
  await pg.addInitScript(([s, tl]) => { window.S = s; window.TL = tl; }, [S, TL]);
  await pg.goto('file://' + path.join(W, 'ashort.html'));
  await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(800);
  if (process.env.TEST) { for (const t of process.env.TEST.split(',').map(Number)) { await pg.evaluate((t) => window.setT(t), t); await pg.screenshot({ path: path.join(W, `t-${t}.jpg`), type: 'jpeg', quality: 85 }); } await b.close(); return; }
  // thumbnail: the hook once the title is in
  await pg.evaluate((t) => window.setT(t), 2.7); await pg.screenshot({ path: path.join(W, `${name}-thumb.jpg`), type: 'jpeg', quality: 92 });
  const fr = path.join(W, 'fr'); fs.rmSync(fr, { recursive: true, force: true }); fs.mkdirSync(fr);
  const N = Math.round(TL.end * 30);
  for (let i = 0; i < N; i++) { await pg.evaluate((t) => window.setT(t), i / 30); await pg.screenshot({ path: path.join(fr, String(i).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 90 }); }
  await b.close();
  sh('python3', [path.join(__dirname, '..', '..', '..', 'shorts', 'score.py'), String(TL.v[1][0] - 0.5), String(TL.v[TL.v.length - 1][0] - 0.4), String(TL.end), path.join(W, 'music.wav')]);
  const ins = []; let f = ''; let l = '';
  TL.v.forEach(([vs], i) => { ins.push('-i', path.join(W, `v${String(i + 1).padStart(2, '0')}-f.wav`)); const ms = Math.round(vs * 1000); f += `[${i + 2}:a]adelay=${ms}|${ms},aformat=channel_layouts=stereo[d${i}];`; l += `[d${i}]`; });
  const mp4 = path.join(W, `${name}.mp4`);
  sh('ffmpeg', ['-v', 'error', '-y', '-framerate', '30', '-i', path.join(fr, '%04d.jpg'), '-i', path.join(W, 'music.wav'), ...ins, '-filter_complex',
    `${f}${l}amix=inputs=${TL.v.length}:normalize=0[vo];[vo]apad=whole_dur=${TL.end},asplit[vo1][vo2];[1:a]volume=0.32[mu];[mu][vo1]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[duck];[duck][vo2]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5,atrim=0:${TL.end}[out]`,
    '-map', '0:v', '-map', '[out]', '-ar', '48000', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-t', String(TL.end), '-movflags', '+faststart', mp4]);
  sh('ffmpeg', ['-v', 'error', '-y', '-i', mp4, '-vf', 'scale=480:854', '-c:v', 'libx264', '-preset', 'medium', '-crf', '30', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', path.join(W, `${name}-small.mp4`)]);
  fs.rmSync(fr, { recursive: true, force: true });
  console.log(`rendered ${mp4} (${TL.end.toFixed(1)} s)`);
})();
