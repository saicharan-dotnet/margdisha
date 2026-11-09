import { useState } from 'react';
import { useApp } from '../app-context';
import type { Opportunity, OpportunityKind, VerificationStatus } from '../data/types';
import type { Notice } from '../data/remote';
import { ago } from '../components/NoticeFeed';
import { ListingForm } from './ListingForm';
import { Icon } from '../components/Icon';

const today = () => new Date().toISOString().slice(0, 10);
const FLOW: VerificationStatus[] = ['draft', 'in-review', 'verified', 'rejected'];

/**
 * Staff-only. Verification workflow: draft → in-review → verified (published) | rejected.
 * The database enforces the same rules, so the browser cannot bypass them.
 */
export function Admin() {
  const { opps, saveOpp, deleteOpp, isAdmin, user, go, notices, setNoticeStatus, t } = useApp();
  const [view, setView] = useState<'listings' | 'notices'>('listings');
  const [fromNotice, setFromNotice] = useState<Notice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<VerificationStatus | 'all' | 'sample'>('all');
  const [verifying, setVerifying] = useState<string | null>(null);
  const [form, setForm] = useState<'new' | string | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [q, setQ] = useState('');

  if (!isAdmin)
    return (
      <section className="page">
        <div className="empty">
          <h1>Staff only</h1>
          <p>This page is for MargDisha content reviewers.</p>
          {!user && <button className="btn" onClick={() => go('profile')}>Sign in</button>}
        </div>
      </section>
    );

  const update = async (id: string, patch: (o: Opportunity) => Opportunity) => {
    const cur = opps.find((o) => o.id === id);
    if (cur) setError(await saveOpp(patch(cur)));
  };
  const newCount = notices.filter((n) => n.status === 'new').length;
  const needle = q.trim().toLowerCase();
  const shown = opps.filter((o) =>
    (filter === 'all' || (filter === 'sample' ? o.sample : o.status === filter)) &&
    (!needle || (o.title + ' ' + o.provider).toLowerCase().includes(needle)));

  if (form)
    return (
      <section className="page">
        <ListingForm
          key={form}
          initial={form === 'new' ? undefined : opps.find((o) => o.id === form)}
          prefill={fromNotice ? noticePrefill(fromNotice) : undefined}
          existingIds={opps.map((o) => o.id)}
          onSave={async (o) => {
            const err = await saveOpp(o);
            if (!err && fromNotice) await setNoticeStatus(fromNotice.id, 'listed', o.id);
            return err;
          }}
          onCancel={() => { setForm(null); setFromNotice(null); }}
        />
      </section>
    );

  return (
    <section className="page">
      <div className="admin-head">
        <h1>Admin · listings</h1>
        <button className="btn" onClick={() => setForm('new')}>+ Add listing</button>
      </div>
      <div className="notice ok-note">Signed in as {user}. Changes save to the database, and every status change is recorded in the audit log.</div>
      {error && <div className="notice err" role="alert">{error}</div>}
      <div className="segmented" role="tablist">
        <button role="tab" aria-selected={view === 'listings'} className={view === 'listings' ? 'on' : ''} onClick={() => setView('listings')}>Listings</button>
        <button role="tab" aria-selected={view === 'notices'} className={view === 'notices' ? 'on' : ''} onClick={() => setView('notices')}>
          Notices inbox {newCount > 0 && <span className="count-badge">{newCount}</span>}
        </button>
      </div>
      {view === 'notices' ? <NoticeInbox notices={notices} t={t} onCreate={(n) => { setFromNotice(n); setForm('new'); }}
        onIgnore={async (n) => setError(await setNoticeStatus(n.id, 'ignored'))}
        onRestore={async (n) => setError(await setNoticeStatus(n.id, 'new'))} /> : <>
      <div className="toolbar">
        <label className="search"><Icon name="search" size={18} /><input id="admin-search" type="search" placeholder="Search listings" value={q} onChange={(e) => setQ(e.target.value)} /></label>
      </div>
      <div className="chips">
        {(['all', ...FLOW, 'sample'] as const).map((s) => (
          <button key={s} className={'chip ' + (s === filter ? 'on' : '')} onClick={() => setFilter(s)}>
            {s} ({s === 'all' ? opps.length : s === 'sample' ? opps.filter((o) => o.sample).length : opps.filter((o) => o.status === s).length})
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Listing</th><th>Status</th><th>Source</th><th>Actions</th></tr></thead>
          <tbody>
            {shown.map((o) => (
              <tr key={o.id}>
                <td><b>{o.title}</b><br /><span className="small muted">{o.kind} · {o.scope}{o.deadline ? ' · ends ' + o.deadline : ''}{o.sample ? ' · SAMPLE' : ''}</span></td>
                <td><span className={'status s-' + o.status}>{o.status}</span>
                  {o.source.lastVerifiedOn && <div className="small muted">by {o.source.verifiedBy} on {o.source.lastVerifiedOn}</div>}</td>
                <td className="small"><a href={o.source.url} target="_blank" rel="noreferrer">{o.source.label}</a>
                  {o.source.publishedOn && <div>Notified {o.source.publishedOn}</div>}</td>
                <td className="actions">
                  <button className="btn sm ghost" onClick={() => setForm(o.id)}>Edit</button>
                  {o.status === 'draft' && <button className="btn sm" onClick={() => update(o.id, (x) => ({ ...x, status: 'in-review' }))}>Send to review</button>}
                  {o.status === 'in-review' && <button className="btn sm" onClick={() => setVerifying(o.id)}>Verify…</button>}
                  {o.status !== 'rejected' && <button className="btn sm secondary" onClick={() => update(o.id, (x) => ({ ...x, status: 'rejected' }))}>Reject</button>}
                  {(o.status === 'verified' || o.status === 'rejected') && <button className="btn sm secondary" onClick={() => update(o.id, (x) => ({ ...x, status: 'draft' }))}>Back to draft</button>}
                  {confirmDel === o.id
                    ? <><button className="btn sm danger" onClick={async () => { setError(await deleteOpp(o.id)); setConfirmDel(null); }}>Confirm delete</button>
                        <button className="btn sm ghost" onClick={() => setConfirmDel(null)}>Keep</button></>
                    : <button className="btn sm ghost" onClick={() => setConfirmDel(o.id)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </>}
      {verifying && <VerifyDialog opp={opps.find((o) => o.id === verifying)!} onClose={() => setVerifying(null)}
        onVerify={(patch) => { void update(verifying, patch); setVerifying(null); }} />}
    </section>
  );
}

function VerifyDialog({ opp, onClose, onVerify }: { opp: Opportunity; onClose: () => void; onVerify: (p: (o: Opportunity) => Opportunity) => void }) {
  const [url, setUrl] = useState(opp.source.url);
  const [published, setPublished] = useState(opp.source.publishedOn ?? '');
  const [reviewer, setReviewer] = useState('');
  const [matches, setMatches] = useState(false);
  const real = !opp.sample;
  const valid = /^https:\/\/.+\..+/.test(url) && reviewer.trim() && published && matches && real;
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Verify listing">
      <div className="card">
        <h2 className="h-sm">Verify: {opp.title}</h2>
        {!real && <p className="notice err">This is still sample data. Use Edit to replace it with real details first.</p>}
        <label>Official notification link (https)<input value={url} onChange={(e) => setUrl(e.target.value)} /></label>
        <label>Notification date<input type="date" value={published} onChange={(e) => setPublished(e.target.value)} /></label>
        <label>Reviewer name<input value={reviewer} onChange={(e) => setReviewer(e.target.value)} /></label>
        <label className="inline"><input type="checkbox" checked={matches} onChange={(e) => setMatches(e.target.checked)} /> I checked eligibility, dates, amounts and documents against the official notification</label>
        <div className="actions">
          <button className="btn" disabled={!valid} onClick={() => onVerify((o) => ({ ...o, status: 'verified',
            source: { ...o.source, url, publishedOn: published, lastVerifiedOn: today(), verifiedBy: reviewer.trim() } }))}>Verify and publish</button>
          <button className="btn secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const AREA_KIND: Record<Notice['area'], OpportunityKind> = { job: 'govt-job', school: 'school-admission', exam: 'exam', scholarship: 'scholarship' };

function noticePrefill(n: Notice): Partial<Opportunity> {
  return {
    kind: AREA_KIND[n.area], title: n.title, provider: n.source_name, sector: (n.sector ?? undefined) as Opportunity['sector'],
    source: { url: n.url.replace(/^http:/, 'https:'), label: n.source_name }, status: 'draft', sample: false,
  };
}

/** Notices the collector found on official websites. An admin turns the useful ones into listings. */
function NoticeInbox({ notices, t, onCreate, onIgnore, onRestore }: {
  notices: Notice[]; t: ReturnType<typeof useApp>['t'];
  onCreate: (n: Notice) => void; onIgnore: (n: Notice) => void; onRestore: (n: Notice) => void;
}) {
  const [show, setShow] = useState<Notice['status']>('new');
  const list = notices.filter((n) => n.status === show);
  return (
    <div>
      <p className="small muted">Found automatically every 6 hours on official websites. Open the notice, then create a listing from it (it starts as a draft) or ignore it. Ignored notices disappear from the public "Latest" list.</p>
      <div className="chips">
        {(['new', 'listed', 'ignored'] as const).map((s) => (
          <button key={s} className={'chip ' + (s === show ? 'on' : '')} onClick={() => setShow(s)}>{s} ({notices.filter((n) => n.status === s).length})</button>
        ))}
      </div>
      {!list.length && <p className="empty">{notices.length ? 'Nothing here.' : 'No notices yet. They arrive after the collector runs with the database key set up (see docs/NOTICES.md).'}</p>}
      <ul className="inbox">
        {list.slice(0, 200).map((n) => (
          <li key={n.id}>
            <div className="inbox-main">
              <span className={'feed-src a-' + n.area}>{n.sector ?? n.area}</span>
              <a href={n.url} target="_blank" rel="noreferrer">{n.title}</a>
              <span className="small muted">{n.source_name} · {ago(n.first_seen, t)}{n.listing_id ? ' · listing ' + n.listing_id : ''}</span>
            </div>
            <div className="actions">
              {n.status === 'new' && <><button className="btn sm" onClick={() => onCreate(n)}>Create listing</button>
                <button className="btn sm ghost" onClick={() => onIgnore(n)}>Ignore</button></>}
              {n.status === 'ignored' && <button className="btn sm ghost" onClick={() => onRestore(n)}>Restore</button>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
