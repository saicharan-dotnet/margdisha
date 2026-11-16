// Guide to the main scholarships students in India can apply for (mainly Telangana and Andhra Pradesh).
// These are not live vacancies: each entry says who it is for, what it gives, when forms usually open and
// how to apply, with official links. Amounts and rules change, so every card asks people to check the official page.

export type SchScope = 'Central' | 'Telangana' | 'Andhra Pradesh' | 'Private';
export type SchLevel = 'School' | 'Inter' | 'Diploma' | 'Degree' | 'Engineering' | 'PG';
export const SCH_SCOPES: SchScope[] = ['Central', 'Telangana', 'Andhra Pradesh', 'Private'];
export const SCH_LEVELS: SchLevel[] = ['School', 'Inter', 'Diploma', 'Degree', 'Engineering', 'PG'];

export interface ScholarshipGuide {
  id: string;
  title: string;
  scope: SchScope;
  levels: SchLevel[];
  /** What the student gets. */
  gives: string;
  who: string;
  /** When forms usually open, from past years. */
  when: string;
  steps: string[];
  links: { label: string; url: string }[];
  note?: string;
}

const CHECK = 'Amounts, income limits and dates change every year. Always read the latest guidelines on the official website before applying.';
const NSP = { label: 'National Scholarship Portal', url: 'https://scholarships.gov.in' };

