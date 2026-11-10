import type { CalendarEntry } from './school-calendar';

/**
 * When the big government job notifications USUALLY come out, based on past years and the
 * Railways' published yearly plan. Planning guidance only: dates move every year, so each
 * card links to the official site and shows the latest matching notice we collected.
 * `joins` holds the minimum qualification, which the Jobs page filters on.
 */
export const JOB_CALENDAR: CalendarEntry[] = [
  { id: 'upsc-cse', school: 'UPSC Civil Services (IAS, IPS, IFS)', sector: 'UPSC', joins: 'Graduate',
    who: 'Any degree. Age 21 to 32 (relaxation for reserved categories)', formsFrom: 1, formsTo: 2,
    selection: 'Prelims in May or June, then Mains and interview', url: 'https://upsc.gov.in', match: 'civil services' },
  { id: 'upsc-nda', school: 'UPSC NDA and NA (Army, Navy, Air Force)', sector: 'UPSC', joins: '12th pass',
    who: '12th pass or appearing. Age about 16½ to 19½, unmarried', formsFrom: 12, formsTo: 1,
    selection: 'Written exam in April and September, then SSB interview', url: 'https://upsc.gov.in', match: 'NDA|naval academy' },
  { id: 'ssc-cgl', school: 'SSC CGL (central government Group B and C posts)', sector: 'SSC', joins: 'Graduate',
    who: 'Any degree. Age 18 to 32 depending on the post', formsFrom: 6, formsTo: 7,
    selection: 'Tier 1 and Tier 2 computer-based exams', url: 'https://ssc.gov.in', match: 'CGL|combined graduate' },
  { id: 'ssc-chsl', school: 'SSC CHSL (LDC, DEO, Postal Assistant)', sector: 'SSC', joins: '12th pass',
    who: '12th pass. Age 18 to 27', formsFrom: 4, formsTo: 6,
    selection: 'Tier 1 and Tier 2 computer-based exams', url: 'https://ssc.gov.in', match: 'CHSL|higher secondary' },
  { id: 'ssc-mts', school: 'SSC MTS and Havaldar', sector: 'SSC', joins: '10th pass',
    who: '10th pass. Age 18 to 25 or 27', formsFrom: 6, formsTo: 7,
    selection: 'Computer-based exam; physical test for Havaldar', url: 'https://ssc.gov.in', match: 'MTS|multi tasking' },
  { id: 'ssc-gd', school: 'SSC GD Constable (BSF, CRPF, CISF, ITBP, SSB, Assam Rifles)', sector: 'SSC', joins: '10th pass',
    who: '10th pass. Age 18 to 23', formsFrom: 9, formsTo: 11,
    selection: 'Computer-based exam, physical test and medical', url: 'https://ssc.gov.in', match: 'GD|general duty|constable' },
  { id: 'rrb-alp', school: 'Railways Assistant Loco Pilot (RRB ALP)', sector: 'Railways', joins: '10th pass',
    who: '10th pass plus ITI, or a diploma or degree in engineering. Age 18 to 30', formsFrom: 1, formsTo: 3,
    selection: 'Two computer-based tests and an aptitude test', url: 'https://indianrailways.gov.in', match: 'ALP|loco pilot' },
  { id: 'rrb-tech', school: 'Railways Technicians (RRB)', sector: 'Railways', joins: '10th pass',
    who: '10th pass plus ITI, or a diploma or B.Sc. Age 18 to 33', formsFrom: 4, formsTo: 6,
    selection: 'Computer-based test, then documents and medical', url: 'https://indianrailways.gov.in', match: 'technician' },
  { id: 'rrb-ntpc', school: 'Railways NTPC (clerks, station master, goods guard)', sector: 'Railways', joins: '12th pass',
    who: '12th pass for some posts, a degree for others. Age 18 to 33', formsFrom: 7, formsTo: 9,
    selection: 'Computer-based tests, then typing or aptitude test', url: 'https://indianrailways.gov.in', match: 'NTPC|non technical' },
  { id: 'rrb-d', school: 'Railways Group D (Level 1)', sector: 'Railways', joins: '10th pass',
    who: '10th pass or ITI. Age 18 to 33', formsFrom: 10, formsTo: 12,
    selection: 'Computer-based test, then physical test', url: 'https://indianrailways.gov.in', match: 'group d|level 1|level-1' },
  { id: 'ibps-po', school: 'IBPS PO (Probationary Officer, public sector banks)', sector: 'Banking', joins: 'Graduate',
    who: 'Any degree. Age 20 to 30', formsFrom: 7, formsTo: 8,
    selection: 'Prelims, Mains and interview', url: 'https://www.ibps.in', match: 'PO|probationary' },
  { id: 'ibps-clerk', school: 'IBPS Clerk (public sector banks)', sector: 'Banking', joins: 'Graduate',
    who: 'Any degree, and the state language. Age 20 to 28', formsFrom: 7, formsTo: 8,
    selection: 'Prelims and Mains', url: 'https://www.ibps.in', match: 'clerk|CSA' },
  { id: 'agniveer', school: 'Indian Army Agniveer', sector: 'Defence', joins: '10th pass',
    who: '10th or 12th pass depending on the trade. Age 17½ to 21', formsFrom: 2, formsTo: 4,
    selection: 'Online exam, then rally (physical test and medical)', url: 'https://joinindianarmy.nic.in', match: 'agniveer|agnipath' },
  { id: 'gds', school: 'India Post Gramin Dak Sevak (GDS)', sector: 'Departments', joins: '10th pass',
    who: '10th pass with maths and the local language. Age 18 to 40', formsFrom: 1, formsTo: 2,
    selection: 'No exam: merit list from 10th marks', url: 'https://indiapostgdsonline.gov.in', match: 'GDS|gramin dak' },
];
