import { useApp } from '../app-context';
import type { PrivateRoute } from '../data/private-jobs';

/** One "way in" to private jobs: typical roles, who fits, selection, steps and official links. */
export function PrivateCard({ r }: { r: PrivateRoute }) {
  const { t } = useApp();
  return (
    <article className="cal-card priv-card">
      <div className="cal-joins">{r.sector}{r.state ? ` · ${r.state}` : ''}</div>
      <h3>{r.title}</h3>
      <p className="cal-gives"><b>{t('typicalRoles')}:</b> {r.roles}</p>
      <dl className="facts">
        <div><dt>{t('selectionLbl')}</dt><dd>{r.selection}</dd></div>
      </dl>
      <p className="small"><b>{t('eligibilityLbl')}:</b> {r.who}</p>
      {r.note && <p className="small muted">{r.note}</p>}
      <details className="cal-steps">
        <summary>{t('howToApply')}</summary>
        <ol>{r.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
      </details>
      <div className="priv-links">
        {r.links.map((l) => <a key={l.url} className="btn ghost sm" href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>)}
      </div>
    </article>
  );
}