export const SCHOLARSHIPS: ScholarshipGuide[] = [
  // ---- Central government (National Scholarship Portal) ----
  {
    id: 'nsp-post-matric', title: 'Post-matric scholarships for SC, ST, OBC and minority students', scope: 'Central',
    levels: ['Inter', 'Diploma', 'Degree', 'Engineering', 'PG'],
    gives: 'Course fees (fully or partly) and a monthly maintenance allowance while you study after Class 10',
    who: 'SC, ST, OBC and minority students studying Intermediate, diploma, degree, engineering or PG, with family income under the limit for their category (for example ₹2.5 lakh a year for SC students)',
    when: 'Usually July to November',
    steps: [
      'Get your caste certificate, income certificate, Aadhaar and a bank account in your own name ready.',
      'Register on the National Scholarship Portal (or your state portal, which many states use for these schemes) and fill the application.',
      'Upload your marks memos, fee receipt and certificates, then submit.',
      'Your college verifies the application online; check the status on the portal until the money reaches your bank account.',
    ],
    links: [NSP], note: 'In Telangana and Andhra Pradesh most of these are applied for through the state portals (ePASS and Jnanabhumi) below. ' + CHECK,
  },
  {
    id: 'nsp-pre-matric', title: 'Pre-matric scholarships for Class 9 and 10', scope: 'Central',
    levels: ['School'],
    gives: 'A yearly scholarship for school students in Class 9 and 10',
    who: 'SC, ST, OBC and minority students in Class 9 or 10 with family income under the scheme limit',
    when: 'Usually August to November',
    steps: [
      'Ask your school headmaster which pre-matric scheme you can apply for.',
      'Apply on the National Scholarship Portal or your state portal with Aadhaar, caste and income certificates.',
      'The school verifies the application; the money goes to the student\'s bank account.',
    ],
    links: [NSP], note: CHECK,
  },
  {
    id: 'nmms', title: 'NMMS: National Means-cum-Merit Scholarship', scope: 'Central',
    levels: ['School'],
    gives: '₹12,000 a year from Class 9 to Class 12 (₹48,000 in total) if you keep passing',
    who: 'Class 8 students in government, local body or aided schools, with family income up to ₹3.5 lakh a year and the minimum marks in Class 7',
    when: 'Applications usually August to October; exam usually November or December',
    steps: [
      'In Class 8, apply through your school when the state exam board announces NMMS.',
      'Write the NMMS exam (mental ability and school subjects) conducted by your state.',
      'If selected, register on the National Scholarship Portal every year from Class 9 to 12 to keep getting the money.',
    ],
    links: [NSP, { label: 'Telangana exam board (BSE)', url: 'https://bse.telangana.gov.in' }, { label: 'AP exam board (BSE)', url: 'https://www.bse.ap.gov.in' }],
    note: CHECK,
  },
  {
    id: 'cs-college', title: 'Central Sector Scholarship for college and university students', scope: 'Central',
    levels: ['Degree', 'Engineering', 'PG'],
    gives: '₹12,000 a year for the first three years of a degree and ₹20,000 a year after that (including PG)',
    who: 'Students in the top 20 percent of their Class 12 board results, studying a regular degree course, with family income up to ₹4.5 lakh a year',
    when: 'Usually July to October',
    steps: [
      'Check that your Class 12 marks are above your board\'s cut-off for this scheme.',
      'Apply on the National Scholarship Portal in your first year of college.',
      'Renew it every year on the portal with your marks, keeping the attendance and marks rules.',
    ],
    links: [NSP], note: CHECK,
  },
  {
    id: 'aicte-pragati-saksham', title: 'AICTE Pragati (girls) and Saksham (students with disabilities)', scope: 'Central',
    levels: ['Diploma', 'Engineering'],
    gives: '₹50,000 a year for fees, books and equipment',
    who: 'Pragati: girl students in the first or second year of an AICTE-approved diploma or degree (such as B.Tech). Saksham: students with 40 percent or more disability in the same courses. Family income up to ₹8 lakh a year.',
    when: 'Usually September to December',
    steps: [
      'Make sure your college and course are AICTE-approved.',
      'Apply on the National Scholarship Portal with your admission letter, fee receipt, income certificate and (for Saksham) disability certificate.',
      'Your college verifies it online; selection is by merit in the qualifying exam.',
    ],
    links: [NSP, { label: 'AICTE scholarships', url: 'https://www.aicte.gov.in/schemes/students-development-schemes' }], note: CHECK,
  },
  {
    id: 'inspire-she', title: 'INSPIRE-SHE scholarship for science students', scope: 'Central',
    levels: ['Degree', 'PG'],
    gives: '₹80,000 a year (₹60,000 scholarship plus ₹20,000 for a summer research project) for up to five years',
    who: 'Students in the top 1 percent of their Class 12 board (or with a top JEE or NEET rank) who study B.Sc, BS or integrated M.Sc in natural or basic sciences',
    when: 'Usually after college admissions, around September to December',
    steps: [
      'Check that you qualify through your Class 12 board percentile or entrance exam rank.',
      'Join a B.Sc, BS or integrated M.Sc in natural sciences.',
      'Apply on the INSPIRE website with your marks, admission proof and a letter from your college.',
    ],
    links: [{ label: 'INSPIRE (DST)', url: 'https://online-inspire.gov.in' }], note: CHECK,
  },
  {
    id: 'pmss-ksb', title: 'PM Scholarship for children of ex-servicemen', scope: 'Central',
    levels: ['Engineering', 'Degree', 'PG'],
    gives: '₹2,500 a month for boys and ₹3,000 a month for girls, during professional courses',
    who: 'Children and widows of ex-servicemen and Coast Guard personnel, in the first year of professional courses such as B.Tech, MBBS, BBA, BCA or B.Pharm, with 60 percent or more in Class 12',
    when: 'Usually August to November',
    steps: [
      'Get the ex-servicemen dependent certificate from the Zila Sainik Board.',
      'Apply online on the Kendriya Sainik Board website.',
      'Renew every year with your marks.',
    ],
    links: [{ label: 'Kendriya Sainik Board', url: 'https://ksb.gov.in' }], note: CHECK,
  },

  // ---- Telangana ----
  {
    id: 'ts-epass', title: 'Telangana ePASS: post-matric scholarship and fee reimbursement', scope: 'Telangana',
    levels: ['Inter', 'Diploma', 'Degree', 'Engineering', 'PG'],
    gives: 'College fees paid by the government (fully or partly) plus a scholarship for food and hostel costs',
    who: 'SC, ST, BC, EBC, minority and disabled students of Telangana studying Intermediate or higher, with family income under the state limit (about ₹2 lakh a year in cities and ₹1.5 lakh in villages)',
    when: 'Usually opens after admissions, around August to December; renew every year',
    steps: [
      'Keep Aadhaar, caste, income and residence certificates, marks memos and a bank account ready.',
      'Register on the Telangana ePASS website and fill the fresh or renewal application.',
      'Submit the printed application with documents at your college for verification.',
      'Track the status on ePASS; fees go to the college and the scholarship to your bank account.',
    ],
    links: [{ label: 'Telangana ePASS', url: 'https://telanganaepass.cgg.gov.in' }], note: CHECK,
  },

  // ---- Andhra Pradesh ----
  {
    id: 'ap-fee-reimbursement', title: 'Andhra Pradesh post-matric fee reimbursement and hostel support', scope: 'Andhra Pradesh',
    levels: ['Diploma', 'Degree', 'Engineering', 'PG'],
    gives: 'College fees paid by the state for eligible students, plus yearly support for food and hostel costs',
    who: 'SC, ST, BC, EBC, Kapu, minority and disabled students of Andhra Pradesh in ITI, polytechnic, degree, engineering, medical and PG courses, with family income under the state limit',
    when: 'Usually after admissions; your college registers you',
    steps: [
      'Make sure your Aadhaar is linked to your bank account and your caste and income certificates are valid.',
      'Your college registers you on the Jnanabhumi portal; check your details there with your Aadhaar.',
      'Complete eKYC or biometric verification at the college or ward or village secretariat when asked.',
    ],
    links: [{ label: 'AP Jnanabhumi', url: 'https://jnanabhumi.ap.gov.in' }],
    note: 'Scheme names in Andhra Pradesh change with the government, but the process is through Jnanabhumi. ' + CHECK,
  },

  // ---- Private and company (CSR) scholarships ----
  {
    id: 'reliance-ug', title: 'Reliance Foundation undergraduate scholarships', scope: 'Private',
    levels: ['Degree', 'Engineering'],
    gives: 'Up to ₹2 lakh over the whole degree, plus mentoring',
    who: 'First-year students of any full-time degree in India with Class 12 marks of 60 percent or more and family income under ₹15 lakh (low-income families preferred)',
    when: 'Usually August to October',
    steps: [
      'Apply online on the Reliance Foundation scholarships website in your first year.',
      'Take the online aptitude test.',
      'Shortlisted students are selected on the test, Class 12 marks and family income.',
    ],
    links: [{ label: 'Reliance Foundation Scholarships', url: 'https://www.scholarships.reliancefoundation.org' }], note: CHECK,
  },
  {
    id: 'kotak-kanya', title: 'Kotak Kanya Scholarship for girls', scope: 'Private',
    levels: ['Engineering', 'Degree'],
    gives: '₹1.5 lakh a year until the course ends',
    who: 'Girl students in the first year of professional courses such as engineering, MBBS, BDS, integrated LLB, B.Arch, B.Pharm or B.Sc Nursing at reputed colleges, with 75 percent or more in Class 12 and family income up to ₹6 lakh a year',
    when: 'Usually August to October',
    steps: [
      'Check the list of eligible courses and colleges for the year.',
      'Apply online with your Class 12 marks, admission proof and income certificate.',
      'Shortlisted students go through a document check and interview.',
    ],
    links: [{ label: 'Kotak Education Foundation', url: 'https://kotakeducation.org' }], note: CHECK,
  },
  {
    id: 'lic-golden-jubilee', title: 'LIC Golden Jubilee Scholarship', scope: 'Private',
    levels: ['Inter', 'Diploma', 'Degree', 'Engineering'],
    gives: 'Yearly help for higher studies, for the duration of the course',
    who: 'Students who passed Class 10 or 12 with at least 60 percent and whose family income is under the limit; special scheme for girl students after Class 10',
    when: 'Usually November to January',
    steps: [
      'Watch the LIC website for the Golden Jubilee Scholarship notice.',
      'Apply online with your marks memo and income certificate.',
      'Selected students are informed by LIC; keep your bank details ready.',
    ],
    links: [{ label: 'LIC of India', url: 'https://licindia.in' }], note: CHECK,
  },
  {
    id: 'sch-portals', title: 'Scholarship portals: find more company and trust scholarships', scope: 'Private',
    levels: ['School', 'Inter', 'Diploma', 'Degree', 'Engineering', 'PG'],
    gives: 'Lists of hundreds of company (CSR), trust and foundation scholarships in one place',
    who: 'Any student. Make a free profile once and you get alerts for the scholarships that match you.',
    when: 'All year; most open between July and December',
    steps: [
      'Make a free profile with your class, course, marks, state, category and family income.',
      'Read each scholarship\'s rules and apply before the last date.',
      'Keep scanned copies of your marks memos, income certificate, Aadhaar, fee receipt and bank passbook ready.',
    ],
    links: [{ label: 'Buddy4Study', url: 'https://www.buddy4study.com' }, { label: 'Vidyasaarathi', url: 'https://www.vidyasaarathi.co.in' }],
    note: 'Applying for a scholarship is always free. Never pay anyone who promises a scholarship for a fee.',
  },
];
