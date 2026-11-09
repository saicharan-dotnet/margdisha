import { useState, type FormEvent } from 'react';
import {
  GOVT_SECTORS, LEVELS, PRIVATE_SECTORS, type Category, type Criteria, type Gender, type Level,
  type Opportunity, type OpportunityKind, type Stream, type WorkMode,
} from '../data/types';
import { LEVEL_LABEL } from '../engine/match';

const KINDS: [OpportunityKind, string][] = [
  ['scholarship', 'Scholarship'], ['govt-job', 'Government job'], ['private-job', 'Private job'], ['internship', 'Internship'],
  ['exam', 'Entrance exam'], ['course', 'Course'], ['skill', 'Skill programme'], ['abroad', 'Study abroad'],
];
const SCOPES: Opportunity['scope'][] = ['Central', 'State', 'Private', 'International', 'Institutional'];
const STREAMS: Stream[] = ['MPC', 'BiPC', 'MEC', 'CEC', 'HEC', 'Vocational', 'Engineering', 'Science', 'Commerce', 'Arts', 'Medical'];
const STATES = ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Maharashtra', 'Kerala', 'Odisha', 'Delhi', 'Uttar Pradesh', 'Bihar', 'West Bengal'];
const CATS: Category[] = ['General', 'EWS', 'OBC', 'SC', 'ST'];
const GENDERS: Gender[] = ['female', 'male', 'other'];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const num = (v: string) => (v.trim() === '' ? undefined : Number(v));
const lines = (v: string) => v.split('\n').map((x) => x.trim()).filter(Boolean);

function blank(): Opportunity {
  return {
    id: '', kind: 'govt-job', scope: 'Central', title: '', provider: '', summary: '', criteria: {},
    source: { url: 'https://', label: '' }, status: 'draft', sample: false, tags: [],
  };
}

function toggle<T>(list: T[] | undefined, v: T): T[] | undefined {
  const next = list?.includes(v) ? list.filter((x) => x !== v) : [...(list ?? []), v];
  return next.length ? next : undefined;
}

function Multi<T extends string>({ label, all, value, onChange, show = (x) => x }: {
  label: string; all: readonly T[]; value?: T[]; onChange: (v?: T[]) => void; show?: (v: T) => string;
}) {
  return (
    <fieldset className="multi wide">
      <legend>{label} <small className="muted">(leave empty for “any”)</small></legend>
      {all.map((v) => (
        <label key={v} className="inline"><input type="checkbox" checked={!!value?.includes(v)} onChange={() => onChange(toggle(value, v))} /> {show(v)}</label>
      ))}
    </fieldset>
  );
}

