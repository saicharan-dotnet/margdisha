import { useMemo, useState } from 'react';
import { useApp } from '../app-context';
import { matchAll } from '../engine/match';
import { OppCard } from '../components/OppCard';
import { Icon } from '../components/Icon';
import { ago } from '../components/NoticeFeed';
import { CalendarCard } from '../components/CalendarCard';
import { JOB_CALENDAR } from '../data/job-calendar';
import { EXAM_GUIDE } from '../data/exam-guide';
import { SCHOOL_CALENDAR, type CalendarEntry } from '../data/school-calendar';
import { PRIVATE_JOBS } from '../data/private-jobs';
import { PrivateCard } from '../components/PrivateCard';

const GUIDES: CalendarEntry[] = [...EXAM_GUIDE, ...JOB_CALENDAR, ...SCHOOL_CALENDAR];

/** Words people type in Telugu or Hindi, or short forms, mapped to words in the listings. */
const ALIASES: Record<string, string> = {
  'నవోదయ': 'navodaya', 'नवोदय': 'navodaya', 'సైనిక్': 'sainik', 'सैनिक': 'sainik', 'రైల్వే': 'railway', 'रेलवे': 'railway',
  'స్కాలర్‌షిప్': 'scholarship', 'छात्रवृत्ति': 'scholarship', 'kv': 'kendriya', 'jnv': 'navodaya', 'rrb': 'railway', 'gurukul': 'gurukul',
  'బ్యాంక్': 'bank', 'बैंक': 'bank', 'పోలీస్': 'police', 'पुलिस': 'police',
  'eamcet': 'eapcet', 'emcet': 'eapcet', 'zenco': 'genco', 'genco': 'genco', 'transco': 'transco', 'postal': 'post', 'iiit': 'iiit', 'iit': 'iit',
  'groups': 'group', 'appsc': 'appsc', 'tspsc': 'tgpsc', 'tgpsc': 'tgpsc', 'polycet': 'polycet', 'polytechnic': 'polycet', 'ias': 'civil services',
  'pcest': 'polycet', 'vizag': 'vizag', 'steel': 'steel', 'teacher': 'teach', 'dsc': 'dsc', 'tet': 'tet', 'mba': 'mba', 'mtech': 'm.tech', 'btech': 'b.tech',
  'private': 'private', 'it': 'it', 'software': 'software', 'bpo': 'bpo', 'apprentice': 'apprentice', 'internship': 'intern', 'delivery': 'delivery', 'pharma': 'pharma', 'nurse': 'nurs', 'iti': 'iti',
  'ప్రైవేట్': 'private', 'प्राइवेट': 'private',
};

export function Search({ initial }: { initial: string }) {
  const { t, profile, opps, notices, go } = useApp();
  const [q, setQ] = useState(initial);
  const words = q.toLowerCase().split(/\s+/).filter(Boolean).map((w) => ALIASES[w] ?? w);
  const hit = (s: string) => words.length > 0 && words.every((w) => s.toLowerCase().includes(w));
  const results = useMemo(() => matchAll(profile, opps, { includeUnverified: true })
    .filter((m) => hit([m.opp.title, m.opp.provider, m.opp.summary, m.opp.sector, m.opp.location, m.opp.tags.join(' '), m.opp.kind].join(' '))),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [profile, opps, q]);
  const guides = GUIDES.filter((e) => hit([e.school, e.sector, e.joins, e.who, e.gives, e.note, e.state, e.selection].join(' '))).slice(0, 12);
  const privs = PRIVATE_JOBS.filter((r) => hit(['private', r.title, r.sector, r.roles, r.who, r.quals.join(' '), r.state].join(' '))).slice(0, 8);
  const found = notices.filter((n) => n.status !== 'ignored' && hit(`${n.title} ${n.source_name} ${n.sector ?? ''}`)).slice(0, 20);

  return (
    <section className="page">
      <h1>{t('searchTitle')}</h1>
      <form className="toolbar" role="search" onSubmit={(e) => { e.preventDefault(); go('search?q=' + encodeURIComponent(q.trim())); }}>
        <label className="search"><Icon name="search" size={18} />
          <input id="search-q" type="search" autoFocus placeholder={t('searchAll')} value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </form>
      {!words.length ? <p className="empty">{t('searchEmpty')}</p> : (
        <>
          <p className="result-line">{results.length + guides.length + privs.length + found.length} {t('resultsCount')}</p>
          {(guides.length > 0 || privs.length > 0) && <>
            <h2 className="section-h">{t('guidesFound')}</h2>
            <div className="cal-grid">{guides.map((e) => <CalendarCard key={e.id} e={e} />)}{privs.map((r) => <PrivateCard key={r.id} r={r} />)}</div>
          </>}
          <div className="grid">{results.map(({ opp, result }) => <OppCard key={opp.id} opp={opp} result={result} />)}</div>
          {found.length > 0 && (
            <div className="feed">
              <h2 className="section-h">{t('fromOfficial')}</h2>
              <p className="small muted feed-note">{t('latestNote')}</p>
              <ul className="feed-list">
                {found.map((x) => (
                  <li key={x.id}><a href={x.url} target="_blank" rel="noreferrer">
                    <span className={'feed-src a-' + x.area}>{x.sector ?? x.source_name}</span>
                    <span className="feed-title">{x.title}</span>
                    <span className="feed-meta">{x.source_name} · {ago(x.first_seen, t)} <Icon name="arrow" size={14} /></span>
                  </a></li>
                ))}
              </ul>
            </div>
          )}
          {!results.length && !found.length && !guides.length && !privs.length && <p className="empty">{t('noResults')}</p>}
        </>
      )}
    </section>
  );
}
