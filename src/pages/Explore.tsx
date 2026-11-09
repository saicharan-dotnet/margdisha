import { useApp } from '../app-context';
import { LEVELS, type Level, type Stream } from '../data/types';
import { SEED_PATHWAYS } from '../data/seed';
import { LEVEL_LABEL } from '../engine/match';

const INTER_STREAMS: Stream[] = ['MPC', 'BiPC', 'MEC', 'CEC', 'HEC', 'Vocational'];

/** Which pathway list answers "what next" for a level? Class 5/8 → Class 10 options preview. */
function pathwaysFor(level: Level, stream?: Stream) {
  const from: Level = level === 'class5' || level === 'class8' ? 'class10' : level === 'phd' ? 'pg' : level;
  const exact = SEED_PATHWAYS.filter((p) => p.from === from && p.stream && p.stream === stream);
  const general = SEED_PATHWAYS.filter((p) => p.from === from && !p.stream);
  return [...exact, ...general].flatMap((p) => p.options);
}

export function Explore() {
  const { t, profile, setProfile, go } = useApp();
  const level = profile.level ?? 'class10';
  const options = pathwaysFor(level, profile.stream);
  return (
    <section>
      <h1>{t('studyNext')}</h1>
      <div className="notice">⚠ Pathway information is a first draft and has not been reviewed by a counsellor yet.</div>
      <label className="h-sm">{t('pickLevel')}</label>
      <div className="chips">
        {LEVELS.map((l) => (
          <button key={l} className={'chip ' + (l === level ? 'on' : '')} onClick={() => setProfile({ ...profile, level: l })}>{LEVEL_LABEL[l]}</button>
        ))}
      </div>
      {level === 'inter' && (
        <>
          <label className="h-sm">{t('pickStream')}</label>
          <div className="chips">
            {INTER_STREAMS.map((s) => (
              <button key={s} className={'chip ' + (s === profile.stream ? 'on' : '')} onClick={() => setProfile({ ...profile, stream: s })}>{s}</button>
            ))}
          </div>
        </>
      )}
      {(level === 'class5' || level === 'class8') && <p className="muted">Focus on finishing Class 10. Here is what opens up after it:</p>}
      <div className="grid">
        {options.map((o) => (
          <article key={o.id} className="card">
            <h3>{o.title}</h3>
            <dl>
              <dt>{t('duration')}</dt><dd>{o.duration}</dd>
              <dt>{t('eligibility')}</dt><dd>{o.eligibility}</dd>
              <dt>{t('leadsTo')}</dt><dd>{o.leadsTo.join(', ')}</dd>
              <dt>{t('careers')}</dt><dd>{o.careers.join(', ')}</dd>
              {o.exams && <><dt>{t('exams')}</dt><dd>{o.exams.join(', ')}</dd></>}
            </dl>
          </article>
        ))}
      </div>
      <p><button className="btn" onClick={() => go('profile')}>{t('completeProfile')} →</button></p>
    </section>
  );
}
