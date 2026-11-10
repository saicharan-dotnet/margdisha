import { useState } from 'react';
import { useApp } from '../app-context';
import { Icon } from '../components/Icon';
import { CalendarCard, latestNoticeFor } from '../components/CalendarCard';
import { NoticeFeed } from '../components/NoticeFeed';
import { EXAM_GUIDE, STAGES, type Stage } from '../data/exam-guide';
import { calendarOrder } from '../data/school-calendar';
import type { Level } from '../data/types';

/** Which stage a profile level is at. */
const STAGE_FOR: Partial<Record<Level, Stage>> = { class10: 'after10', inter: 'after12', diploma: 'afterDiploma', ug: 'afterDegree', pg: 'afterDegree' };

export function Exams() {
  const { t, profile, notices } = useApp();
  const [stage, setStage] = useState<Stage | 'all'>(() => (profile.level && STAGE_FOR[profile.level]) || 'all');
  const [region, setRegion] = useState<string>(() => (profile.state === 'Telangana' || profile.state === 'Andhra Pradesh' ? profile.state : 'all'));
  const order = calendarOrder(new Date().getMonth() + 1);
  const list = EXAM_GUIDE
    .filter((e) => (stage === 'all' || e.stage === stage) && (region === 'all' || !e.state || e.state === region))
    .sort((a, b) => (stage === 'all' ? STAGES.findIndex(([s]) => s === a.stage) - STAGES.findIndex(([s]) => s === b.stage) : 0) || order(a) - order(b));
  const REGIONS: [string, string][] = [['all', t('all')], ['Telangana', 'Telangana'], ['Andhra Pradesh', 'Andhra Pradesh']];

  return (
    <section className="page">
      <div className="page-head exams-head">
        <h1>{t('examsTitle')}</h1>
        <p className="lede">{t('examsIntro')}</p>
      </div>

      <div className="filter-block">
        <span className="filter-label">{t('examStage')}</span>
        <div className="chips scroll">
          <button className={'chip ' + (stage === 'all' ? 'on' : '')} onClick={() => setStage('all')}>{t('all')}</button>
          {STAGES.map(([s, l]) => <button key={s} className={'chip ' + (stage === s ? 'on' : '')} onClick={() => setStage(s)}>{l}</button>)}
        </div>
      </div>
      <div className="filter-block">
        <span className="filter-label">{t('myState')}</span>
        <div className="chips scroll">
          {REGIONS.map(([r, l]) => <button key={r} className={'chip ' + (region === r ? 'on' : '')} onClick={() => setRegion(r)}>{l}</button>)}
        </div>
      </div>

      <h2 className="section-h"><Icon name="clock" size={20} /> {t('examCalTitle')}</h2>
      <p className="small muted">{t('calNote')}</p>
      <div className="cal-grid">
        {list.map((e) => <CalendarCard key={e.id} e={e} latest={latestNoticeFor(notices, e, (a) => a === 'exam' || a === 'school', true)} />)}
      </div>
      {!list.length && <p className="empty">{t('noResults')}</p>}

      <NoticeFeed areas={['exam']} limit={6} />
    </section>
  );
}
