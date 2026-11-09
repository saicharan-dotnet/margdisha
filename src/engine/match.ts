import { LEVELS, type Criteria, type Level, type MatchResult, type Opportunity, type Profile, type Reason } from '../data/types';

export const LEVEL_LABEL: Record<Level, string> = {
  class5: 'Class 5', class8: 'Class 8', class10: 'Class 10', inter: 'Intermediate (12th)',
  diploma: 'Diploma', ug: "Bachelor's degree", pg: "Master's degree", phd: 'PhD',
};

const idx = (l: Level) => LEVELS.indexOf(l);

/** Highest level the person has actually completed. */
export function completedLevelIndex(p: Profile): number | undefined {
  if (!p.level) return undefined;
  const i = idx(p.level);
  return p.levelStatus === 'pursuing' ? i - 1 : i;
}

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

/**
 * Check a profile against eligibility criteria.
 *
 * - Any failed rule → "not" (Not Eligible)
 * - Otherwise, any rule we could not check because the profile is missing data → "verify"
 * - Otherwise → "likely" (Likely Eligible). This is never a guarantee: manual checks are
 *   always listed for the person to confirm on the official notification.
 */
export function evaluate(profile: Profile, c: Criteria, today = new Date(), deadline?: string): MatchResult {
  const reasons: Reason[] = [];
  const missing = new Set<string>();
  const need = (field: string, text: string) => {
    missing.add(field);
    reasons.push({ ok: null, text });
  };

  if (c.minLevel) {
    const want = LEVEL_LABEL[c.minLevel];
    const done = completedLevelIndex(profile);
    if (done === undefined) need('Qualification', `Requires ${want} or higher`);
    else if (done >= idx(c.minLevel)) reasons.push({ ok: true, text: `You have completed ${want} or higher` });
    else if (c.allowPursuing && profile.levelStatus === 'pursuing' && profile.level === c.minLevel)
      reasons.push({ ok: true, text: `Final-year ${want} students may apply, if they finish by the cut-off date` });
    else reasons.push({ ok: false, text: `Requires ${want} completed` });
  }

  if (c.studyingAt?.length) {
    const labels = c.studyingAt.map((l) => LEVEL_LABEL[l]).join(' / ');
    if (!profile.level) need('Qualification', `For students currently studying ${labels}`);
    else if (profile.levelStatus === 'pursuing' && c.studyingAt.includes(profile.level))
      reasons.push({ ok: true, text: `You are currently studying ${LEVEL_LABEL[profile.level]}` });
    else if (!profile.levelStatus) need('Studying or completed', `For students currently studying ${labels}`);
    else reasons.push({ ok: false, text: `Only for students currently studying ${labels}` });
  }

  if (c.streams?.length && !c.streams.includes('Any')) {
    if (!profile.stream) need('Stream', `Open to ${c.streams.join(', ')} streams`);
    else if (c.streams.includes(profile.stream)) reasons.push({ ok: true, text: `Your stream (${profile.stream}) is accepted` });
    else reasons.push({ ok: false, text: `Open only to ${c.streams.join(', ')} (you: ${profile.stream})` });
  }

  if (c.minPercentage !== undefined) {
    if (profile.percentage === undefined) need('Marks / percentage', `Needs at least ${c.minPercentage}% marks`);
    else if (profile.percentage >= c.minPercentage) reasons.push({ ok: true, text: `Your ${profile.percentage}% meets the ${c.minPercentage}% minimum` });
    else reasons.push({ ok: false, text: `Needs at least ${c.minPercentage}% (you: ${profile.percentage}%)` });
  }

  if (c.maxIncome !== undefined) {
    if (profile.annualFamilyIncome === undefined) need('Family income', `Family income must be at most ${inr(c.maxIncome)} a year`);
    else if (profile.annualFamilyIncome <= c.maxIncome) reasons.push({ ok: true, text: `Family income is within the ${inr(c.maxIncome)} limit` });
    else reasons.push({ ok: false, text: `Family income must be at most ${inr(c.maxIncome)} (you: ${inr(profile.annualFamilyIncome)})` });
  }

  if (c.minAge !== undefined || c.maxAge !== undefined) {
    const relax = profile.category ? c.ageRelaxation?.[profile.category] ?? 0 : 0;
    const max = c.maxAge !== undefined ? c.maxAge + relax : undefined;
    const range = `${c.minAge ?? 0}–${max ?? '∞'} years${relax ? ` (includes ${relax} yrs ${profile.category} relaxation)` : ''}`;
    if (profile.age === undefined) need('Age', `Age limit ${range}`);
    else if ((c.minAge === undefined || profile.age >= c.minAge) && (max === undefined || profile.age <= max))
      reasons.push({ ok: true, text: `Your age (${profile.age}) is within ${range}` });
    else reasons.push({ ok: false, text: `Age must be ${range} (you: ${profile.age})` });
    if (c.ageRelaxation && !profile.category && profile.age !== undefined && max !== undefined && profile.age > max)
      missing.add('Category (age relaxation may apply)');
  }

  if (c.states?.length) {
    if (!profile.state) need('State', `Only for residents of ${c.states.join(', ')}`);
    else if (c.states.includes(profile.state)) reasons.push({ ok: true, text: `Open to residents of ${profile.state}` });
    else reasons.push({ ok: false, text: `Only for residents of ${c.states.join(', ')}` });
  }

  if (c.categories?.length) {
    if (!profile.category) need('Category', `Only for ${c.categories.join(', ')} candidates`);
    else if (c.categories.includes(profile.category)) reasons.push({ ok: true, text: `Open to ${profile.category} candidates` });
    else reasons.push({ ok: false, text: `Only for ${c.categories.join(', ')} candidates` });
  }

  if (c.genders?.length) {
    if (!profile.gender) need('Gender', `Only for ${c.genders.join(', ')} applicants`);
    else if (c.genders.includes(profile.gender)) reasons.push({ ok: true, text: 'Gender condition met' });
    else reasons.push({ ok: false, text: `Only for ${c.genders.join(', ')} applicants` });
  }

  for (const m of c.manualChecks ?? []) reasons.push({ ok: null, text: `Check yourself: ${m}` });

  const failed = reasons.some((r) => r.ok === false);
  const status = failed ? 'not' : missing.size ? 'verify' : 'likely';
  const expired = !!deadline && new Date(deadline + 'T23:59:59') < today;
  return { status, reasons, missing: [...missing], expired };
}

export interface Matched {
  opp: Opportunity;
  result: MatchResult;
}

const ORDER = { likely: 0, verify: 1, not: 2 } as const;

/** Match only published (verified) items unless includeUnverified, which the demo uses for sample data. */
export function matchAll(profile: Profile, opps: Opportunity[], opts: { includeUnverified: boolean; today?: Date }): Matched[] {
  return opps
    .filter((o) => o.status !== 'rejected' && (opts.includeUnverified || o.status === 'verified'))
    .map((opp) => ({ opp, result: evaluate(profile, opp.criteria, opts.today, opp.deadline) }))
    .sort((a, b) =>
      Number(a.result.expired) - Number(b.result.expired) ||
      ORDER[a.result.status] - ORDER[b.result.status] ||
      (a.opp.deadline ?? '9').localeCompare(b.opp.deadline ?? '9'));
}

/** Days until a deadline (negative = passed). */
export function daysLeft(deadline: string, today = new Date()): number {
  const d = new Date(deadline + 'T23:59:59').getTime();
  return Math.ceil((d - today.getTime()) / 86_400_000);
}
