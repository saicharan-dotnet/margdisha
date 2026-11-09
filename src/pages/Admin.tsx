import { useState } from 'react';
import { useApp } from '../app-context';
import type { Opportunity, VerificationStatus } from '../data/types';

const today = () => new Date().toISOString().slice(0, 10);
const FLOW: VerificationStatus[] = ['draft', 'in-review', 'verified', 'rejected'];

/**
 * Verification workflow: draft → in-review → verified (published) | rejected.
 * Publishing requires a reviewer name, an official notification link and a check that
 * the details match it. Sample entries cannot be published until marked as real data.
 */
export function Admin() {
  const { opps, saveOpp, isAdmin, source, user } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<VerificationStatus | 'all'>('all');
  const [editing, setEditing] = useState<string | null>(null);
  const update = async (id: string, patch: (o: Opportunity) => Opportunity) => {
    const cur = opps.find((o) => o.id === id);
    if (!cur) return;
    setError(await saveOpp(patch(cur)));
  };
  const live = source === 'db' && isAdmin;
  const shown = opps.filter((o) => filter === 'all' || o.status === filter);
  return (
    <section className="page">
      <h1>Admin · content verification</h1>
      {live
        ? <div className="notice ok-note">Signed in as admin ({user}). Changes are saved to the database, and every status change is recorded in the audit log.</div>
        : <div className="notice">Demo mode: changes stay in this browser only. {user ? 'Your account is not an admin.' : 'Sign in with an admin account (My profile) to manage live data.'}</div>}
      {error && <div className="notice err" role="alert">{error}</div>}
      <div className="chips">
        {(['all', ...FLOW] as const).map((s) => (
          <button key={s} className={'chip ' + (s === filter ? 'on' : '')} onClick={() => setFilter(s)}>
            {s} ({s === 'all' ? opps.length : opps.filter((o) => o.status === s).length})
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Item</th><th>Status</th><th>Source</th><th>Actions</th></tr></thead>
          <tbody>
            {shown.map((o) => (
              <tr key={o.id}>
                <td><b>{o.title}</b><br /><span className="small muted">{o.kind} · {o.scope}{o.sample ? ' · SAMPLE' : ''}</span></td>
                <td><span className={'status s-' + o.status}>{o.status}</span>
                  {o.source.lastVerifiedOn && <div className="small muted">by {o.source.verifiedBy} on {o.source.lastVerifiedOn}</div>}</td>
                <td className="small"><a href={o.source.url} target="_blank" rel="noreferrer">{o.source.label}</a>
                  {o.source.publishedOn && <div>Published {o.source.publishedOn}</div>}</td>
                <td className="actions">
                  {o.status === 'draft' && <button className="btn sm" onClick={() => update(o.id, (x) => ({ ...x, status: 'in-review' }))}>Send to review</button>}
                  {o.status === 'in-review' && <button className="btn sm" onClick={() => setEditing(o.id)}>Verify…</button>}
                  {o.status !== 'rejected' && <button className="btn sm secondary" onClick={() => update(o.id, (x) => ({ ...x, status: 'rejected' }))}>Reject</button>}
                  {(o.status === 'verified' || o.status === 'rejected') && <button className="btn sm secondary" onClick={() => update(o.id, (x) => ({ ...x, status: 'draft', source: { ...x.source, lastVerifiedOn: undefined, verifiedBy: undefined } }))}>Back to draft</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && <VerifyDialog opp={opps.find((o) => o.id === editing)!} onClose={() => setEditing(null)}
        onVerify={(patch) => { void update(editing, patch); setEditing(null); }} />}
    </section>
  );
}

function VerifyDialog({ opp, onClose, onVerify }: { opp: Opportunity; onClose: () => void; onVerify: (p: (o: Opportunity) => Opportunity) => void }) {
  const [url, setUrl] = useState(opp.source.url);
  const [published, setPublished] = useState(opp.source.publishedOn ?? '');
  const [reviewer, setReviewer] = useState('');
  const [matches, setMatches] = useState(false);
  const [real, setReal] = useState(!opp.sample);
  const valid = /^https:\/\/.+\..+/.test(url) && reviewer.trim() && published && matches && real;
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Verify item">
      <div className="card">
        <h2 className="h-sm">Verify: {opp.title}</h2>
        <label>Official notification link (https)<input value={url} onChange={(e) => setUrl(e.target.value)} /></label>
        <label>Notification publication date<input type="date" value={published} onChange={(e) => setPublished(e.target.value)} /></label>
        <label>Reviewer name<input value={reviewer} onChange={(e) => setReviewer(e.target.value)} /></label>
        <label className="inline"><input type="checkbox" checked={matches} onChange={(e) => setMatches(e.target.checked)} /> I checked eligibility, dates, amount and documents against the official notification</label>
        <label className="inline"><input type="checkbox" checked={real} onChange={(e) => setReal(e.target.checked)} /> The details have been replaced with real data (not sample)</label>
        <div className="actions">
          <button className="btn" disabled={!valid} onClick={() => onVerify((o) => ({ ...o, status: 'verified', sample: !real,
            source: { ...o.source, url, publishedOn: published, lastVerifiedOn: today(), verifiedBy: reviewer.trim() } }))}>Verify and publish</button>
          <button className="btn secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
