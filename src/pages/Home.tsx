import { useApp } from '../app-context';
import { LEVELS } from '../data/types';
import { LEVEL_LABEL } from '../engine/match';

const QUESTIONS = [
  'What can I study next?', 'What career options are available?', 'Which scholarships can I apply for?',
  'Which government jobs am I eligible for?', 'Which private jobs match me?', 'Which entrance exams can I take?',
  'What skills should I learn?', 'What is available in India and abroad?', 'What should my next step be?',
];

export function Home() {
  const { t, go, profile, setProfile } = useApp();
  return (
    <>
      <section className="hero">
        <h1>{t('tagline')}</h1>
        <p>{t('heroSub')}</p>
        <h2 className="h-sm">{t('pickLevel')}</h2>
        <div className="chips big">
          {LEVELS.filter((l) => l !== 'class5' && l !== 'phd').map((l) => (
            <button key={l} className="chip" onClick={() => { setProfile({ ...profile, level: l, levelStatus: profile.levelStatus ?? 'completed' }); go('explore'); }}>
              {LEVEL_LABEL[l]}
            </button>
          ))}
        </div>
      </section>
      <section>
        <h2>One place to answer</h2>
        <ol className="qgrid">{QUESTIONS.map((q) => <li key={q}>{q}</li>)}</ol>
        <p><button className="btn" onClick={() => go('profile')}>{t('completeProfile')} →</button></p>
      </section>
    </>
  );
}
