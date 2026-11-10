import { describe, expect, it } from 'vitest';
import { PRIVATE_JOBS, PRIV_QUALS, PRIV_SECTORS } from './private-jobs';

describe('private jobs guide', () => {
  it('has unique ids, known sectors and https links', () => {
    expect(new Set(PRIVATE_JOBS.map((r) => r.id)).size).toBe(PRIVATE_JOBS.length);
    for (const r of PRIVATE_JOBS) {
      expect(PRIV_SECTORS).toContain(r.sector);
      expect(r.links.length).toBeGreaterThan(0);
      for (const l of r.links) expect(l.url).toMatch(/^https:\/\//);
      expect(r.steps.length).toBeGreaterThanOrEqual(3);
    }
  });
  it('offers routes for every qualification', () => {
    for (const q of PRIV_QUALS) expect(PRIVATE_JOBS.filter((r) => r.quals.includes(q)).length).toBeGreaterThanOrEqual(5);
  });
});
