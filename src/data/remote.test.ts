import { describe, expect, it } from 'vitest';
import { openUrl, isOver } from './remote';

describe('openUrl', () => {
  it('opens the RRB page instead of its inner getdata pages, and leaves other links alone', () => {
    expect(openUrl('https://rrb.indianrailways.gov.in/getdata?cennum=08/2026&loc=secunderabad&category=Notification')).toBe('https://rrb.indianrailways.gov.in/secunderabad');
    expect(openUrl('https://ssc.gov.in/notice.pdf')).toBe('https://ssc.gov.in/notice.pdf');
  });
});

describe('isOver', () => {
  const now = Date.UTC(2026, 10, 26);
  it('hides notices whose dates have all passed', () => {
    expect(isOver({ title: 'Stage-I written examination for Assistant Editor scheduled on 04.10.2026', url: 'https://x.in/a.pdf' }, now)).toBe(true);
    expect(isOver({ title: 'Interaction from 27.10.2026 to 29.10.2026', url: 'https://x.in/a.pdf' }, now)).toBe(true);
  });
  it('reads dates written without separators, with three days of grace', () => {
    expect(isOver({ title: 'PressNote dated 17092026', url: 'https://x.in/a.pdf' }, now)).toBe(true);
    expect(isOver({ title: 'PressNote dated 25112026', url: 'https://x.in/a.pdf' }, now)).toBe(false);
  });
  it('keeps notices with a date still ahead, or no date', () => {
    expect(isOver({ title: 'Civil Judge applications extended till 30.11.2026', url: 'https://x.in/a.pdf' }, now)).toBe(false);
    expect(isOver({ title: 'SSC CHSL admit card released', url: 'https://ssc.gov.in/notice_23112026.pdf' }, now)).toBe(false);
  });
  it('hides files named with an upload time more than 3 weeks old', () => {
    expect(isOver({ title: 'Law Clerk provisional selection list', url: 'https://aphc.gov.in/docs/notification_1789803609_0.pdf' }, now)).toBe(true);
    expect(isOver({ title: 'Driver second list', url: 'https://aphc.gov.in/docs/notification_1795105853_0.pdf' }, now)).toBe(false);
  });
});
