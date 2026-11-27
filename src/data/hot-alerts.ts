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
  email?: string;
  /** Or apply on an official website (government recruitment). */
  applyUrl?: { label: string; url: string };
  /** Government recruitment: shows the "check the official notice" note instead of "shared by the company". */
  official?: boolean;
  referral?: string;
  /** Where the alert was found, such as the LinkedIn post or the company's careers page. */
  source?: { label: string; url: string };
  /** ISO dates. */
  posted: string;
  expires: string;
}

export const HOT_ALERTS: HotAlert[] = [
  {
    // Facts from the SLPRB notifications Rc.No.81 and 91/SLPRB/2026 (16 Sep 2026) and the press note of 26 Nov 2026,
    // as reported by AllExamReview, APTeachers and CareerPower (read 2026-11-27); only figures two sources agree on.
    id: 'ap-police-si-constable-2026', company: 'AP Police · SI and Constable 2026 (SLPRB)', location: 'Andhra Pradesh',
    roles: [
      { title: 'Sub-Inspector (Civil 253, RSI AR 116, SPF 9) · 378 posts', points: [
        'Any degree',
        'Age 21 to 27 years as on 1 Jul 2026 (SC, ST, BC, EWS +5 years)',
        'Fee ₹600; ₹300 for SC/ST of AP',
        'Preliminary written test on 28 Feb 2027',
      ] },
      { title: 'Police Constable (Civil 542, AR 285), Firemen 158, Jail Warders 171', points: [
        'Intermediate (12th) pass',
        'Age 18 to 24 for constables, 18 to 32 for firemen and warders, as on 1 Jul 2026 (SC, ST, BC, EWS +5 years)',
        'Fee ₹300; ₹150 for SC/ST of AP · pay ₹25,220 to ₹80,910',
        'Preliminary written test on 31 Jan 2027',
      ] },
      { title: 'How to apply', points: [
        'Apply online from 27 Nov 2026, 5 PM to 16 Dec 2026, 5 PM',
        'Selection: preliminary test (qualifying), height and physical tests, final written exam, documents and medical',
        'Communication, driver, mechanic, FSL and driver-operator posts: dates to be announced separately',
      ] },
    ],
    applyUrl: { label: 'apslprb.onlineportal.org.in', url: 'https://apslprb.onlineportal.org.in/apply-online/' },
    source: { label: 'AP Police Recruitment Board website (Recruitment)', url: 'https://slprb.ap.gov.in/' },
    official: true, posted: '2026-11-27', expires: '2026-12-16',
  },
  {
    // Facts from the CEN 08/2026 coverage (Adda247, CareerPower, PW, read 2026-11-23); the RRB sites block our servers.
    id: 'rrb-station-master-cen-08-2026', company: 'Railways · Station Master (RRB CEN 08/2026)', location: 'All India, all RRBs',
    roles: [
      { title: 'Station Master · Level 6, starting basic pay ₹35,400', points: [
        'About 1,265 posts across all RRBs (check your RRB in the official notice)',
        'Any graduate; degree must be complete by 25 Nov 2026 (result awaited = not eligible)',
        'Age 20 to 33 years as on 1 Jan 2027 (OBC +3, SC/ST +5 years)',
        'Fee ₹500 (₹400 refunded after the CBT); ₹250 for SC/ST, women and other listed groups',
        'Selection: computer test (CBT), aptitude test (CBAT), documents, medical',
        'Last date 25 Nov 2026, 11:59 PM · fee by 27 Nov · corrections 28 Nov to 7 Dec',
      ] },
    ],
    applyUrl: { label: 'rrbapply.gov.in', url: 'https://www.rrbapply.gov.in/' },
    source: { label: 'Official RRB website (CEN 08/2026 → Notification)', url: 'https://rrb.indianrailways.gov.in/secunderabad' },
    official: true, posted: '2026-10-27', expires: '2026-11-25',
  },
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
