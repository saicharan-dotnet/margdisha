import { useMemo, useState } from 'react';
import { useApp } from '../app-context';
import { SCHOOL_SECTORS } from '../data/types';
import { matchAll } from '../engine/match';
import { OppCard } from '../components/OppCard';
import { NoticeFeed } from '../components/NoticeFeed';
import { Icon } from '../components/Icon';
import { SCHOOL_CALENDAR, calendarStatus, monthName, monthsUntil, type CalendarEntry } from '../data/school-calendar';

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
  const { t, profile, opps, notices } = useApp();
  const [type, setType] = useState('all');
  const [child, setChild] = useState<string>('any');
  const items = useMemo(() => matchAll(profile, opps, { includeUnverified: true })
    .filter((m) => m.opp.kind === 'school-admission' || (m.opp.sector && (SCHOOL_SECTORS as readonly string[]).includes(m.opp.sector))), [profile, opps]);
  const wanted = CHILD.find(([c]) => c === child)?.[1];
  const shown = items.filter((m) =>
    (type === 'all' || m.opp.sector === type) &&
    (!wanted || wanted.some((w) => new RegExp(`\\b${w}\\b`).test(m.opp.entryClass ?? ''))));
  const matchesChild = (entry: string) => !wanted || wanted.some((w) => new RegExp(`\\b${w}\\b`).test(entry));
  const now = new Date().getMonth() + 1;
  const cal = SCHOOL_CALENDAR
    .filter((e) => (type === 'all' || e.sector === type) && matchesChild(e.joins) && (!e.state || !profile.state || profile.state === e.state))
    .sort((a, b) => monthsUntil(now, a.formsFrom, a.formsTo) - monthsUntil(now, b.formsFrom, b.formsTo));
  const count = (s: string) => SCHOOL_CALENDAR.filter((e) => e.sector === s).length + items.filter((m) => m.opp.sector === s).length;
  const latestFor = (sector: string) => notices.find((n) => n.status !== 'ignored' && n.sector === sector && n.area !== 'job');

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
          <button className={'chip ' + (type === 'all' ? 'on' : '')} onClick={() => setType('all')}>{t('all')}</button>
          {SCHOOL_SECTORS.filter((s) => count(s) > 0).map((s) => (
            <button key={s} className={'chip ' + (s === type ? 'on' : '')} onClick={() => setType(s)}>{s}</button>
          ))}
        </div>
      </div>

      <h2 className="section-h"><Icon name="clock" size={20} /> {t('calTitle')}</h2>
      <p className="small muted">{t('calNote')}</p>
      <div className="cal-grid">
        {cal.map((e) => <CalendarCard key={e.id} e={e} latest={latestFor(e.sector)} />)}
      </div>
      {!cal.length && <p className="empty">{t('noResults')}</p>}

      {shown.length > 0 && <>
        <h2 className="section-h">{t('verifiedListings')}</h2>
        <div className="grid">{shown.map(({ opp, result }) => <OppCard key={opp.id} opp={opp} result={result} />)}</div>
      </>}

      <NoticeFeed areas={['school', 'scholarship']} limit={6} />
    </section>
  );
}

function CalendarCard({ e, latest }: { e: CalendarEntry; latest?: { title: string; url: string } }) {
  const { t } = useApp();
  const st = calendarStatus(e);
  const span = e.formsFrom === e.formsTo ? monthName(e.formsFrom) : `${monthName(e.formsFrom)} – ${monthName(e.formsTo)}`;
  return (
    <article className={'cal-card cal-' + st}>
      <span className={'cal-pill ' + st}>{st === 'open' ? t('openNow') : st === 'soon' ? t('opensSoon') : `${t('usuallyOpens')} ${monthName(e.formsFrom)}`}</span>
      <div className="cal-joins">{e.joins}</div>
      <h3>{e.school}</h3>
      <dl className="facts">
        <div><dt>{t('formsUsually')}</dt><dd>{span}</dd></div>
        <div><dt>{t('selectionLbl')}</dt><dd>{e.selection}</dd></div>
      </dl>
      <p className="small"><b>{t('whoCanApply')}:</b> {e.who}</p>
      {latest && <a className="cal-latest" href={latest.url} target="_blank" rel="noreferrer"><span className="small muted">{t('latestNotice')}</span>{latest.title}</a>}
      <a className="btn ghost sm cal-link" href={e.url} target="_blank" rel="noreferrer">{t('officialSite')} ↗</a>
    </article>
  );
}
