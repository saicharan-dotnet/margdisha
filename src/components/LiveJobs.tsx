import { useState } from 'react';
import { useApp } from '../app-context';
import { Icon } from './Icon';
import { liveJobs, LIVE_JOBS_UPDATED } from '../data/live-jobs';

const nice = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

/** Fresh jobs from companies' official job boards, each with a link to apply on the company site. */
export function LiveJobs() {
  const { t } = useApp();
  const [kind, setKind] = useState<'all' | 'job' | 'intern'>('all');
  const [more, setMore] = useState(false);
  const jobs = liveJobs();
  if (!jobs.length) return null;
  const shown = jobs.filter((j) => kind === 'all' || (kind === 'intern') === j.intern);
  const list = more ? shown : shown.slice(0, 12);
  const n = (k: 'job' | 'intern') => jobs.filter((j) => (k === 'intern') === j.intern).length;
  return (
    <div className="live-jobs">
      <h2 className="section-h"><Icon name="briefcase" size={20} /> {t('liveJobsTitle')} <span className="count">{jobs.length}</span></h2>
      <p className="small muted">{t('liveJobsNote')}{LIVE_JOBS_UPDATED && <> · {t('updatedOn')} {nice(LIVE_JOBS_UPDATED)}</>}</p>
      <div className="chips">
        <button className={'chip ' + (kind === 'all' ? 'on' : '')} onClick={() => setKind('all')}>{t('all')} <span className="n">{jobs.length}</span></button>
        {n('job') > 0 && <button className={'chip ' + (kind === 'job' ? 'on' : '')} onClick={() => setKind('job')}>{t('liveJobsJobs')} <span className="n">{n('job')}</span></button>}
        {n('intern') > 0 && <button className={'chip ' + (kind === 'intern' ? 'on' : '')} onClick={() => setKind('intern')}>{t('internship')} <span className="n">{n('intern')}</span></button>}
      </div>
      <div className="live-list">
        {list.map((j) => (
          <article key={j.id} className="live-job">
            <div className="live-main">
              <h3>{j.title}</h3>
              <p className="small"><b>{j.company}</b> · {j.location}</p>
              <p className="small muted">{t('sourceLbl')}: {j.source} · {t('alertUntil')} {nice(j.expires)}</p>
            </div>
            <a className="btn sm" href={j.url} target="_blank" rel="noreferrer nofollow">{t('applyOnSite')} ↗</a>
          </article>
        ))}
      </div>
      {shown.length > list.length && <button className="btn ghost sm" onClick={() => setMore(true)}>{t('showAll')} ({shown.length})</button>}
    </div>
  );
}
