import { useMemo, useState } from 'react';
import { useApp } from '../app-context';
import type { MatchStatus, OpportunityKind } from '../data/types';
import { matchAll } from '../engine/match';
import { OppCard } from '../components/OppCard';

const KINDS: (OpportunityKind | 'all')[] = ['all', 'scholarship', 'govt-job', 'private-job', 'internship', 'exam', 'skill', 'abroad'];
const GROUPS: MatchStatus[] = ['likely', 'verify', 'not'];

export function Matches({ initialKind = 'all' }: { initialKind?: OpportunityKind | 'all' }) {
  const { t, profile, opps } = useApp();
  const [kind, setKind] = useState<OpportunityKind | 'all'>(initialKind);
  const [demo, setDemo] = useState(true);
  const matched = useMemo(() => matchAll(profile, opps, { includeUnverified: demo }), [profile, opps, demo]);
  const shown = matched.filter((m) => kind === 'all' || m.opp.kind === kind);
  return (
    <section className="page">
      <h1>{t('navMatches')}</h1>
      <p className="muted">{t('noGuarantee')}</p>
      <div className="chips">
        {KINDS.map((k) => <button key={k} className={'chip ' + (k === kind ? 'on' : '')} onClick={() => setKind(k)}>{t(k)}</button>)}
      </div>
      <label className="inline toggle">
        <input type="checkbox" checked={demo} onChange={(e) => setDemo(e.target.checked)} />
        Show unverified sample data (demo only; the live site shows verified items only)
      </label>
      {shown.length === 0 && <p className="empty">Nothing to show. {demo ? '' : 'No items have been verified yet. Verify some in Admin, or turn on sample data.'}</p>}
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
