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

import { JOB_CALENDAR } from './job-calendar';
describe('government jobs by field', () => {
  it('has routes for engineers and for doctors and nurses', () => {
    expect(JOB_CALENDAR.filter((e) => e.fields?.includes('engineer')).length).toBeGreaterThanOrEqual(15);
    expect(JOB_CALENDAR.filter((e) => e.fields?.includes('medical')).length).toBeGreaterThanOrEqual(7);
    for (const e of JOB_CALENDAR) expect(e.steps?.length ?? 0).toBeGreaterThan(0);
  });
});
