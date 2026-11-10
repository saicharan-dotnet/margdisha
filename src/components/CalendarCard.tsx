import { useApp } from '../app-context';
import { calendarStatus, monthName, type CalendarEntry } from '../data/school-calendar';

/** One row of a "when do forms usually open" calendar, with the latest matching official notice. */
export function CalendarCard({ e, latest, whoLabel }: { e: CalendarEntry; latest?: { title: string; url: string }; whoLabel?: string }) {
  const { t } = useApp();
  const st = calendarStatus(e);
  const span = e.formsFrom === e.formsTo ? monthName(e.formsFrom) : `${monthName(e.formsFrom)} – ${monthName(e.formsTo)}`;
  return (
    <article className={'cal-card cal-' + st}>
      <span className={'cal-pill ' + st}>{st === 'open' ? t('openNow') : st === 'soon' ? t('opensSoon') : st === 'irregular' ? t('whenVacancies') : `${t('usuallyOpens')} ${monthName(e.formsFrom)}`}</span>
      <div className="cal-joins">{e.joins}</div>
      <h3>{e.school}</h3>
      {e.gives && <p className="cal-gives"><b>{t('givesYou')}:</b> {e.gives}</p>}
      <dl className="facts">
        <div><dt>{t('formsUsually')}</dt><dd>{e.irregular ? t('noFixedMonth') : span}</dd></div>
        <div><dt>{t('selectionLbl')}</dt><dd>{e.selection}</dd></div>
      </dl>
      <p className="small"><b>{whoLabel ?? t('whoCanApply')}:</b> {e.who}</p>
      {e.note && <p className="small muted">{e.note}</p>}
      {e.steps && (
        <details className="cal-steps">
          <summary>{t('howToApply')}</summary>
          <ol>{e.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
        </details>
      )}
      {latest && <a className="cal-latest" href={latest.url} target="_blank" rel="noreferrer"><span className="small muted">{t('latestNotice')}</span>{latest.title}</a>}
      <a className="btn ghost sm cal-link" href={e.url} target="_blank" rel="noreferrer">{t('officialSite')} ↗</a>
    </article>
  );
}

/** Latest collected notice for a calendar entry: same sector, and the entry's words in the title when it has them. */
export function latestNoticeFor<N extends { title: string; url: string; sector?: string | null; status?: string; area?: string }>(
  notices: N[], e: CalendarEntry, area?: (a?: string) => boolean, anySector = false,
): N | undefined {
  const re = e.match ? new RegExp(`\\b(${e.match})\\b`, 'i') : null;
  if (anySector && !re) return undefined;
  return notices.find((n) => n.status !== 'ignored' && (anySector || n.sector === e.sector) && (!area || area(n.area)) && (!re || re.test(n.title)));
}
