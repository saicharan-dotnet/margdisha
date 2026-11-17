// Narrator voice lines for the 16:9 commercial (Google Text-to-Speech, Indian English).
// Run by the "Make ad assets" workflow with set=promo-voice. Output: ad-out/promo/v<n>-<m|f>.wav
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
const TTS = process.env.GOOGLE_TTS_API_KEY; const NARR = process.env.NARR || 'promo'; const OUT = `ad-out/${NARR}`; mkdirSync(OUT, { recursive: true });
const log = []; const note = (s) => { console.log(s); log.push(s); };
const ALL = {};
ALL.promo = {
  v1: 'Tenth done. Twelfth done.',
  v2: 'Now... which way?',
  v3: 'Marg Disha shows you the way.',
  v4: 'Courses, entrance exams, jobs, and scholarships.',
  v5: 'Every path, step by step. All in one free website.',
  v6: 'Marg Disha dot com. Your way after tenth, twelfth, and degree.',
};
ALL.scholar = {
  v1: "Don't let college or school fees stop your dreams after tenth, Inter, or degree.",
  v2: 'On Marg Disha dot com, just select your qualification and discover Central, Telangana, Andhra Pradesh, and private scholarships you can apply for.',
  v3: 'One hundred percent free, with direct official links, in English, Telugu, and Hindi. Check your scholarships today at Marg Disha dot com!',
};
ALL.fees = {
  v1: 'Worried about school or college fees after tenth, Inter, or degree?',
  v2: 'Just pick your qualification on Marg Disha dot com, and find Central, Telangana, Andhra Pradesh, and private scholarships that match you.',
  v3: 'One hundred percent free, with direct official links, in English, Telugu, and Hindi. Check your matches today!',
};
ALL.intro = {
  v1: 'Finished tenth, Inter, or a degree, and not sure what comes next? You are not alone.',
  v2: 'Welcome to Marg Disha. Free guidance for students and parents across India.',
  v3: 'Find which courses you can study after tenth, twelfth, or your degree, and where they lead.',
  v4: 'School admissions like Navodaya, Sainik, Kendriya Vidyalaya, and Gurukul, with the steps to apply.',
  v5: 'Entrance exams, government jobs, and jobs at big companies like TCS, Infosys, and Wipro, for freshers and experienced people.',
  v6: 'Scholarships from the Central government, Telangana, Andhra Pradesh, and private trusts. Even for Masters, PhD, and study abroad.',
  v7: 'On this channel, we share new official notices in short videos, always with the official link.',
  v8: 'Everything is free, in English, Telugu, and Hindi. Subscribe, and visit Marg Disha dot com.',
};
const VOICES = { m: ['en-IN-Chirp3-HD-Charon', 'en-IN-Neural2-B'], f: ['en-IN-Chirp3-HD-Kore', 'en-IN-Neural2-A'] };
// Long guide videos: NARR=guide-<name> reads scripts/ad/guides/<name>.json and records each scene's line (female voice only).
let WHO = ['m', 'f']; let LANG = 'en-IN';
if (NARR.startsWith('guide-')) {
  const g = JSON.parse(readFileSync(new URL(`./guides/${NARR.slice(6)}.json`, import.meta.url), 'utf8'));
  ALL[NARR] = Object.fromEntries(g.scenes.map((sc, i) => [`v${String(i + 1).padStart(2, '0')}`, sc.say]));
  WHO = ['f'];
  if (g.lang === 'te') { LANG = 'te-IN'; VOICES.f = ['te-IN-Chirp3-HD-Kore', 'te-IN-Standard-A']; }
  if (g.lang === 'hi') { LANG = 'hi-IN'; VOICES.f = ['hi-IN-Chirp3-HD-Kore', 'hi-IN-Neural2-A']; }
}
const LINES = ALL[NARR] || ALL.promo;
async function speak(text, who) {
  for (const name of VOICES[who]) {
    const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${TTS}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ input: { text }, voice: { languageCode: LANG, name }, audioConfig: { audioEncoding: 'LINEAR16', sampleRateHertz: 24000 } }),
    });
    const j = await r.json().catch(() => ({}));
    if (j.audioContent) return { audio: j.audioContent, name };
    note(`  ${name}: HTTP ${r.status} ${JSON.stringify(j.error?.message ?? '').slice(0, 160)}`);
  }
  return null;
}
if (!TTS) note('GOOGLE_TTS_API_KEY is not set');
else for (const who of WHO) for (const [k, text] of Object.entries(LINES)) {
  const res = await speak(text, who);
  if (res) { writeFileSync(`${OUT}/${k}-${who}.wav`, Buffer.from(res.audio, 'base64')); note(`voice ${k}-${who}: ok (${res.name})`); }
  else note(`voice ${k}-${who}: FAILED`);
}
writeFileSync(`${OUT}/voice-log.txt`, log.join('\n') + '\n');
