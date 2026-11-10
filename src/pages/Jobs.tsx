import { useMemo, useState } from 'react';
import { useApp } from '../app-context';
import { GOVT_SECTORS, PRIVATE_SECTORS, type WorkMode } from '../data/types';
import { matchAll } from '../engine/match';
import { OppCard } from '../components/OppCard';
import { Icon } from '../components/Icon';
import { NoticeFeed } from '../components/NoticeFeed';
import { CalendarCard, latestNoticeFor } from '../components/CalendarCard';
import { JOB_CALENDAR } from '../data/job-calendar';
import { monthsUntil } from '../data/school-calendar';
import type { Level } from '../data/types';

/** Minimum qualification of a calendar entry, and what a profile level counts as. */
const QUAL_RANK: Record<string, number> = { '10th pass': 1, '12th pass': 2, Graduate: 3 };
const LEVEL_RANK: Partial<Record<Level, number>> = { class10: 1, diploma: 1, inter: 2, ug: 3, pg: 3 };

export function Jobs({ tab }: { tab: 'govt' | 'private' }) {
  const { t, profile, opps, go, notices } = useApp();
  const [sector, setSector] = useState<string>('all');
  const [mine, setMine] = useState(false);
  const [q, setQ] = useState('');
  const [mode, setMode] = useState<WorkMode | 'all'>('all');
  const [qual, setQual] = useState<number>(() => (profile.level && LEVEL_RANK[profile.level]) || 0);
  const now = new Date().getMonth() + 1;
  const cal = JOB_CALENDAR.filter((e) => !qual || QUAL_RANK[e.joins] <= qual)
    .sort((a, b) => monthsUntil(now, a.formsFrom, a.formsTo) - monthsUntil(now, b.formsFrom, b.formsTo));

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
      <div className="page-head jobs-head">
        <h1>{t('navJobs')}</h1>
        <p className="lede">{t('jobsIntro')}</p>
      </div>
      <div className="segmented" role="tablist">
        <button role="tab" aria-selected={tab === 'govt'} className={tab === 'govt' ? 'on' : ''} onClick={() => { setSector('all'); go('jobs-govt'); }}>{t('govtTab')}</button>
        <button role="tab" aria-selected={tab === 'private'} className={tab === 'private' ? 'on' : ''} onClick={() => { setSector('all'); go('jobs-private'); }}>{t('privateTab')}</button>
      </div>
      {tab === 'govt' && <>
        <h2 className="section-h"><Icon name="clock" size={20} /> {t('jobCalTitle')}</h2>
        <p className="small muted">{t('jobCalNote')}</p>
        <div className="filter-block">
          <span className="filter-label">{t('myQual')}</span>
          <div className="chips scroll">
            {([[0, t('all')], [1, t('qual10')], [2, t('qual12')], [3, t('qualDeg')]] as [number, string][]).map(([r, l]) => (
              <button key={r} className={'chip ' + (qual === r ? 'on' : '')} onClick={() => setQual(r)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="cal-grid">
          {cal.map((e) => <CalendarCard key={e.id} e={e} whoLabel={t('eligibilityLbl')} latest={latestNoticeFor(notices, e, (a) => a !== 'school')} />)}
        </div>
      </>}

      {(tab === 'private' || inTab.length > 0) && <>
      {tab === 'govt' && <h2 className="section-h">{t('verifiedJobs')}</h2>}
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
      </>}
      {tab === 'govt' && <NoticeFeed areas={['job', 'exam']} limit={inTab.length ? 6 : 12} more={() => go('updates')} />}
    </section>
  );
}
