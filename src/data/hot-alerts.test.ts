import { describe, expect, it } from 'vitest';
import { HOT_ALERTS, liveAlerts } from './hot-alerts';

describe('hot alerts', () => {
  const a = HOT_ALERTS[0];
  it('shows an alert up to and including its expiry day (IST)', () => {
    expect(liveAlerts(new Date(a.expires + 'T22:00:00+05:30')).some((x) => x.id === a.id)).toBe(true);
  });
  it('hides it from the next day', () => {
    expect(liveAlerts(new Date(new Date(a.expires + 'T23:59:59+05:30').getTime() + 2000)).some((x) => x.id === a.id)).toBe(false);
  });
});
