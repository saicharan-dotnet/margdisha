import { useMemo, useState } from 'react';
import { useApp } from '../app-context';
import { SCHOOL_SECTORS } from '../data/types';
import { matchAll } from '../engine/match';
import { OppCard } from '../components/OppCard';
import { NoticeFeed } from '../components/NoticeFeed';

/** Which entry classes to show for "my child is in Class N". */
const CHILD: [string, string[]][] = [
  ['Pre-school / Class 0', ['Balvatika', 'Class 1']],
  ['Class 1 to 3', ['Class 2']],
  ['Class 4', ['Class 5']],
  ['Class 5', ['Class 6']],
  ['Class 8', ['Class 9', 'Classes 9']],
  ['Class 10', ['Class 11']],
];

export function Schools() {
  const { t, profile, opps } = useApp();
  const [type, setType] = useState('all');
  const [child, setChild] = useState<string>('any');
  const items = useMemo(() => matchAll(profile, opps, { includeUnverified: true })
    .filter((m) => m.opp.kind === 'school-admission' || (m.opp.sector && (SCHOOL_SECTORS as readonly string[]).includes(m.opp.sector))), [profile, opps]);
  const wanted = CHILD.find(([c]) => c === child)?.[1];
  const shown = items.filter((m) =>
    (type === 'all' || m.opp.sector === type) &&
    (!wanted || wanted.some((w) => new RegExp(`\\b${w}\\b`).test(m.opp.entryClass ?? ''))));
  const count = (s: string) => items.filter((m) => m.opp.sector === s).length;

  return (
    <section className="page">
      <div className="page-head school-head">
        <h1>{t('schoolsTitle')}</h1>
        <p className="lede">{t('schoolsIntro')}</p>
      </div>

      <div className="filter-block">
        <span className="filter-label">{t('childStudying')}</span>
        <div className="chips scroll">
          <button className={'chip ' + (child === 'any' ? 'on' : '')} onClick={() => setChild('any')}>{t('anyClass')}</button>
          {CHILD.map(([c]) => <button key={c} className={'chip ' + (child === c ? 'on' : '')} onClick={() => setChild(c)}>{c}</button>)}
        </div>
      </div>
      <div className="filter-block">
        <span className="filter-label">{t('schoolType')}</span>
        <div className="chips scroll">
          <button className={'chip ' + (type === 'all' ? 'on' : '')} onClick={() => setType('all')}>{t('all')} <span className="n">{items.length}</span></button>
          {SCHOOL_SECTORS.filter((s) => count(s) > 0).map((s) => (
            <button key={s} className={'chip ' + (s === type ? 'on' : '')} onClick={() => setType(s)}>{s} <span className="n">{count(s)}</span></button>
          ))}
        </div>
      </div>

      <p className="result-line">{shown.length} {t('resultsCount')}</p>
      <div className="grid">{shown.map(({ opp, result }) => <OppCard key={opp.id} opp={opp} result={result} />)}</div>
      {!shown.length && <p className="empty">{items.length ? t('noResults') : t('verifyingSoon')}</p>}

      <NoticeFeed areas={['school', 'scholarship']} limit={6} />
    </section>
  );
}
