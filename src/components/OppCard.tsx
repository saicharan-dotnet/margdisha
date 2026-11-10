import { useState } from 'react';
import { useApp } from '../app-context';
import type { MatchResult, Opportunity } from '../data/types';
import { daysLeft, LEVEL_LABEL } from '../engine/match';
import { Icon } from './Icon';

const STATUS_CLASS = { likely: 'ok', verify: 'warn', not: 'bad' } as const;

export function VerificationBadge({ opp }: { opp: Opportunity }) {
  const { t } = useApp();
  if (opp.status === 'verified' && !opp.sample)
    return <span className="badge verified"><Icon name="shield" size={14} /> {t('lastVerified')}: {opp.source.lastVerifiedOn}</span>;
  return <span className="badge unverified">{opp.sample ? t('sample') + ' · ' : ''}{t('notVerified')}</span>;
}

export function DeadlineTag({ deadline }: { deadline?: string }) {
  const { t } = useApp();
  if (!deadline) return null;
  const d = daysLeft(deadline);
  const nice = new Date(deadline + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  if (d < 0) return <span className="deadline expired"><Icon name="clock" size={14} /> {t('expired')} · {nice}</span>;
  return <span className={'deadline ' + (d <= 14 ? 'soon' : '')}><Icon name="clock" size={14} /> {nice} · {d} {t('daysLeft')}</span>;
}

function ageText(o: Opportunity) {
  const { minAge, maxAge } = o.criteria;
  if (minAge === undefined && maxAge === undefined) return undefined;
  return maxAge === undefined ? `${minAge}+` : `${minAge ?? '—'}–${maxAge}`;
}

export function OppCard({ opp, result }: { opp: Opportunity; result: MatchResult }) {
  const { t, saved, toggleSaved, go } = useApp();
  const [open, setOpen] = useState(false);
  const isSaved = saved.includes(opp.id);
  const qual = opp.criteria.minLevel ? LEVEL_LABEL[opp.criteria.minLevel] : opp.criteria.studyingAt?.map((l) => LEVEL_LABEL[l]).join(' / ');
  const facts: [string, string | undefined][] = [
    [t('qualNeeded'), qual],
    [t('ageLimit'), ageText(opp)],
    [t('location'), opp.location],
    [t('experience'), opp.experience],
    [t('entryClass'), opp.entryClass],
  ];
  return (
    <article className={'opp ' + (result.expired ? 'is-expired' : '')}>
      <div className="opp-top">
        <span className={'pill ' + STATUS_CLASS[result.status]}>{t(result.status)}</span>
        <DeadlineTag deadline={opp.deadline} />
      </div>
      <div className="opp-kicker">{opp.sector ?? t(opp.kind)} · {opp.scope}{opp.workMode ? ' · ' + t(opp.workMode) : ''}</div>
      <h3>{opp.title}</h3>
      <p className="opp-provider">{opp.provider}</p>
      <dl className="facts">
        {facts.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
      <p className="opp-summary">{opp.summary}</p>
      {result.missing.length > 0 && (
        <button className="missing" onClick={() => go('profile')}>
          {t('missingInfo')}: {result.missing.join(', ')} <Icon name="arrow" size={14} />
        </button>
      )}
      <button className="disclose" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? '−' : '+'} {t('whyResult')}</button>
      {open && (
        <div className="details">
          <ul className="reasons">
            {result.reasons.map((r, i) => (
              <li key={i} className={r.ok === true ? 'r-ok' : r.ok === false ? 'r-bad' : 'r-unk'}>
                <span aria-hidden>{r.ok === true ? '✓' : r.ok === false ? '✗' : '?'}</span> {r.text}
              </li>
            ))}
            {result.reasons.length === 0 && <li className="r-unk"><span>?</span> No conditions recorded yet.</li>}
          </ul>
          {opp.amount && <p><b>Amount:</b> {opp.amount}</p>}
          {opp.salary && <p><b>Pay:</b> {opp.salary}</p>}
          {opp.selection && <p><b>Selection:</b> {opp.selection}</p>}
          {opp.documents && <p><b>Documents:</b> {opp.documents.join(', ')}</p>}
          <p className="small muted">{t('noGuarantee')}</p>
        </div>
      )}
      <div className="opp-foot">
        <VerificationBadge opp={opp} />
        <div className="opp-actions">
          <a className="btn ghost sm" href={opp.source.url} target="_blank" rel="noreferrer" title={opp.source.label}>{t('officialSource')} ↗</a>
          <button className={'btn sm ' + (isSaved ? 'secondary' : '')} onClick={() => toggleSaved(opp.id)}>{isSaved ? t('unsave') : t('save')}</button>
        </div>
      </div>
    </article>
  );
}
