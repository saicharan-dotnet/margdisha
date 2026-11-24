import { describe, expect, it } from 'vitest';
import { openUrl } from './remote';

describe('openUrl', () => {
  it('opens the RRB page instead of its inner getdata pages, and leaves other links alone', () => {
    expect(openUrl('https://rrb.indianrailways.gov.in/getdata?cennum=08/2026&loc=secunderabad&category=Notification')).toBe('https://rrb.indianrailways.gov.in/secunderabad');
    expect(openUrl('https://ssc.gov.in/notice.pdf')).toBe('https://ssc.gov.in/notice.pdf');
  });
});
