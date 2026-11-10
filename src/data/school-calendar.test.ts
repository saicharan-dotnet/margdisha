import { describe, expect, it } from 'vitest';
import { SCHOOL_CALENDAR, calendarStatus, inWindow, monthName, monthsUntil } from './school-calendar';

describe('school calendar', () => {
  it('handles windows that wrap past December', () => {
    expect(inWindow(12, 11, 1)).toBe(true);
    expect(inWindow(1, 11, 1)).toBe(true);
    expect(inWindow(2, 11, 1)).toBe(false);
    expect(inWindow(6, 6, 9)).toBe(true);
  });
  it('counts months until a window opens', () => {
    expect(monthsUntil(11, 11, 1)).toBe(0);
    expect(monthsUntil(2, 11, 1)).toBe(9);
    expect(monthsUntil(12, 3, 4)).toBe(3);
  });
  it('gives open / soon / later', () => {
    const nov = new Date(2026, 10, 10);
    expect(calendarStatus({ formsFrom: 11, formsTo: 1 }, nov)).toBe('open');
    expect(calendarStatus({ formsFrom: 1, formsTo: 2 }, nov)).toBe('soon');
    expect(calendarStatus({ formsFrom: 6, formsTo: 9 }, nov)).toBe('later');
  });
  it('covers Class 1 entry and has valid months', () => {
    expect(SCHOOL_CALENDAR.some((e) => /\bClass 1\b/.test(e.joins))).toBe(true);
    for (const e of SCHOOL_CALENDAR) {
      expect(e.formsFrom).toBeGreaterThanOrEqual(1); expect(e.formsTo).toBeLessThanOrEqual(12);
      expect(e.url).toMatch(/^https:\/\//);
    }
    expect(monthName(1)).toBe('Jan');
  });
});

import { JOB_CALENDAR } from './job-calendar';
import { latestNoticeFor } from '../components/CalendarCard';
describe('job calendar', () => {
  it('has valid entries with a known qualification', () => {
    for (const e of JOB_CALENDAR) {
      expect(['10th pass', '12th pass', 'Graduate']).toContain(e.joins);
      expect(e.formsFrom).toBeGreaterThanOrEqual(1); expect(e.formsTo).toBeLessThanOrEqual(12);
    }
  });
  it('matches the latest notice by exam name within the sector', () => {
    const cgl = JOB_CALENDAR.find((e) => e.id === 'ssc-cgl')!;
    const notices = [
      { title: 'Notice of CHSL 2027', url: 'a', sector: 'SSC' },
      { title: 'Combined Graduate Level Examination 2027', url: 'b', sector: 'SSC' },
    ];
    expect(latestNoticeFor(notices, cgl)?.url).toBe('b');
  });
});
