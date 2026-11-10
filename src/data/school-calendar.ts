/**
 * When school admission forms USUALLY open, based on past years. This is planning guidance only:
 * dates change every year, so every entry links to the official site, and the page shows the
 * latest notices collected from those sites next to it. Months are 1–12; a window may wrap the
 * year end (e.g. 11 → 1).
 */
export interface CalendarEntry {
  id: string;
  school: string;
  sector: string;
  /** Class the child joins. Matches the "my child is in" filter on the Schools page. */
  joins: string;
  /** Who can apply, in plain words. */
  who: string;
  /** Month window when the application form is usually open. */
  formsFrom: number;
  formsTo: number;
  /** When the test or selection usually happens. */
  selection: string;
  url: string;
  /** Limited to one state. */
  state?: string;
}

export const SCHOOL_CALENDAR: CalendarEntry[] = [
  { id: 'kv-1', school: 'Kendriya Vidyalaya', sector: 'Kendriya Vidyalaya', joins: 'Balvatika and Class 1',
    who: 'Children aged 6 or more (Class 1) or 3 to 5 (Balvatika) on the cut-off date',
    formsFrom: 3, formsTo: 4, selection: 'Online registration, then lottery lists in April', url: 'https://kvsangathan.nic.in' },
  { id: 'kv-2', school: 'Kendriya Vidyalaya', sector: 'Kendriya Vidyalaya', joins: 'Class 2 to Class 10',
    who: 'Any child, only where the school has vacant seats', formsFrom: 4, formsTo: 4,
    selection: 'Registration at the school, offline', url: 'https://kvsangathan.nic.in' },
  { id: 'kv-11', school: 'Kendriya Vidyalaya', sector: 'Kendriya Vidyalaya', joins: 'Class 11',
    who: 'After Class 10 results', formsFrom: 5, formsTo: 6, selection: 'Merit in Class 10 marks', url: 'https://kvsangathan.nic.in' },
  { id: 'tgcet', school: 'Telangana Gurukul schools (TGCET)', sector: 'State residential', joins: 'Class 5', state: 'Telangana',
    who: 'Children studying Class 4 in Telangana', formsFrom: 1, formsTo: 2, selection: 'Entrance test, usually February or March', url: 'https://tgcet.cgg.gov.in' },
  { id: 'ap-gurukul', school: 'Andhra Pradesh residential and Gurukul schools', sector: 'State residential', joins: 'Class 5', state: 'Andhra Pradesh',
    who: 'Children studying Class 4 in Andhra Pradesh', formsFrom: 3, formsTo: 4, selection: 'Entrance test, usually April or May', url: 'https://aprs.apcfss.in' },
  { id: 'jnv-6', school: 'Jawahar Navodaya Vidyalaya (JNVST)', sector: 'Navodaya', joins: 'Class 6',
    who: 'Children studying Class 5 in the same district', formsFrom: 6, formsTo: 9, selection: 'Selection test, usually January or April', url: 'https://navodaya.gov.in' },
  { id: 'jnv-9', school: 'Jawahar Navodaya Vidyalaya, lateral entry', sector: 'Navodaya', joins: 'Class 9',
    who: 'Children studying Class 8 in the same district', formsFrom: 9, formsTo: 10, selection: 'Selection test, usually February', url: 'https://navodaya.gov.in' },
  { id: 'emrs-6', school: 'Eklavya Model Residential Schools', sector: 'EMRS', joins: 'Class 6',
    who: 'Scheduled Tribe children studying Class 5', formsFrom: 2, formsTo: 4, selection: 'State entrance test; dates vary by state', url: 'https://nests.tribal.gov.in' },
  { id: 'sainik', school: 'Sainik Schools (AISSEE)', sector: 'Sainik', joins: 'Class 6 and Class 9',
    who: 'Class 6: about 10 to 12 years old. Class 9: studying Class 8', formsFrom: 11, formsTo: 1, selection: 'Entrance exam, usually January to April', url: 'https://exams.nta.nic.in/sainik-school-society/' },
  { id: 'rms', school: 'Rashtriya Military Schools (CET)', sector: 'Military School', joins: 'Class 6 and Class 9',
    who: 'Class 6 and Class 9 age groups in the notice', formsFrom: 9, formsTo: 10, selection: 'Common Entrance Test, usually December', url: 'https://www.rashtriyamilitaryschools.edu.in' },
  { id: 'nmms', school: 'NMMS scholarship', sector: 'School scholarship', joins: 'Classes 9 to 12',
    who: 'Class 8 students in government and aided schools', formsFrom: 8, formsTo: 10, selection: 'State exam, usually November or December', url: 'https://scholarships.gov.in' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const monthName = (m: number) => MONTHS[(m - 1 + 12) % 12];

/** Is month m inside the window (which may wrap past December)? */
export const inWindow = (m: number, from: number, to: number) => (from <= to ? m >= from && m <= to : m >= from || m <= to);

/** Months from `now` until the window next opens (0 = open now). */
export function monthsUntil(now: number, from: number, to: number) {
  if (inWindow(now, from, to)) return 0;
  return (from - now + 12) % 12;
}

/** "open" now, "soon" within 2 months, otherwise "later". */
export function calendarStatus(e: Pick<CalendarEntry, 'formsFrom' | 'formsTo'>, now = new Date()): 'open' | 'soon' | 'later' {
  const n = monthsUntil(now.getMonth() + 1, e.formsFrom, e.formsTo);
  return n === 0 ? 'open' : n <= 2 ? 'soon' : 'later';
}
