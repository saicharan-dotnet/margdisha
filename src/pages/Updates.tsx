import { useState } from 'react';
import { useApp } from '../app-context';
import type { Notice } from '../data/remote';
import { NoticeFeed } from '../components/NoticeFeed';

const AREAS: [Notice['area'] | 'all', 'all' | 'govt-job' | 'school-admission' | 'exam' | 'scholarship'][] = [
  ['all', 'all'], ['job', 'govt-job'], ['school', 'school-admission'], ['exam', 'exam'], ['scholarship', 'scholarship'],
];

export function Updates() {
  const { t, notices } = useApp();
  const [area, setArea] = useState<Notice['area'] | 'all'>('all');
  const n = (a: Notice['area'] | 'all') => notices.filter((x) => x.status !== 'ignored' && (a === 'all' || x.area === a)).length;
  return (
    <section className="page">
      <div className="page-head updates-head">
        <h1><span className="live-dot" aria-hidden /> {t('latestTitle')}</h1>
      </div>
      <div className="chips scroll">
        {AREAS.map(([a, k]) => <button key={a} className={'chip ' + (a === area ? 'on' : '')} onClick={() => setArea(a)}>{t(k)} <span className="n">{n(a)}</span></button>)}
      </div>
      <NoticeFeed key={area} areas={area === 'all' ? undefined : [area]} limit={40} title={false} />
    </section>
  );
}
