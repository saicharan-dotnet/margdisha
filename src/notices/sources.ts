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
  /** Read this site only every N hours on the 30-minute schedule (company career pages change slowly). */
  everyHours?: number;
  /** Only links whose address contains one of these (for sites whose menus are full of other links). */
  linkMust?: string[];
  /** The site blocks servers outside India: read it through the Supabase function in Mumbai. */
  india?: boolean;
  /** The site's links change on every visit: use each heading of this tag as the notice, linked to the page. */
  headingItems?: string;
  /** Diagnostics only: in a debug run, print the page around the first place this text appears. */
  debugAround?: string;
  /** Diagnostics only: extra addresses on the same site to fetch and print in a debug run. */
  probe?: string[];
  /** The RRB website's CEN menu: read each CEN's notice types instead of ordinary links (see cenMenuNotices). */
  cenMenu?: { minYear: number; names?: Record<string, string> };
  /** Pattern for notice links kept inside the page's own script files (see scriptNotices). */
  scriptLinks?: string;
  /** The site builds its page with scripts from a JSON feed: read the feed instead of the page. */
  json?: JsonFeed;
}

export interface JsonFeed {
  url: string;
  /** Dotted path to the list in the response, e.g. "data.items". */
  items: string;
  title: string;
  /** Field(s) holding the link, first non-empty wins. Relative links are resolved against the feed address. */
  link?: string[];
  /** Used when no link field is set: "{FIELD}" is replaced by that field's value. */
  linkTemplate?: string;
  /** Optional prefix field, e.g. a category name, shown before the title. */
  prefix?: string;
}

