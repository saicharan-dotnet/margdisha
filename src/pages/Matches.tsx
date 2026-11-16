import { useMemo, useState } from 'react';
import { useApp } from '../app-context';
import type { MatchStatus, OpportunityKind } from '../data/types';
import { matchAll } from '../engine/match';
import { OppCard } from '../components/OppCard';
import { NoticeFeed } from '../components/NoticeFeed';
import { SCHOLARSHIPS, SCH_LEVELS, SCH_SCOPES, type SchLevel, type SchScope } from '../data/scholarships';
import { ScholarshipCard } from '../components/ScholarshipCard';

const KINDS: (OpportunityKind | 'all')[] = ['all', 'scholarship', 'govt-job', 'private-job', 'internship', 'exam', 'school-admission', 'skill', 'abroad'];
const GROUPS: MatchStatus[] = ['likely', 'verify', 'not'];

export function Matches({ initialKind = 'all' }: { initialKind?: OpportunityKind | 'all' }) {
  const { t, profile, opps, go } = useApp();
  const [kind, setKind] = useState<OpportunityKind | 'all'>(initialKind);
  const matched = useMemo(() => matchAll(profile, opps, { includeUnverified: true }), [profile, opps]);
  const shown = matched.filter((m) => kind === 'all' || m.opp.kind === kind);
  const [scope, setScope] = useState<SchScope | 'all'>(() => (profile.state === 'Telangana' || profile.state === 'Andhra Pradesh' ? profile.state : 'all'));
  const [lvl, setLvl] = useState<SchLevel | 'all'>('all');
  const abroad = kind === 'abroad';
  const guide = kind === 'scholarship' || abroad;
  const inScope = (s: (typeof SCHOLARSHIPS)[number]) => abroad ? s.scope === 'Study abroad'
    : scope === 'all' || s.scope === scope || s.state === scope || ((scope === 'Telangana' || scope === 'Andhra Pradesh') && s.scope === 'Central');
  const sch = SCHOLARSHIPS.filter((s) => inScope(s) && (lvl === 'all' || s.levels.includes(lvl)));
  return (
    <section className="page">
      <h1>{t('navMatches')}</h1>
      <p className="muted">{t('noGuarantee')}</p>
      <div className="chips">
        {KINDS.map((k) => <button key={k} className={'chip ' + (k === kind ? 'on' : '')} onClick={() => setKind(k)}>{t(k)}</button>)}
      </div>
      {guide && (
        <div className="group">
          <h2>{t('schGuideTitle')} <span className="count">{sch.length}</span></h2>
          <p className="muted small">{t('schGuideIntro')}</p>
          {!abroad && <div className="chips">
            {(['all', ...SCH_SCOPES] as const).map((k) => <button key={k} className={'chip ' + (k === scope ? 'on' : '')} onClick={() => setScope(k)}>{k === 'all' ? t('all') : k}</button>)}
          </div>}
          <div className="chips">
            {(['all', ...SCH_LEVELS] as const).map((k) => <button key={k} className={'chip ' + (k === lvl ? 'on' : '')} onClick={() => setLvl(k)}>{k === 'all' ? t('all') : k}</button>)}
          </div>
          <div className="cal-grid">{sch.map((s) => <ScholarshipCard key={s.id} s={s} />)}</div>
        </div>
      )}
      {shown.length === 0 && !guide && <><p className="empty">{t('verifyingSoon')}</p><NoticeFeed limit={8} more={() => go('updates')} /></>}
      {GROUPS.map((g) => {
        const items = shown.filter((m) => m.result.status === g);
        if (!items.length) return null;
        return (
          <div key={g} className="group">
            <h2 className={'group-h ' + g}>{t(g)} <span className="count">{items.length}</span></h2>
            <p className="muted small">{t((g + 'Help') as 'likelyHelp')}</p>
            <div className="grid">{items.map(({ opp, result }) => <OppCard key={opp.id} opp={opp} result={result} />)}</div>
          </div>
        );
      })}
    </section>
  );
}
