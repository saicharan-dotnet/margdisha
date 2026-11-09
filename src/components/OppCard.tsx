import { useState } from 'react';
import { useApp } from '../app-context';
import type { MatchResult, Opportunity } from '../data/types';
import { daysLeft } from '../engine/match';

const STATUS_CLASS = { likely: 'ok', verify: 'warn', not: 'bad' } as const;

export function VerificationBadge({ opp }: { opp: Opportunity }) {
  const { t } = useApp();
  if (opp.status === 'verified' && !opp.sample)
    return <span className="badge verified">✓ {t('lastVerified')}: {opp.source.lastVerifiedOn}</span>;
  return <span className="badge unverified">⚠ {opp.sample ? t('sample') + ' · ' : ''}{t('notVerified')}</span>;
}

export function DeadlineTag({ deadline }: { deadline?: string }) {
  const { t } = useApp();
  if (!deadline) return null;
  const d = daysLeft(deadline);
  if (d < 0) return <span className="badge expired">{t('expired')} · {deadline}</span>;
  return <span className={'badge ' + (d <= 14 ? 'soon' : 'neutral')}>{t('deadline')}: {deadline} · {d} {t('daysLeft')}</span>;
}

export function OppCard({ opp, result }: { opp: Opportunity; result: MatchResult }) {
  const { t, saved, toggleSaved, go } = useApp();
  const [open, setOpen] = useState(false);
  const isSaved = saved.includes(opp.id);
  return (
    <article className={'card opp ' + (result.expired ? 'is-expired' : '')}>
      <header>
        <span className={'pill ' + STATUS_CLASS[result.status]}>{t(result.status)}</span>
        <span className="kind">{t(opp.kind)} · {opp.scope}</span>
      </header>
      <h3>{opp.title}</h3>
      <p className="muted">{opp.provider}</p>
      <p>{opp.summary}</p>
      <div className="tags">
        <DeadlineTag deadline={opp.deadline} />
        <VerificationBadge opp={opp} />
      </div>
      {result.missing.length > 0 && (
        <p className="missing">
          {t('missingInfo')}: {result.missing.join(', ')}{' '}
          <button className="link" onClick={() => go('profile')}>→</button>
        </p>
      )}
      <button className="link" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? '▾' : '▸'} {t('whyResult')}</button>
      {open && (
        <div className="details">
          <ul className="reasons">
            {result.reasons.map((r, i) => (
              <li key={i} className={r.ok === true ? 'r-ok' : r.ok === false ? 'r-bad' : 'r-unk'}>
                <span aria-hidden>{r.ok === true ? '✓' : r.ok === false ? '✗' : '?'}</span> {r.text}
              </li>
            ))}
            {result.reasons.length === 0 && <li className="r-unk">No conditions recorded yet.</li>}
          </ul>
          {opp.amount && <p><b>Amount:</b> {opp.amount}</p>}
          {opp.salary && <p><b>Salary:</b> {opp.salary}</p>}
          {opp.selection && <p><b>Selection:</b> {opp.selection}</p>}
          {opp.documents && <p><b>Documents:</b> {opp.documents.join(', ')}</p>}
          <p className="small muted">{t('noGuarantee')}</p>
        </div>
      )}
      <footer>
        <a href={opp.source.url} target="_blank" rel="noreferrer">{t('officialSource')}: {opp.source.label} ↗</a>
        <button className={'btn ' + (isSaved ? 'secondary' : '')} onClick={() => toggleSaved(opp.id)}>{isSaved ? t('unsave') : t('save')}</button>
      </footer>
    </article>
  );
}