export const NOTICE_SOURCES: NoticeSource[] = [
  // Government jobs
  // ssc.gov.in builds its page with scripts; this is the feed behind its Notice Board.
  { id: 'ssc', json: { url: 'https://ssc.gov.in/api/general-website/portal/records?page=1&limit=25&contentType=notice-boards&key=createdAt&order=DESC&isPaginationRequired=true&isAttachment=true&language=english&attributes=id,headline,examId,contentType,redirectUrl,language,createdAt', items: 'data', title: 'headline', link: ['redirectUrl'], linkTemplate: 'https://ssc.gov.in/api/attachment/{attachments.0.path}' }, name: 'Staff Selection Commission', url: 'https://ssc.gov.in/', area: 'job', sector: 'SSC' },
  { id: 'upsc', india: true, name: 'UPSC', url: 'https://upsc.gov.in/whats-new', area: 'job', sector: 'UPSC' },
  { id: 'upsc-exams', india: true, name: 'UPSC', url: 'https://upsc.gov.in/examinations/active-exams', area: 'job', sector: 'UPSC', keywords: ['examination'] },
  // All RRBs now share one website; the old regional sites (rrbsecunderabad.gov.in, rrbcdg.gov.in ...) fail or block us.
  // Its menu lists every CEN's notices (notification, exam schedule, admit cards, results ...). CEN names: from the notice PDFs.
  { id: 'rrb', india: true, name: 'Railway Recruitment Boards', url: 'https://rrb.indianrailways.gov.in/secunderabad', area: 'job', sector: 'Railways',
    cenMenu: { minYear: 2026, names: { '08/2026': 'Station Master' } } },
  { id: 'ibps', india: true, name: 'IBPS', url: 'https://www.ibps.in/', area: 'job', sector: 'Banking', keywords: ['crp'] },
  { id: 'sbi', india: true, name: 'State Bank of India', url: 'https://sbi.co.in/web/careers/current-openings', area: 'job', sector: 'Banking' },
  { id: 'rbi', name: 'Reserve Bank of India', url: 'https://opportunities.rbi.org.in/Scripts/Vacancies.aspx', area: 'job', sector: 'Banking' },
  // Telangana and Andhra Pradesh recruitment boards (the user's main focus). All refuse servers outside India.
  // TG Medical & Health Services RB builds its page from this feed; each notice opens at /view/notif/<id>.
  { id: 'tgmhsrb', india: true, json: { url: 'https://mhsrb.telangana.gov.in/mhsrb/v2/apis/api/public/news?category=regular', items: 'data', title: 'title', linkTemplate: 'https://mhsrb.telangana.gov.in/mhsrb/v2/apis/view/notif/{id}' }, name: 'TG Medical & Health Services RB', url: 'https://mhsrb.telangana.gov.in/', area: 'job', sector: 'Telangana' },
  { id: 'treirb', india: true, name: 'TG Gurukul Recruitment Board (TREI-RB)', url: 'https://treirb.cgg.gov.in/', area: 'job', sector: 'Telangana' },
  { id: 'tghc', india: true, name: 'Telangana High Court', url: 'https://tshc.gov.in/', area: 'job', sector: 'Telangana', keywords: ['recruitment', 'vacancy'], linkMust: ['/documents/'] },
  { id: 'tgschooledu', india: true, name: 'TG School Education', url: 'https://schooledu.telangana.gov.in/', area: 'job', sector: 'Telangana', keywords: ['dsc', 'teacher'] },
  { id: 'apslprb', india: true, name: 'AP Police Recruitment Board', url: 'https://slprb.ap.gov.in/', area: 'job', sector: 'Andhra Pradesh', keywords: ['sct', 'constable', 'press note'] },
  { id: 't-tgprb', india: true, name: 'TG Police Recruitment Board', url: 'https://www.tgprb.in/', area: 'job', sector: 'Telangana', scriptLinks: 'https://(?:www|doc)\\.tgprb\\.in/[^"\'`]+?\\.pdf' },
  { id: 't-apdsc', india: true, name: 'AP DSC', url: 'https://apdsc.apcfss.in/', area: 'job', sector: 'Andhra Pradesh', scriptLinks: '(?:https?://[\\w.-]+)?/[\\w%+().\\-/]+\\.pdf' },
  { id: 't-tgnpdcl', name: 'TGNPDCL', url: 'https://tgnpdcl.com/Careers', area: 'job', sector: 'Telangana' },
  { id: 't-apspdcl', india: true, name: 'APSPDCL', url: 'https://www.apspdcl.in/careers.php', area: 'job', sector: 'Andhra Pradesh' },
  { id: 't-apcpdcl', india: true, name: 'APCPDCL', url: 'https://apcpdcl.in/careers.php', area: 'job', sector: 'Andhra Pradesh' },
  { id: 't-apgenco', india: true, name: 'APGENCO', url: 'https://apgenco.gov.in/Main/page/3/203', area: 'job', sector: 'Andhra Pradesh' },
  { id: 't-apvidyut', india: true, name: 'AP Vidyut recruitment', url: 'https://apvidyutrecruitment.apcfss.in/', area: 'job', sector: 'Andhra Pradesh' },
  { id: 't-tggenco', india: true, name: 'TGGENCO', url: 'https://tggenco.com/', area: 'job', sector: 'Telangana' },
  { id: 'tgpsc', india: true, name: 'Telangana PSC', url: 'https://www.tgpsc.gov.in/', area: 'job', sector: 'State PSC', keywords: ['group'] },
  { id: 'appsc', india: true, name: 'Andhra Pradesh PSC', url: 'https://portal-psc.ap.gov.in/Default.aspx', area: 'job', sector: 'State PSC', keywords: ['group'] },
  { id: 'army', india: true, name: 'Indian Army', url: 'https://joinindianarmy.nic.in/', area: 'job', sector: 'Defence', keywords: ['agniveer', 'entry'] },
  // Public sector companies (PSUs): recruitment and apprentice notices
  { id: 'ongc', india: true, name: 'ONGC', url: 'https://ongcindia.com/web/eng/career/recruitment-notice', area: 'job', sector: 'PSU', keywords: ['apprentice', 'advertisement', 'engagement'], linkMust: ['/documents/'], everyHours: 3 },
  { id: 'ntpc', india: true, name: 'NTPC', url: 'https://careers.ntpc.co.in/recruitment/', area: 'job', sector: 'PSU', keywords: ['advertisement', 'engagement', 'advt', 'trainee', 'interview', 'test'], headingItems: 'h5', everyHours: 3 },
  { id: 'ongc-apprentice', india: true, name: 'ONGC apprentices', url: 'https://ongcindia.com/web/eng/career/apprenticeship-opportunities', area: 'job', sector: 'Apprenticeship', keywords: ['apprentice', 'engagement', 'advertisement'], linkMust: ['/documents/'], everyHours: 3 },
  { id: 'bhel', india: true, name: 'BHEL', url: 'https://careers.bhel.in/index.jsp', area: 'job', sector: 'PSU', keywords: ['advertisement', 'apprentice'], linkMust: ['careers', 'bhel.com/'], everyHours: 3 },
  { id: 'powergrid', india: true, name: 'POWERGRID', url: 'https://www.powergrid.in/en/job-opportunities', area: 'job', sector: 'PSU', keywords: ['advertisement', 'apprentice'], linkMust: ['job', 'career', 'recruit', 'apprentic', '.pdf'], everyHours: 3 },
  { id: 'coalindia', india: true, name: 'Coal India', url: 'https://www.coalindia.in/career-cil/jobs-coal-india/', area: 'job', sector: 'PSU', keywords: ['advertisement', 'apprentice'], linkMust: ['/career-cil/'], everyHours: 3 },
  { id: 'bpcl', india: true, name: 'BPCL', url: 'https://www.bharatpetroleum.in/careers/current-openings.aspx', area: 'job', sector: 'PSU', keywords: ['advertisement', 'apprentice'], linkMust: ['/images/files/', 'career'], everyHours: 3 },
  { id: 'hpcl', india: true, name: 'HPCL', url: 'https://www.hindustanpetroleum.com/job-openings', area: 'job', sector: 'PSU', keywords: ['advertisement', 'apprentice'], linkMust: ['/documents/pdf/'], everyHours: 3 },
  { id: 'sail', india: true, name: 'SAIL', url: 'https://sailcareers.com/', area: 'job', sector: 'PSU', keywords: ['advertisement', 'apprentice'], linkMust: ['sailcareers.com'], everyHours: 3 },
  { id: 'nhpc', india: true, name: 'NHPC', url: 'https://www.nhpcindia.com/welcome/job', area: 'job', sector: 'PSU', keywords: ['advertisement', 'apprentice'], linkMust: ['.pdf'], everyHours: 3 },
  { id: 'indiapost', name: 'India Post GDS', url: 'https://indiapostgdsonline.gov.in/', area: 'job', sector: 'Departments', keywords: ['gds', 'schedule'] },
  // Entrance exams
  { id: 'nta', name: 'National Testing Agency', url: 'https://nta.ac.in/', area: 'exam' },
  // School admissions
  { id: 'navodaya', india: true, json: { url: 'https://navodaya.gov.in/api/public/media?page=1&limit=30', items: 'data.items', title: 'title_english', link: ['external_url', 'download_url'], prefix: 'media_type_name' }, name: 'Navodaya Vidyalaya Samiti', url: 'https://navodaya.gov.in/', area: 'school', sector: 'Navodaya', keywords: ['jnvst', 'lateral'] },
  { id: 'aissee', india: true, name: 'AISSEE (Sainik Schools)', url: 'https://exams.nta.nic.in/sainik-school-society/', area: 'school', sector: 'Sainik', keywords: ['aissee', 'sainik'] },
  // The KVS site moved from kvsangathan.nic.in to kvs.gov.in in 2026.
  { id: 'kvs', name: 'Kendriya Vidyalaya Sangathan', url: 'https://kvs.gov.in/en/', area: 'school', sector: 'Kendriya Vidyalaya', keywords: ['balvatika', 'class i'], everyHours: 3 },
  { id: 'rms', name: 'Rashtriya Military Schools', url: 'https://www.rashtriyamilitaryschools.edu.in/', area: 'school', sector: 'Military School', keywords: ['cet'], everyHours: 3 },
  { id: 'nests', name: 'NESTS (Eklavya schools)', url: 'https://nests.tribal.gov.in/', area: 'school', sector: 'EMRS', keywords: ['emrs', 'eklavya'], everyHours: 3 },
  { id: 'tgcet', india: true, json: { url: 'https://tgcet.cgg.gov.in/TGCETWEB/getNotifications', items: 'data', title: 'DESCRIPTION', prefix: 'DEPT_SHORT_NAME', linkTemplate: 'https://tgcet.cgg.gov.in/TGCETWEB/?notification={NOTIFICATION_ID}' }, name: 'Telangana Gurukul (TGCET)', url: 'https://tgcet.cgg.gov.in/', area: 'school', sector: 'State residential', keywords: ['tgcet', 'gurukul'] },
  // Scholarships
  { id: 'nsp', name: 'National Scholarship Portal', url: 'https://scholarships.gov.in/', area: 'scholarship', sector: 'School scholarship', keywords: ['scheme', 'nmms'] },
];
