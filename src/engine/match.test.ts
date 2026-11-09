import { describe, expect, it } from 'vitest';
import { evaluate, matchAll } from './match';
import type { Opportunity, Profile } from '../data/types';

const base: Profile = { skills: [], interests: [] };
const today = new Date('2026-11-09');

describe('evaluate', () => {
  it('flags missing profile data as Needs Verification', () => {
    const r = evaluate(base, { minLevel: 'ug', maxAge: 30 }, today);
    expect(r.status).toBe('verify');
    expect(r.missing).toEqual(['Qualification', 'Age']);
  });

  it('returns Likely Eligible when every rule passes', () => {
    const p: Profile = { ...base, level: 'ug', levelStatus: 'completed', age: 24, stream: 'Engineering' };
    expect(evaluate(p, { minLevel: 'ug', maxAge: 30, streams: ['Engineering'] }, today).status).toBe('likely');
  });

  it('returns Not Eligible when any rule fails, even with other data missing', () => {
    const p: Profile = { ...base, level: 'inter', levelStatus: 'completed' };
    const r = evaluate(p, { minLevel: 'ug', maxAge: 30 }, today);
    expect(r.status).toBe('not');
    expect(r.reasons.find((x) => x.ok === false)?.text).toMatch(/Bachelor/);
  });

  it('treats a pursuing level as not yet completed, unless final-year students are allowed', () => {
    const p: Profile = { ...base, level: 'ug', levelStatus: 'pursuing' };
    expect(evaluate(p, { minLevel: 'ug' }, today).status).toBe('not');
    expect(evaluate(p, { minLevel: 'ug', allowPursuing: true }, today).status).toBe('likely');
    expect(evaluate(p, { minLevel: 'inter' }, today).status).toBe('likely');
  });

  it('applies category age relaxation', () => {
    const c = { maxAge: 32, ageRelaxation: { OBC: 3, SC: 5 } };
    expect(evaluate({ ...base, age: 34, category: 'General' }, c, today).status).toBe('not');
    expect(evaluate({ ...base, age: 34, category: 'OBC' }, c, today).status).toBe('likely');
    const noCat = evaluate({ ...base, age: 34 }, c, today);
    expect(noCat.status).toBe('not');
    expect(noCat.missing).toContain('Category (age relaxation may apply)');
  });

  it('checks income, marks, state and studying level for scholarships', () => {
    const c = { studyingAt: ['ug' as const], maxIncome: 250000, minPercentage: 60, states: ['Telangana'] };
    const p: Profile = { ...base, level: 'ug', levelStatus: 'pursuing', annualFamilyIncome: 200000, percentage: 72, state: 'Telangana' };
    expect(evaluate(p, c, today).status).toBe('likely');
    expect(evaluate({ ...p, state: 'Kerala' }, c, today).status).toBe('not');
    expect(evaluate({ ...p, annualFamilyIncome: 300000 }, c, today).status).toBe('not');
    expect(evaluate({ ...p, percentage: undefined }, c, today).status).toBe('verify');
    expect(evaluate({ ...p, levelStatus: 'completed' }, c, today).status).toBe('not');
  });

  it('marks past deadlines as expired', () => {
    expect(evaluate(base, {}, today, '2026-11-08').expired).toBe(true);
    expect(evaluate(base, {}, today, '2026-11-09').expired).toBe(false);
  });
});

describe('matchAll', () => {
  const mk = (id: string, status: Opportunity['status'], deadline?: string): Opportunity => ({
    id, kind: 'scholarship', title: id, provider: 'x', scope: 'Central', summary: '', criteria: {},
    source: { url: 'https://example.org', label: 'x' }, status, sample: true, tags: [], deadline,
  });

  it('hides unverified and rejected items unless asked, and sorts expired last', () => {
    const list = [mk('a', 'draft'), mk('b', 'verified', '2026-01-01'), mk('c', 'verified', '2026-12-01'), mk('d', 'rejected')];
    expect(matchAll(base, list, { includeUnverified: false, today }).map((m) => m.opp.id)).toEqual(['c', 'b']);
    expect(matchAll(base, list, { includeUnverified: true, today }).map((m) => m.opp.id)).toEqual(['c', 'a', 'b']);
  });

  it('treats rules that can only be checked by hand as needing verification', () => {
    const r = evaluate({ level: 'ug', levelStatus: 'completed', skills: [], interests: [] }, { manualChecks: ['Age on the cut-off date'] });
    expect(r.status).toBe('verify');
  });
});
