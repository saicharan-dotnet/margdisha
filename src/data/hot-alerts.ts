// Hot job alerts: short-lived openings shared directly by an employer or recruiter.
// Each alert hides itself after `expires` (the last day it is shown), so old ones never mislead anyone.
// These are not verified government notices: the card always says MargDisha is not the recruiter.

export interface HotRole { title: string; points: string[] }

export interface HotAlert {
  id: string;
  company: string;
  location: string;
  roles: HotRole[];
  /** Apply by email: the address and the referral ID to mention. */
  email: string;
  referral?: string;
  /** Where the alert was found, such as the LinkedIn post or the company's careers page. */
  source?: { label: string; url: string };
  /** ISO dates. */
  posted: string;
  expires: string;
}

export const HOT_ALERTS: HotAlert[] = [
  {
    id: 'codegama-2026-11', company: 'CodeGama Pvt Ltd', location: 'Bengaluru',
    roles: [
      { title: 'Operations Executive (bulk hiring)', points: ['Freshers only', 'Male candidates only', 'Degree completed in any stream', 'Good communication and basic MS Excel', 'Rotational shifts; willing to relocate to Bengaluru', 'CTC up to ₹2 LPA, based on skills'] },
      { title: 'Digital Marketing Executive', points: ['2 years of experience', 'Salary based on performance'] },
      { title: 'Support Executive', points: [] },
    ],
    email: 'marketing@codegama.com', referral: 'CODEGAMA-OPS26',
    posted: '2026-11-19', expires: '2026-12-03',
  },
];

/** Alerts still running today (the expiry day itself included). */
export function liveAlerts(today = new Date()): HotAlert[] {
  return HOT_ALERTS.filter((a) => new Date(a.expires + 'T23:59:59+05:30') >= today);
}
