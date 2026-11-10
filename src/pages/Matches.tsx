import { useMemo, useState } from 'react';
import { useApp } from '../app-context';
import type { MatchStatus, OpportunityKind } from '../data/types';
import { matchAll } from '../engine/match';
import { OppCard } from '../components/OppCard';
import { NoticeFeed } from '../components/NoticeFeed';

const KINDS: (OpportunityKind | 'all')[] = ['all', 'scholarship', 'govt-job', 'private-job', 'internship', 'exam', 'school-admission', 'skill', 'abroad'];
const GROUPS: MatchStatus[] = ['likely', 'verify', 'not'];

export function Matches({ initialKind = 'all' }: { initialKind?: OpportunityKind | 'all' }) {
  const { t, profile, opps, go } = useApp();
  const [kind, setKind] = useState<OpportunityKind | 'all'>(initialKind);
  const matched = useMemo(() => matchAll(profile, opps, { includeUnverified: true }), [profile, opps]);
  const shown = matched.filter((m) => kind === 'all' || m.opp.kind === kind);
  return (
    <section className="page">
      <h1>{t('navMatches')}</h1>
      <p className="muted">{t('noGuarantee')}</p>
      <div className="chips">
        {KINDS.map((k) => <button key={k} className={'chip ' + (k === kind ? 'on' : '')} onClick={() => setKind(k)}>{t(k)}</button>)}
      </div>
      {shown.length === 0 && <><p className="empty">{t('verifyingSoon')}</p><NoticeFeed limit={8} more={() => go('updates')} /></>}
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
