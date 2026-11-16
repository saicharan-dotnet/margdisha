import { useApp } from '../app-context';
import type { ScholarshipGuide } from '../data/scholarships';

/** One scholarship: what it gives, who can apply, when forms usually open, steps and official links. */
export function ScholarshipCard({ s }: { s: ScholarshipGuide }) {
  const { t } = useApp();
  return (
    <article className="cal-card priv-card">
      <div className="cal-joins">{s.scope} · {s.levels.join(', ')}</div>
      <h3>{s.title}</h3>
      <p className="cal-gives"><b>{t('givesYou')}:</b> {s.gives}</p>
      <dl className="facts">
        <div><dt>{t('formsUsually')}</dt><dd>{s.when}</dd></div>
      </dl>
      <p className="small"><b>{t('eligibilityLbl')}:</b> {s.who}</p>
      {s.note && <p className="small muted">{s.note}</p>}
      <details className="cal-steps">
        <summary>{t('howToApply')}</summary>
        <ol>{s.steps.map((x, i) => <li key={i}>{x}</li>)}</ol>
      </details>
      <div className="priv-links">
        {s.links.map((l) => <a key={l.url} className="btn ghost sm" href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>)}
      </div>
    </article>
  );
}
