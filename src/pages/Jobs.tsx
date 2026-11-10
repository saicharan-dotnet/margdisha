import { useMemo, useState } from 'react';
import { useApp } from '../app-context';
import { GOVT_SECTORS, PRIVATE_SECTORS, type WorkMode } from '../data/types';
import { matchAll } from '../engine/match';
import { OppCard } from '../components/OppCard';
import { Icon } from '../components/Icon';
import { NoticeFeed } from '../components/NoticeFeed';

export function Jobs({ tab }: { tab: 'govt' | 'private' }) {
  const { t, profile, opps, go } = useApp();
  const [sector, setSector] = useState<string>('all');
  const [mine, setMine] = useState(false);
  const [q, setQ] = useState('');
  const [mode, setMode] = useState<WorkMode | 'all'>('all');

  const all = useMemo(() => matchAll(profile, opps, { includeUnverified: true }), [profile, opps]);
  const inTab = all.filter((m) => (tab === 'govt' ? m.opp.kind === 'govt-job' : m.opp.kind === 'private-job' || m.opp.kind === 'internship'));
  const sectors = tab === 'govt' ? GOVT_SECTORS : PRIVATE_SECTORS;
  const count = (s: string) => inTab.filter((m) => m.opp.sector === s).length;
  const needle = q.trim().toLowerCase();
  const shown = inTab.filter((m) =>
    (sector === 'all' || m.opp.sector === sector) &&
    (!mine || m.result.status !== 'not') &&
    (mode === 'all' || m.opp.workMode === mode) &&
    (!needle || [m.opp.title, m.opp.provider, m.opp.location, m.opp.sector].join(' ').toLowerCase().includes(needle)));

  return (
    <section className="page">
      <div className="page-head">
        <h1>{t('navJobs')}</h1>
        <p className="lede">{t('jobsIntro')}</p>
      </div>
      <div className="segmented" role="tablist">
        <button role="tab" aria-selected={tab === 'govt'} className={tab === 'govt' ? 'on' : ''} onClick={() => { setSector('all'); go('jobs-govt'); }}>{t('govtTab')}</button>
        <button role="tab" aria-selected={tab === 'private'} className={tab === 'private' ? 'on' : ''} onClick={() => { setSector('all'); go('jobs-private'); }}>{t('privateTab')}</button>
      </div>
      <div className="toolbar">
        <label className="search">
          <Icon name="search" size={18} />
          <input id="job-search" type="search" placeholder={t('searchJobs')} value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <label className="switch">
          <input id="job-mine" type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} />
          <span>{t('onlyMine')}</span>
        </label>
      </div>
      <div className="chips scroll">
        <button className={'chip ' + (sector === 'all' ? 'on' : '')} onClick={() => setSector('all')}>{t('allSectors')} <span className="n">{inTab.length}</span></button>
        {sectors.filter((s) => count(s) > 0).map((s) => (
          <button key={s} className={'chip ' + (s === sector ? 'on' : '')} onClick={() => setSector(s)}>{s} <span className="n">{count(s)}</span></button>
        ))}
      </div>
      {tab === 'private' && (
        <div className="chips">
          {(['all', 'remote', 'hybrid', 'onsite'] as const).map((m) => (
            <button key={m} className={'chip small ' + (m === mode ? 'on' : '')} onClick={() => setMode(m)}>{m === 'all' ? t('all') : t(m)}</button>
          ))}
        </div>
      )}
      <p className="result-line">{shown.length} {t('resultsCount')}{!profile.level && <> · <button className="link" onClick={() => go('profile')}>{t('completeProfile')}</button></>}</p>
      <div className="grid">{shown.map(({ opp, result }) => <OppCard key={opp.id} opp={opp} result={result} />)}</div>
      {!shown.length && <p className="empty">{inTab.length ? t('noResults') : t('verifyingSoon')}</p>}
      {tab === 'govt' && <NoticeFeed areas={['job', 'exam']} limit={inTab.length ? 6 : 12} more={() => go('updates')} />}
    </section>
  );
}
