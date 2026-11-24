// Daily notice Shorts, step 2: render each job in shorts-out/ to a 1080x1920 MP4 with voice and music.
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path'); const { execFileSync } = require('child_process');
const OUT = path.resolve('shorts-out'); const HERE = __dirname;

// Pick a colour theme from the kind of news, and a background picture from the sector, so Shorts look different.
const has = (txt, re) => re.test(txt);
function look(job) {
  const t = `${job.noticeTitle || ''} ${job.name || ''} ${job.badge || ''} ${job.source || ''}`.toLowerCase();
  let theme = 'gold', ribbon = 'New notice';
  if (has(t, /result|merit list|selected|select panel|final list|qualified/)) { theme = 'green'; ribbon = 'Result update'; }
  else if (has(t, /admit card|hall ticket|admission certificate|exam city|city of exam|city intimation|call letter/)) { theme = 'blue'; ribbon = 'Admit card'; }
  else if (has(t, /answer key|response sheet|marks|cut[- ]?off|question paper/)) { theme = 'purple'; ribbon = 'Answer key'; }
  else if (has(t, /apply|registration|recruit|vacanc|notification for|last date|online form|admission open|walk[- ]in/)) { theme = 'red'; ribbon = 'Apply now'; }
  else if (has(t, /resched|postpon|revised|date|schedule|corrigendum|advisory|important notice/)) { theme = 'blue'; ribbon = 'Important notice'; }
  if (job.area === 'scholarship') { theme = theme === 'gold' ? 'teal' : theme; ribbon = ribbon === 'New notice' ? 'Scholarship' : ribbon; }
  const sector = [
    [/constable|police|capf|\bsi\b|sub-inspector|pet\/pst|\bpet\b|assam rifles|ssf|\bgd\b/, 'bg-police'],
    [/army|navy|air force|agniveer|defence|coast guard|\bnda\b|\bcds\b|military(?! school)/, 'bg-defence'],
    [/railway|\brrb\b|\bntpc\b|loco pilot|\brpf\b/, 'bg-railway'],
    [/\bbank|ibps|\bsbi\b|\brbi\b|nabard|clerk|probationary officer/, 'bg-bank'],
    [/teacher|\btgt\b|\bpgt\b|\bprt\b|\btet\b|ctet|principal|lecturer/, 'bg-teacher'],
    [/engineer|\bje\b|\baee\b|\bae\b|technical|draughtsman/, 'bg-engineer'],
    [/sainik|aissee|military school|\brms\b/, 'bg-sainik'],
  ].find(([re]) => re.test(t));
  const byKind = { green: 'bg-result', blue: 'bg-admit', purple: 'bg-answerkey' };
  const pool = { job: ['bg-job', 'bg-office'], exam: ['bg-exam', 'bg-examhall'], school: ['bg-school', 'bg-school2'], scholarship: ['bg-scholarship', 'bg-scholar2'] }[job.area] || ['bg-job'];
  const n = Number(String(job.id).replace(/\D/g, '')) || 0;
  const choices = [sector && sector[1], ribbon === 'Admit card' || theme === 'green' || theme === 'purple' ? byKind[theme] : null, pool[n % pool.length], `bg-${job.area}`, 'bg-job'];
  const bg = choices.find((c) => c && fs.existsSync(path.join(HERE, 'bg', `${c}.jpg`)));
  return { theme, ribbon: `${ribbon} · ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })}`, bg };
}
const sh = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'inherit'] }).toString().trim();
(async () => {
  const made = JSON.parse(fs.readFileSync(path.join(OUT, 'made.json'), 'utf8'));
  if (!made.length) { console.log('Nothing to render.'); return; }
  const b = await chromium.launch();
  for (const id of made) {
    const dir = path.join(OUT, String(id)); const job = JSON.parse(fs.readFileSync(path.join(dir, 'job.json'), 'utf8'));
    sh('ffmpeg', ['-loglevel', 'error', '-y', '-i', path.join(dir, 'voice.wav'), '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', path.join(dir, 'v.wav')]);
    const vd = parseFloat(sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(dir, 'v.wav')]));
    const V0 = 0.25, END = Math.min(Math.max(V0 + vd + 3.0, 12), 24);
    Object.assign(job, look(job));
    const pg = await b.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
    await pg.goto('file://' + path.join(HERE, 'short.html'));
    await pg.evaluate(([j, a, d, e]) => window.init(j, a, d, e), [job, V0, vd, END]);
    await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(800);
    const fr = path.join(dir, 'fr'); fs.mkdirSync(fr, { recursive: true });
    const N = Math.round(END * 30);
    for (let i = 0; i < N; i++) { await pg.evaluate((t) => window.setT(t), i / 30); await pg.screenshot({ path: path.join(fr, String(i).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 90 }); }
    // A matching thumbnail (1080x1920 JPEG) to set as the Short's cover when uploading.
    await pg.evaluate(() => window.thumb()); await pg.waitForTimeout(200);
    await pg.screenshot({ path: path.join(OUT, `short-${id}-thumb.jpg`), type: 'jpeg', quality: 90 });
    await pg.close();
    sh('python3', [path.join(HERE, 'score.py'), '1.6', String(END - 3.2), String(END), path.join(dir, 'music.wav')]);
    const mp4 = path.join(OUT, `short-${id}.mp4`);
    sh('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', '30', '-i', path.join(fr, '%04d.jpg'), '-i', path.join(dir, 'music.wav'), '-i', path.join(dir, 'v.wav'),
      '-filter_complex', `[2]adelay=${V0 * 1000}|${V0 * 1000},aresample=44100,pan=stereo|c0=c0|c1=c0,highpass=f=80,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,volume=1.6,apad,asplit[v1][sc];[1]volume=0.5[m];[m][sc]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=450[duck];[duck][v1]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5,atrim=0:${END}[a]`,
      '-map', '0:v', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-t', String(END), '-movflags', '+faststart', mp4]);
    fs.writeFileSync(path.join(OUT, `short-${id}.txt`), `TITLE\n${job.title}\n\nDESCRIPTION\n${job.description}\n\nTAGS\n${job.tags.join(', ')}\n\nPINNED COMMENT (post it after uploading, then pin it)\n${job.pinned || 'Which exam are you preparing for? Tell us in the comments 👇'}\n\nRELATED VIDEO (in the upload screen)\nPick your newest long video on the same exam if there is one, otherwise your most-viewed Short.\n`);
    fs.rmSync(fr, { recursive: true, force: true });
    console.log(`rendered ${mp4} (${END.toFixed(1)} s)`);
  }
  await b.close();
})();
