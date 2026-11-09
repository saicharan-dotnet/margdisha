import type React from 'react';
import { useMemo, useState } from 'react';
import { useApp } from '../app-context';
import type { Key } from '../i18n/strings';
import { daysLeft, LEVEL_LABEL } from '../engine/match';
import { Icon } from '../components/Icon';
import { NoticeFeed } from '../components/NoticeFeed';
import { DeadlineTag } from '../components/OppCard';
import type { Level } from '../data/types';
import hero from '../assets/hero.jpg';
import heroSmall from '../assets/hero-800.jpg';

const PICK: Level[] = ['class5', 'class8', 'class10', 'inter', 'diploma', 'ug', 'pg'];
const PICK_HINT: Partial<Record<Level, string>> = {
  class5: 'Navodaya · Sainik · Gurukul', class8: 'Class 9 entry · NMMS',
  class10: 'SSC / 10th', inter: 'MPC · BiPC · MEC · CEC', diploma: 'Polytechnic / ITI', ug: 'B.Tech · B.Sc · B.Com · B.A.', pg: 'M.Tech · M.Sc · MBA · M.A.',
};
const SCHOOL_LEVELS: Level[] = ['class5', 'class8'];

const QUESTIONS: [Key, string, string][] = [
  ['q1', 'explore', 'Courses'], ['q2', 'explore', 'Careers'], ['q3', 'matches-scholarship', 'Scholarships'],
  ['q4', 'jobs-govt', 'Government jobs'], ['q5', 'jobs-private', 'Private jobs'], ['q6', 'matches-exam', 'Entrance exams'],
  ['q7', 'matches-skill', 'Skills'], ['q8', 'matches-abroad', 'Abroad'], ['q9', 'dashboard', 'Next step'],
];

export function Home() {
  const { t, go, profile, setProfile, opps } = useApp();
  const [q, setQ] = useState('');
  const n = (f: (k: string) => boolean) => opps.filter((o) => f(o.kind)).length;
  const closing = useMemo(() => opps
    .filter((o) => o.deadline && daysLeft(o.deadline) >= 0)
    .sort((a, b) => a.deadline!.localeCompare(b.deadline!)).slice(0, 6), [opps]);

  const tiles: [string, string, number, Key | string, string, string][] = [
    ['govt', 'jobs-govt', n((k) => k === 'govt-job'), t('govt-job'), 'SSC · Railways · UPSC · Banking · Police · Defence', 'briefcase'],
    ['school', 'schools', n((k) => k === 'school-admission'), t('school-admission'), t('schoolTile'), 'school'],
    ['pvt', 'jobs-private', n((k) => k === 'private-job' || k === 'internship'), `${t('private-job')} & ${t('internship')}`, 'Freshers · Work from home · Near you', 'briefcase'],
    ['sch', 'matches-scholarship', n((k) => k === 'scholarship'), t('scholarship'), 'Central · Telangana · Andhra Pradesh · Private', 'shield'],
  ];

  return (
    <>
      <section className="hero">
        <div className="hero-banner" style={{ '--hero': `url(${hero})`, '--hero-sm': `url(${heroSmall})` } as React.CSSProperties}>
          <p className="eyebrow">{t('startHere')}</p>
          <h1>{t('tagline')}</h1>
          <p className="lede">{t('heroSub')}</p>
          <form className="hero-search" role="search" onSubmit={(e) => { e.preventDefault(); go('search?q=' + encodeURIComponent(q.trim())); }}>
            <Icon name="search" size={20} />
            <input id="home-search" type="search" aria-label={t('searchAll')} placeholder={t('searchAll')} value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="btn">{t('searchBtn')}</button>
          </form>
        </div>

        <h2 className="pick-h">{t('pickLevel')}</h2>
        <div className="level-grid">
          {PICK.map((l) => {
            const school = SCHOOL_LEVELS.includes(l);
            return (
              <button key={l} className={'level ' + (school ? 'is-school' : '')} onClick={() => {
                setProfile({ ...profile, level: l, levelStatus: school ? 'pursuing' : profile.levelStatus ?? 'completed' });
                go(school ? 'schools' : 'explore');
              }}>
                {school && <span className="level-tag">{t('forSchool')}</span>}
                <span className="level-name">{LEVEL_LABEL[l]}</span>
                <span className="level-hint">{PICK_HINT[l]}</span>
                <Icon name="arrow" size={18} />
              </button>
            );
          })}
        </div>
      </section>

      <section className="split">
        {tiles.map(([cls, route, count, label, sub, icon]) => (
          <button key={cls} className={'feature ' + cls} onClick={() => go(route)}>
            <span className="feature-icon"><Icon name={icon as 'briefcase'} size={22} /></span>
            <span className="feature-n">{count}</span>
            <span className="feature-t">{label}</span>
            <span className="feature-s">{sub}</span>
          </button>
        ))}
      </section>
      <p className="small muted center">Counts are sample listings in this demo.</p>

      <section className="home-two">
        <div className="panel">
          <h2 className="section-h"><Icon name="clock" size={20} /> {t('closingSoon')}</h2>
          <ul className="closing">
            {closing.map((o) => (
              <li key={o.id}>
                <button className="closing-item" onClick={() => go(o.kind === 'govt-job' ? 'jobs-govt' : o.kind === 'private-job' || o.kind === 'internship' ? 'jobs-private' : o.kind === 'school-admission' ? 'schools' : 'matches-' + o.kind)}>
                  <span className="closing-title">{o.title}</span>
                  <span className="closing-meta">{o.sector ?? t(o.kind as Key)} · <DeadlineTag deadline={o.deadline} /></span>
                </button>
              </li>
            ))}
            {!closing.length && <li className="muted">—</li>}
          </ul>
        </div>
        <div className="panel">
          <NoticeFeed limit={6} more={() => go('updates')} />
        </div>
      </section>

      <section>
        <h2 className="section-h">{t('exploreAll')}</h2>
        <div className="qgrid">
          {QUESTIONS.map(([k, route, label]) => (
            <button key={k} className="qcard" onClick={() => go(route)}>
              <span className="qcard-label">{label}</span>
              <span className="qcard-q">{t(k)}</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
