import { describe, expect, it } from 'vitest';
import { SCHOLARSHIPS, SCH_LEVELS, SCH_SCOPES } from './scholarships';

describe('scholarship guide', () => {
  it('has unique ids, known scopes and levels, https links and steps', () => {
    expect(new Set(SCHOLARSHIPS.map((s) => s.id)).size).toBe(SCHOLARSHIPS.length);
    for (const s of SCHOLARSHIPS) {
      expect(SCH_SCOPES).toContain(s.scope);
      for (const l of s.levels) expect(SCH_LEVELS).toContain(l);
      expect(s.links.length).toBeGreaterThan(0);
      for (const l of s.links) expect(l.url).toMatch(/^https:\/\//);
      expect(s.steps.length).toBeGreaterThanOrEqual(3);
    }
  });
  it('covers every scope and level', () => {
    for (const sc of SCH_SCOPES) expect(SCHOLARSHIPS.some((s) => s.scope === sc)).toBe(true);
    for (const l of SCH_LEVELS) expect(SCHOLARSHIPS.filter((s) => s.levels.includes(l)).length).toBeGreaterThanOrEqual(3);
  });
});
