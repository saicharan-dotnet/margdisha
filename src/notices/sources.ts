/**
 * Official websites the notice collector reads (scripts/collect-notices.ts).
 * Only official government or employer websites belong here. The collector stores the
 * title and link of each new notice; an admin decides what becomes a listing.
 */
export type NoticeArea = 'job' | 'school' | 'exam' | 'scholarship';

export interface NoticeSource {
  id: string;
  name: string;
  url: string;
  area: NoticeArea;
  sector?: string;
  /** Extra words that mark a link as a notice on this site (added to the defaults). */
  keywords?: string[];
}

export const NOTICE_SOURCES: NoticeSource[] = [
  // Government jobs
  { id: 'ssc', name: 'Staff Selection Commission', url: 'https://ssc.gov.in/', area: 'job', sector: 'SSC' },
  { id: 'upsc', name: 'UPSC', url: 'https://upsc.gov.in/whats-new', area: 'job', sector: 'UPSC' },
  { id: 'upsc-exams', name: 'UPSC', url: 'https://upsc.gov.in/examinations/active-exams', area: 'job', sector: 'UPSC', keywords: ['examination'] },
  { id: 'rrb-secunderabad', name: 'RRB Secunderabad', url: 'https://rrbsecunderabad.gov.in/', area: 'job', sector: 'Railways', keywords: ['cen'] },
  { id: 'rrb-chandigarh', name: 'RRB Chandigarh', url: 'https://www.rrbcdg.gov.in/', area: 'job', sector: 'Railways', keywords: ['cen'] },
  { id: 'ibps', name: 'IBPS', url: 'https://www.ibps.in/', area: 'job', sector: 'Banking', keywords: ['crp'] },
  { id: 'sbi', name: 'State Bank of India', url: 'https://sbi.co.in/web/careers/current-openings', area: 'job', sector: 'Banking' },
  { id: 'rbi', name: 'Reserve Bank of India', url: 'https://opportunities.rbi.org.in/Scripts/Vacancies.aspx', area: 'job', sector: 'Banking' },
  { id: 'tgpsc', name: 'Telangana PSC', url: 'https://www.tspsc.gov.in/', area: 'job', sector: 'State PSC', keywords: ['group'] },
  { id: 'appsc', name: 'Andhra Pradesh PSC', url: 'https://psc.ap.gov.in/', area: 'job', sector: 'State PSC', keywords: ['group'] },
  { id: 'army', name: 'Indian Army', url: 'https://joinindianarmy.nic.in/', area: 'job', sector: 'Defence', keywords: ['agniveer', 'entry'] },
  { id: 'indiapost', name: 'India Post GDS', url: 'https://indiapostgdsonline.gov.in/', area: 'job', sector: 'Departments', keywords: ['gds', 'schedule'] },
  // Entrance exams
  { id: 'nta', name: 'National Testing Agency', url: 'https://nta.ac.in/', area: 'exam' },
  // School admissions
  { id: 'navodaya', name: 'Navodaya Vidyalaya Samiti', url: 'https://navodaya.gov.in/', area: 'school', sector: 'Navodaya', keywords: ['jnvst', 'lateral'] },
  { id: 'aissee', name: 'AISSEE (Sainik Schools)', url: 'https://exams.nta.ac.in/AISSEE/', area: 'school', sector: 'Sainik', keywords: ['aissee', 'sainik'] },
  { id: 'kvs', name: 'Kendriya Vidyalaya Sangathan', url: 'https://kvsangathan.nic.in/', area: 'school', sector: 'Kendriya Vidyalaya', keywords: ['balvatika', 'class i'] },
  { id: 'rms', name: 'Rashtriya Military Schools', url: 'https://www.rashtriyamilitaryschools.edu.in/', area: 'school', sector: 'Military School', keywords: ['cet'] },
  { id: 'nests', name: 'NESTS (Eklavya schools)', url: 'https://nests.tribal.gov.in/', area: 'school', sector: 'EMRS', keywords: ['emrs', 'eklavya'] },
  { id: 'tgcet', name: 'Telangana Gurukul (TGCET)', url: 'https://tgcet.cgg.gov.in/', area: 'school', sector: 'State residential', keywords: ['tgcet', 'gurukul'] },
  // Scholarships
  { id: 'nsp', name: 'National Scholarship Portal', url: 'https://scholarships.gov.in/', area: 'scholarship', sector: 'School scholarship', keywords: ['scheme', 'nmms'] },
];
