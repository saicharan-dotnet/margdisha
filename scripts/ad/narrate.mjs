// Narrator voice lines for the 16:9 commercial (Google Text-to-Speech, Indian English).
// Run by the "Make ad assets" workflow with set=promo-voice. Output: ad-out/promo/v<n>-<m|f>.wav
import { mkdirSync, writeFileSync } from 'node:fs';
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
const LINES = ALL[NARR] || ALL.promo;
const VOICES = { m: ['en-IN-Chirp3-HD-Charon', 'en-IN-Neural2-B'], f: ['en-IN-Chirp3-HD-Kore', 'en-IN-Neural2-A'] };
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
if (!TTS) note('GOOGLE_TTS_API_KEY is not set');
else for (const who of ['m', 'f']) for (const [k, text] of Object.entries(LINES)) {
  const res = await speak(text, who);
  if (res) { writeFileSync(`${OUT}/${k}-${who}.wav`, Buffer.from(res.audio, 'base64')); note(`voice ${k}-${who}: ok (${res.name})`); }
  else note(`voice ${k}-${who}: FAILED`);
}
writeFileSync(`${OUT}/voice-log.txt`, log.join('\n') + '\n');
