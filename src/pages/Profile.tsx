import { useState } from 'react';
import { useApp } from '../app-context';
import { LEVELS, type Category, type Gender, type Level, type Profile as P, type Stream } from '../data/types';
import { LEVEL_LABEL } from '../engine/match';
import { Account } from '../components/Account';

const STREAMS: Stream[] = ['MPC', 'BiPC', 'MEC', 'CEC', 'HEC', 'Vocational', 'Engineering', 'Science', 'Commerce', 'Arts', 'Medical'];
const STATES = ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Maharashtra', 'Kerala', 'Odisha', 'Delhi', 'Uttar Pradesh', 'Bihar', 'West Bengal', 'Other'];
const CATS: Category[] = ['General', 'EWS', 'OBC', 'SC', 'ST'];
const num = (v: string) => (v === '' ? undefined : Number(v));
const list = (v: string) => v.split(',').map((s) => s.trim()).filter(Boolean);

export function Profile() {
  const { t, profile, setProfile, go } = useApp();
  const [f, setF] = useState<P>(profile);
  const [ok, setOk] = useState(false);
  const set = (patch: Partial<P>) => { setF({ ...f, ...patch }); setOk(false); };
  return (
    <section className="page">
      <h1>{t('navProfile')}</h1>
      <p className="muted">Everything is optional. The more you fill, the fewer results need verification. </p>
      <Account />
      <form className="form" onSubmit={(e) => { e.preventDefault(); setProfile(f); setOk(true); go('matches'); }}>
        <label>{t('fName')} <small>({t('optional')})</small><input value={f.name ?? ''} onChange={(e) => set({ name: e.target.value })} /></label>
        <label>{t('fQualification')}
          <select value={f.level ?? ''} onChange={(e) => set({ level: (e.target.value || undefined) as Level })}>
            <option value="">{t('select')}</option>
            {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
          </select>
        </label>
        <fieldset><legend>{t('fStatus')}</legend>
          <label className="inline"><input type="radio" checked={f.levelStatus === 'completed'} onChange={() => set({ levelStatus: 'completed' })} /> {t('fCompleted')}</label>
          <label className="inline"><input type="radio" checked={f.levelStatus === 'pursuing'} onChange={() => set({ levelStatus: 'pursuing' })} /> {t('fPursuing')}</label>
        </fieldset>
        <label>{t('fStream')}
          <select value={f.stream ?? ''} onChange={(e) => set({ stream: (e.target.value || undefined) as Stream })}>
            <option value="">{t('select')}</option>{STREAMS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>{t('fPercentage')}<input type="number" min={0} max={100} value={f.percentage ?? ''} onChange={(e) => set({ percentage: num(e.target.value) })} /></label>
        <label>{t('fAge')}<input type="number" min={5} max={80} value={f.age ?? ''} onChange={(e) => set({ age: num(e.target.value) })} /></label>
        <label>{t('fState')}
          <select value={f.state ?? ''} onChange={(e) => set({ state: e.target.value || undefined })}>
            <option value="">{t('select')}</option>{STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>{t('fCategory')}
          <select value={f.category ?? ''} onChange={(e) => set({ category: (e.target.value || undefined) as Category })}>
            <option value="">{t('select')}</option>{CATS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>{t('fGender')}
          <select value={f.gender ?? ''} onChange={(e) => set({ gender: (e.target.value || undefined) as Gender })}>
            <option value="">{t('select')}</option>
            <option value="female">{t('female')}</option><option value="male">{t('male')}</option><option value="other">{t('other')}</option>
          </select>
        </label>
        <label>{t('fIncome')}<input type="number" min={0} step={10000} value={f.annualFamilyIncome ?? ''} onChange={(e) => set({ annualFamilyIncome: num(e.target.value) })} /></label>
        <label className="wide">{t('fSkills')}<input value={f.skills.join(', ')} onChange={(e) => set({ skills: list(e.target.value) })} /></label>
        <label className="wide">{t('fInterests')}<input value={f.interests.join(', ')} onChange={(e) => set({ interests: list(e.target.value) })} /></label>
        <label className="wide">{t('fGoals')}<input value={f.goals ?? ''} onChange={(e) => set({ goals: e.target.value })} /></label>
        <div className="wide"><button className="btn" type="submit">{t('saveProfile')}</button> {ok && <span>{t('saved')} ✓</span>}</div>
      </form>
    </section>
  );
}