export function ListingForm({ initial, existingIds, onSave, onCancel }: {
  initial?: Opportunity; existingIds: string[];
  onSave: (o: Opportunity) => Promise<string | null>; onCancel: () => void;
}) {
  const isNew = !initial;
  const [o, setO] = useState<Opportunity>(initial ?? blank());
  const [docs, setDocs] = useState((initial?.documents ?? []).join('\n'));
  const [checks, setChecks] = useState((initial?.criteria.manualChecks ?? []).join('\n'));
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (p: Partial<Opportunity>) => setO({ ...o, ...p });
  const c = o.criteria;
  const setC = (p: Partial<Criteria>) => set({ criteria: { ...c, ...p } });
  const relax = (cat: Category, v: string) => {
    const r = { ...(c.ageRelaxation ?? {}) };
    if (num(v) === undefined) delete r[cat]; else r[cat] = num(v);
    setC({ ageRelaxation: Object.keys(r).length ? r : undefined });
  };
  const isJob = o.kind === 'govt-job' || o.kind === 'private-job' || o.kind === 'internship';
  const sectors = o.kind === 'govt-job' ? GOVT_SECTORS : PRIVATE_SECTORS;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const id = isNew ? slug(`${o.kind}-${o.title}`) : o.id;
    if (!o.title.trim() || !o.provider.trim()) return setErr('Title and organisation are required.');
    if (!/^https:\/\/.+\..+/.test(o.source.url)) return setErr('Add the official source link, starting with https://');
    if (isNew && existingIds.includes(id)) return setErr('A listing with this title already exists. Edit that one instead.');
    const out: Opportunity = {
      ...o, id,
      documents: lines(docs).length ? lines(docs) : undefined,
      criteria: { ...c, manualChecks: lines(checks).length ? lines(checks) : undefined },
      source: { ...o.source, label: o.source.label.trim() || o.provider },
      // Any edit to a published item sends it back for review.
      status: !isNew && o.status === 'verified' ? 'in-review' : o.status,
    };
    setBusy(true);
    const e2 = await onSave(out);
    setBusy(false);
    if (e2) setErr(e2); else onCancel();
  };

  return (
    <form className="form listing" onSubmit={submit}>
      <h2 className="wide">{isNew ? 'Add a listing' : 'Edit listing'}</h2>
      {!isNew && initial?.status === 'verified' && <p className="notice wide">This listing is published. Saving changes moves it back to “in review” until it is verified again.</p>}
      {o.sample && <label className="inline wide"><input type="checkbox" checked={!o.sample} onChange={() => set({ sample: false })} /> I replaced the sample details with real information from the official source</label>}

      <h3 className="wide form-h">Basics</h3>
      <label>Type<select value={o.kind} onChange={(e) => set({ kind: e.target.value as OpportunityKind, sector: undefined })}>{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
      <label>Level<select value={o.scope} onChange={(e) => set({ scope: e.target.value as Opportunity['scope'] })}>{SCOPES.map((s) => <option key={s}>{s}</option>)}</select></label>
      {isJob && <label>Sector<select value={o.sector ?? ''} onChange={(e) => set({ sector: (e.target.value || undefined) as Opportunity['sector'] })}><option value="">—</option>{sectors.map((s) => <option key={s}>{s}</option>)}</select></label>}
      <label className="wide">Title<input required value={o.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. SSC Combined Graduate Level Examination 2027" /></label>
      <label>Organisation<input required value={o.provider} onChange={(e) => set({ provider: e.target.value })} placeholder="e.g. Staff Selection Commission" /></label>
      <label>Last date to apply<input type="date" value={o.deadline ?? ''} onChange={(e) => set({ deadline: e.target.value || undefined })} /></label>
      <label>Applications open<input type="date" value={o.opensOn ?? ''} onChange={(e) => set({ opensOn: e.target.value || undefined })} /></label>
      <label className="wide">Short summary<textarea rows={2} value={o.summary} onChange={(e) => set({ summary: e.target.value })} /></label>

      <h3 className="wide form-h">Official source</h3>
      <label className="wide">Notification / official page link<input type="url" required value={o.source.url} onChange={(e) => set({ source: { ...o.source, url: e.target.value } })} /></label>
      <label>Source name<input value={o.source.label} onChange={(e) => set({ source: { ...o.source, label: e.target.value } })} placeholder="e.g. SSC official notification" /></label>
      <label>Notification date<input type="date" value={o.source.publishedOn ?? ''} onChange={(e) => set({ source: { ...o.source, publishedOn: e.target.value || undefined } })} /></label>

      <h3 className="wide form-h">Details</h3>
      {o.kind === 'scholarship' && <label>Amount<input value={o.amount ?? ''} onChange={(e) => set({ amount: e.target.value || undefined })} /></label>}
      {isJob && <label>Salary / pay<input value={o.salary ?? ''} onChange={(e) => set({ salary: e.target.value || undefined })} /></label>}
      {isJob && <label>Vacancies<input value={o.vacancies ?? ''} onChange={(e) => set({ vacancies: e.target.value || undefined })} /></label>}
      {isJob && <label>Location<input value={o.location ?? ''} onChange={(e) => set({ location: e.target.value || undefined })} /></label>}
      {o.kind !== 'govt-job' && isJob && <label>Work mode<select value={o.workMode ?? ''} onChange={(e) => set({ workMode: (e.target.value || undefined) as WorkMode })}><option value="">—</option><option value="onsite">On-site</option><option value="hybrid">Hybrid</option><option value="remote">Work from home</option></select></label>}
      {o.kind !== 'govt-job' && isJob && <label>Experience<input value={o.experience ?? ''} onChange={(e) => set({ experience: e.target.value || undefined })} placeholder="e.g. Fresher, 2–4 years" /></label>}
      <label className="wide">Selection process<input value={o.selection ?? ''} onChange={(e) => set({ selection: e.target.value || undefined })} placeholder="e.g. Prelims → Mains → Interview" /></label>
      <label className="wide">Documents needed (one per line)<textarea rows={3} value={docs} onChange={(e) => setDocs(e.target.value)} /></label>

      <h3 className="wide form-h">Eligibility rules</h3>
      <p className="muted small wide">These drive the Likely eligible / Needs verification / Not eligible result. Leave a field empty if it does not apply.</p>
      <label>Minimum qualification (completed)<select value={c.minLevel ?? ''} onChange={(e) => setC({ minLevel: (e.target.value || undefined) as Level })}><option value="">Any</option>{LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}</select></label>
      <label className="inline"><input type="checkbox" checked={!!c.allowPursuing} onChange={(e) => setC({ allowPursuing: e.target.checked || undefined })} /> Final-year students may apply</label>
      <Multi label="Only for students currently studying" all={LEVELS} value={c.studyingAt} onChange={(v) => setC({ studyingAt: v as Level[] | undefined })} show={(l) => LEVEL_LABEL[l as Level]} />
      <Multi label="Streams" all={STREAMS} value={c.streams} onChange={(v) => setC({ streams: v })} />
      <label>Minimum marks (%)<input type="number" min={0} max={100} value={c.minPercentage ?? ''} onChange={(e) => setC({ minPercentage: num(e.target.value) })} /></label>
      <label>Max family income (₹/year)<input type="number" min={0} step={10000} value={c.maxIncome ?? ''} onChange={(e) => setC({ maxIncome: num(e.target.value) })} /></label>
      <label>Minimum age<input type="number" min={0} value={c.minAge ?? ''} onChange={(e) => setC({ minAge: num(e.target.value) })} /></label>
      <label>Maximum age (General)<input type="number" min={0} value={c.maxAge ?? ''} onChange={(e) => setC({ maxAge: num(e.target.value) })} /></label>
      <fieldset className="wide relax"><legend>Extra years of age relaxation</legend>
        {CATS.filter((k) => k !== 'General').map((k) => (
          <label key={k}>{k}<input type="number" min={0} value={c.ageRelaxation?.[k] ?? ''} onChange={(e) => relax(k, e.target.value)} /></label>
        ))}
      </fieldset>
      <Multi label="Only for residents of" all={STATES} value={c.states} onChange={(v) => setC({ states: v })} />
      <Multi label="Only for categories" all={CATS} value={c.categories} onChange={(v) => setC({ categories: v as Category[] | undefined })} />
      <Multi label="Only for" all={GENDERS} value={c.genders} onChange={(v) => setC({ genders: v as Gender[] | undefined })} />
      <label className="wide">Conditions the applicant must check themselves (one per line)<textarea rows={3} value={checks} onChange={(e) => setChecks(e.target.value)} placeholder={'e.g. Height and chest standards\nNumber of attempts used'} /></label>

      {err && <p className="notice err wide" role="alert">{err}</p>}
      <div className="wide actions">
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : isNew ? 'Save as draft' : 'Save changes'}</button>
        <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
