import type React from 'react';
import { useApp } from '../app-context';
import type { Key } from '../i18n/strings';
import { LEVEL_LABEL } from '../engine/match';
import { Icon } from '../components/Icon';
import type { Level } from '../data/types';
import hero from '../assets/hero.jpg';
import heroSmall from '../assets/hero-800.jpg';

const PICK: Level[] = ['class10', 'inter', 'diploma', 'ug', 'pg'];
const PICK_HINT: Partial<Record<Level, string>> = {
  class10: 'SSC / 10th', inter: 'MPC · BiPC · MEC · CEC', diploma: 'Polytechnic / ITI', ug: 'B.Tech · B.Sc · B.Com · B.A.', pg: 'M.Tech · M.Sc · MBA · M.A.',
};

const QUESTIONS: [Key, string, string][] = [
  ['q1', 'explore', 'Courses'], ['q2', 'explore', 'Careers'], ['q3', 'matches-scholarship', 'Scholarships'],
  ['q4', 'jobs-govt', 'Government jobs'], ['q5', 'jobs-private', 'Private jobs'], ['q6', 'matches-exam', 'Entrance exams'],
  ['q7', 'matches-skill', 'Skills'], ['q8', 'matches-abroad', 'Abroad'], ['q9', 'dashboard', 'Next step'],
];

export function Home() {
  const { t, go, profile, setProfile, opps } = useApp();
  const govt = opps.filter((o) => o.kind === 'govt-job').length;
  const pvt = opps.filter((o) => o.kind === 'private-job' || o.kind === 'internship').length;
  const sch = opps.filter((o) => o.kind === 'scholarship').length;
  return (
    <>
      <section className="hero">
        <div className="hero-banner" style={{ '--hero': `url(${hero})`, '--hero-sm': `url(${heroSmall})` } as React.CSSProperties}>
          <p className="eyebrow">{t('startHere')}</p>
          <h1>{t('tagline')}</h1>
          <p className="lede">{t('heroSub')}</p>
        </div>
        <h2 className="pick-h">{t('pickLevel')}</h2>
        <div className="level-grid">
          {PICK.map((l) => (
            <button key={l} className="level" onClick={() => { setProfile({ ...profile, level: l, levelStatus: profile.levelStatus ?? 'completed' }); go('explore'); }}>
              <span className="level-name">{LEVEL_LABEL[l]}</span>
              <span className="level-hint">{PICK_HINT[l]}</span>
              <Icon name="arrow" size={18} />
            </button>
          ))}
        </div>
      </section>

      <section className="split">
        <button className="feature govt" onClick={() => go('jobs-govt')}>
          <span className="feature-n">{govt}</span>
          <span className="feature-t">{t('govt-job')}</span>
          <span className="feature-s">UPSC · SSC · Banking · Railways · Defence · Police · Teaching · PSU</span>
        </button>
        <button className="feature pvt" onClick={() => go('jobs-private')}>
          <span className="feature-n">{pvt}</span>
          <span className="feature-t">{t('private-job')} & {t('internship')}</span>
          <span className="feature-s">Freshers · Experienced · Work from home · Near you</span>
        </button>
        <button className="feature sch" onClick={() => go('matches-scholarship')}>
          <span className="feature-n">{sch}</span>
          <span className="feature-t">{t('scholarship')}</span>
          <span className="feature-s">Central · Telangana · Andhra Pradesh · Private</span>
        </button>
      </section>
      <p className="small muted center">Counts are sample listings in this demo.</p>

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
