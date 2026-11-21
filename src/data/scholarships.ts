// Guide to the main scholarships students in India can apply for (mainly Telangana and Andhra Pradesh).
// These are not live vacancies: each entry says who it is for, what it gives, when forms usually open and
// how to apply, with official links. Amounts and rules change, so every card asks people to check the official page.

export type SchScope = 'Central' | 'Telangana' | 'Andhra Pradesh' | 'Private' | 'Study abroad';
export type SchLevel = 'School' | 'Inter' | 'Diploma' | 'Degree' | 'Engineering' | 'Masters' | 'PhD' | 'Post-doc';
export const SCH_SCOPES: SchScope[] = ['Central', 'Telangana', 'Andhra Pradesh', 'Private', 'Study abroad'];
export const SCH_LEVELS: SchLevel[] = ['School', 'Inter', 'Diploma', 'Degree', 'Engineering', 'Masters', 'PhD', 'Post-doc'];

export interface ScholarshipGuide {
  id: string;
  title: string;
  scope: SchScope;
  /** For a state scheme listed under another scope (such as Telangana's overseas scholarships). */
  state?: 'Telangana' | 'Andhra Pradesh';
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
    levels: ['Inter', 'Diploma', 'Degree', 'Engineering', 'Masters', 'PhD'],
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
    levels: ['Degree', 'Engineering', 'Masters'],
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
    levels: ['Degree', 'Masters'],
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
    levels: ['Engineering', 'Degree', 'Masters'],
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
    levels: ['Inter', 'Diploma', 'Degree', 'Engineering', 'Masters'],
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
    levels: ['Diploma', 'Degree', 'Engineering', 'Masters'],
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
    levels: ['School', 'Inter', 'Diploma', 'Degree', 'Engineering', 'Masters'],
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
  // ---- Master's, PhD and post-doc in India ----
  {
    id: 'gate-pg', title: 'GATE and GPAT scholarship for M.Tech, M.E. and M.Pharm (AICTE)', scope: 'Central',
    levels: ['Engineering', 'Masters'],
    gives: '₹12,400 a month for up to 24 months during your M.Tech, M.E., M.Arch or M.Pharm',
    who: 'Students with a valid GATE or GPAT score admitted to a full-time master\'s course at an AICTE-approved college (including IITs, NITs and many private colleges)',
    when: 'After admission; your college registers you, usually September to December',
    steps: [
      'Write GATE (engineering) or GPAT (pharmacy) in your final year and get a valid score.',
      'Take admission through COAP, CCMT or your state counselling in a full-time AICTE-approved master\'s course.',
      'Submit your GATE or GPAT scorecard to the college; the college applies on the AICTE scholarship portal for you.',
    ],
    links: [{ label: 'GATE', url: 'https://gate2026.iitg.ac.in' }, { label: 'AICTE', url: 'https://www.aicte.gov.in' }], note: CHECK,
  },
  {
    id: 'ugc-pg', title: 'UGC postgraduate scholarships (single girl child, rank holders, SC/ST professional courses)', scope: 'Central',
    levels: ['Masters'],
    gives: 'A monthly scholarship during a two-year master\'s degree',
    who: 'Single girl children in a regular PG course; first and second rank holders of a university UG exam; SC and ST students in professional PG courses (such as M.Tech, MBA, M.Pharm)',
    when: 'Usually with the National Scholarship Portal cycle, July to November',
    steps: [
      'Join a regular, full-time master\'s degree at a recognised university or college.',
      'Apply on the National Scholarship Portal under the UGC schemes with your marks, admission proof and (for single girl child) an affidavit.',
      'Your institute verifies it; renew in the second year.',
    ],
    links: [NSP, { label: 'UGC', url: 'https://www.ugc.gov.in' }], note: CHECK,
  },
  {
    id: 'net-jrf', title: 'UGC-NET and CSIR-NET Junior Research Fellowship (JRF)', scope: 'Central',
    levels: ['Masters', 'PhD'],
    gives: '₹37,000 a month for the first two years of a PhD (JRF), then ₹42,000 a month (SRF), plus house rent allowance and a yearly contingency grant',
    who: 'Master\'s degree holders (or final-year students) with 55 percent or more (50 percent for SC, ST, OBC-NCL and PwD) who qualify for JRF in UGC-NET (humanities, social sciences, commerce) or CSIR-NET (sciences)',
    when: 'NET is held twice a year, usually June and December; forms open about two months earlier',
    steps: [
      'Apply for UGC-NET or CSIR-NET on the NTA website and choose JRF.',
      'Qualify for JRF in the exam (JRF is valid for three years).',
      'Join a PhD at a university or research institute; it starts your fellowship.',
    ],
    links: [{ label: 'UGC-NET (NTA)', url: 'https://ugcnet.nta.ac.in' }, { label: 'CSIR HRDG', url: 'https://csirhrdg.res.in' }], note: CHECK,
  },
  {
    id: 'inst-phd', title: 'Institute PhD fellowships at IITs, NITs, IISERs and IISc (GATE or NET)', scope: 'Central',
    levels: ['Engineering', 'Masters', 'PhD'],
    gives: 'Fellowship at JRF and SRF rates (₹37,000 then ₹42,000 a month) for the whole PhD, plus hostel and contingency grant',
    who: 'Master\'s graduates, and outstanding B.Tech graduates with a valid GATE score or NET qualification, admitted to a full-time PhD',
    when: 'Most institutes take PhD admissions twice a year, usually around March to May and October to November',
    steps: [
      'Get a valid GATE score or NET qualification.',
      'Apply for the PhD admission round on each institute\'s website.',
      'Clear the written test and interview; the fellowship starts when you join.',
    ],
    links: [{ label: 'GATE', url: 'https://gate2026.iitg.ac.in' }], note: CHECK,
  },
  {
    id: 'pmrf', title: 'Prime Minister\'s Research Fellowship (PMRF)', scope: 'Central',
    levels: ['Engineering', 'Masters', 'PhD'],
    gives: '₹70,000 a month in the first two years, ₹75,000 in the third and ₹80,000 in the fourth and fifth, plus a ₹2 lakh yearly research grant',
    who: 'Top students joining or doing a PhD at IITs, IISc, IISERs, NITs and other eligible institutes, usually with a high GATE score or CGPA',
    when: 'Usually two rounds a year (May and December)',
    steps: [
      'Get PhD admission at a PMRF-granting institute (through GATE or the institute\'s own process).',
      'Apply for PMRF through your institute; it forwards your application.',
      'Present your research proposal to the PMRF selection committee.',
    ],
    links: [{ label: 'PMRF', url: 'https://www.pmrf.in' }], note: CHECK,
  },
  {
    id: 'inspire-phd', title: 'DST INSPIRE Fellowship (PhD in science)', scope: 'Central',
    levels: ['Masters', 'PhD'],
    gives: 'PhD fellowship at JRF and SRF rates for up to five years, plus a yearly research grant',
    who: 'First rank holders in a master\'s in basic or applied sciences at their university, or INSPIRE-SHE scholars with 70 percent or more in their master\'s, who join a full-time PhD',
    when: 'Usually once a year; check the INSPIRE website',
    steps: [
      'Get a first rank in your M.Sc (or 70 percent or more as an INSPIRE scholar).',
      'Get PhD admission at a university or institute in India.',
      'Apply online on the INSPIRE website with your rank certificate and admission proof.',
    ],
    links: [{ label: 'INSPIRE (DST)', url: 'https://online-inspire.gov.in' }], note: CHECK,
  },
  {
    id: 'nf-sc-obc-st', title: 'National Fellowships for SC, OBC, ST and PwD scholars (PhD)', scope: 'Central',
    levels: ['Masters', 'PhD'],
    gives: 'Fellowship at JRF and SRF rates for up to five years of M.Phil or PhD, plus contingency and house rent allowance',
    who: 'SC (NFSC), OBC (NFOBC), ST (National Fellowship for ST) and disabled students (NFPwD) doing a full-time PhD; most are now selected through UGC-NET',
    when: 'Selected after the UGC-NET results, usually twice a year',
    steps: [
      'Apply for UGC-NET and select the fellowship scheme for your category on the form.',
      'Qualify in UGC-NET with a rank within the fellowship list.',
      'Join a PhD and submit joining reports through your university to start the fellowship.',
    ],
    links: [{ label: 'UGC-NET (NTA)', url: 'https://ugcnet.nta.ac.in' }, { label: 'Ministry of Tribal Affairs (ST)', url: 'https://tribal.nic.in' }], note: CHECK,
  },
  {
    id: 'icmr-dbt-icssr', title: 'ICMR, DBT and ICSSR research fellowships (medical, life sciences, social sciences)', scope: 'Central',
    levels: ['Masters', 'PhD'],
    gives: 'Fellowship at JRF and SRF rates for a PhD in medical and life sciences (ICMR, DBT) or social sciences (ICSSR doctoral fellowships)',
    who: 'Master\'s graduates who clear the ICMR-JRF exam or the DBT-JRF (BET) exam, or PhD scholars registered in social sciences (ICSSR)',
    when: 'ICMR-JRF and DBT-JRF exams usually once a year; ICSSR calls usually once a year',
    steps: [
      'Write the ICMR-JRF or DBT-JRF (BET) exam, or check the ICSSR doctoral fellowship call.',
      'Join a PhD at a recognised university or institute.',
      'Submit the award letter and joining report through your institute.',
    ],
    links: [{ label: 'ICMR', url: 'https://www.icmr.gov.in' }, { label: 'ICSSR', url: 'https://icssr.org' }], note: CHECK,
  },
  {
    id: 'postdoc-india', title: 'Post-doc fellowships in India (ANRF N-PDF, CSIR Research Associate)', scope: 'Central',
    levels: ['PhD', 'Post-doc'],
    gives: 'A monthly post-doctoral fellowship for two to three years plus a yearly research grant; CSIR Research Associates get ₹58,000 to ₹67,000 a month',
    who: 'PhD holders (or those who have submitted their thesis), usually under 35, with a host scientist at an Indian university or lab',
    when: 'ANRF N-PDF has calls about twice a year; CSIR Research Associateship usually has rolling or yearly calls',
    steps: [
      'Find a host scientist (mentor) at an Indian institute and agree on a research plan.',
      'Apply online on the ANRF portal (National Post-Doctoral Fellowship) or the CSIR HRDG website.',
      'Shortlisted candidates may be interviewed; the fellowship is paid through the host institute.',
    ],
    links: [{ label: 'ANRF (formerly SERB)', url: 'https://anrfonline.in' }, { label: 'CSIR HRDG', url: 'https://csirhrdg.res.in' }], note: CHECK,
  },
  {
    id: 'inspire-faculty', title: 'DST INSPIRE Faculty Fellowship', scope: 'Central',
    levels: ['Post-doc'],
    gives: '₹1.25 lakh a month and a research grant of ₹7 lakh a year for five years',
    who: 'Young researchers aged 27 to 32 with a PhD in science, engineering, mathematics, medicine or agriculture, including Indians doing a post-doc abroad who want to return',
    when: 'Usually once a year',
    steps: [
      'Get a strong publication record during your PhD or post-doc.',
      'Apply on the INSPIRE website with your research proposal and a host institute in India.',
      'Present to the selection committee if shortlisted.',
    ],
    links: [{ label: 'INSPIRE (DST)', url: 'https://online-inspire.gov.in' }], note: CHECK,
  },
  {
    id: 'india-alliance', title: 'DBT/Wellcome Trust India Alliance fellowships', scope: 'Private',
    levels: ['PhD', 'Post-doc'],
    gives: 'Funding for salary and research for early-career, intermediate and senior researchers in biomedical, clinical and public health research',
    who: 'Researchers with a PhD or medical degree who will work at an Indian institution',
    when: 'Usually one or two calls a year',
    steps: [
      'Choose the fellowship level that fits your experience.',
      'Find a host institution in India and prepare a research proposal.',
      'Apply online; shortlisted applicants are interviewed.',
    ],
    links: [{ label: 'India Alliance', url: 'https://www.indiaalliance.org' }], note: CHECK,
  },
  {
    id: 'industry-phd', title: 'Company PhD fellowships (Google PhD Fellowship, TCS Research Scholar Program)', scope: 'Private',
    levels: ['PhD'],
    gives: 'A stipend and research support for PhD students in computer science and related fields, often with a mentor from the company',
    who: 'PhD students in computer science, electrical engineering and related areas at Indian institutes',
    when: 'Usually once a year; your institute may need to nominate you',
    steps: [
      'Check each programme\'s call and whether your institute must nominate you.',
      'Prepare a research statement, CV and recommendation letters.',
      'Apply through the programme website or your institute before the deadline.',
    ],
    links: [{ label: 'Google PhD Fellowship', url: 'https://research.google/programs-and-events/phd-fellowship/' }, { label: 'TCS', url: 'https://www.tcs.com' }], note: CHECK,
  },

  // ---- Study abroad (open to students from anywhere in India) ----
  {
    id: 'abroad-nos', title: 'National Overseas Scholarship (Government of India)', scope: 'Study abroad',
    levels: ['Degree', 'Engineering', 'Masters', 'PhD'],
    gives: 'Tuition fees, living allowance, air fare, visa fee and medical insurance for a master\'s or PhD abroad (125 awards a year)',
    who: 'SC, denotified, nomadic and semi-nomadic tribe, landless agricultural labourer and traditional artisan category students with 60 percent or more in the qualifying degree, under 35 years of age, family income up to ₹8 lakh a year, and admission to a top-ranked university abroad. A separate National Overseas Scholarship is run for ST students by the Ministry of Tribal Affairs.',
    when: 'Usually opens once a year; check the portal from February to May',
    steps: [
      'Get an admission offer from a foreign university ranked within the top 500 in the QS world rankings.',
      'Apply on the National Overseas Scholarship portal with your degree marks, caste and income certificates and admission letter.',
      'Selected students get a sanction letter; the ministry pays fees and allowances through the Indian embassy.',
    ],
    links: [{ label: 'National Overseas Scholarship portal', url: 'https://nosmsje.gov.in' }, { label: 'Ministry of Tribal Affairs (for ST)', url: 'https://tribal.nic.in' }],
    note: CHECK,
  },
  {
    id: 'abroad-ts-overseas', title: 'Telangana overseas scholarships (Ambedkar, Jyothiba Phule and CM Overseas Vidya Nidhi)', scope: 'Study abroad', state: 'Telangana',
    levels: ['Degree', 'Engineering', 'Masters', 'PhD'],
    gives: 'Up to ₹20 lakh for a master\'s or PhD abroad, plus air fare',
    who: 'Telangana SC and ST students (Ambedkar Overseas Vidya Nidhi), BC and EBC students (Mahatma Jyothiba Phule Overseas Vidya Nidhi) and minority students (Chief Minister\'s Overseas Scholarship), with 60 percent or more in the degree, a GRE or GMAT and an IELTS or TOEFL score, admission abroad and family income up to ₹5 lakh a year',
    when: 'Usually twice a year (spring and fall intakes)',
    steps: [
      'Get admission to a university in a country listed in the scheme (such as the USA, UK, Canada, Australia, Germany, Singapore or New Zealand).',
      'Apply on Telangana ePASS under the overseas scholarship section with your degree, test scores, admission letter, passport and visa.',
      'Attend the selection and document check; the money is paid in instalments.',
    ],
    links: [{ label: 'Telangana ePASS', url: 'https://telanganaepass.cgg.gov.in' }], note: CHECK,
  },
  {
    id: 'abroad-fulbright', title: 'Fulbright-Nehru Master\'s Fellowships (USA)', scope: 'Study abroad',
    levels: ['Degree', 'Engineering'],
    gives: 'A fully funded master\'s in the USA: tuition, living costs, air fare and health cover',
    who: 'Indians with a bachelor\'s degree (four-year degree, or a master\'s or a three-year degree plus a postgraduate diploma) with at least 55 percent marks and at least three years of work experience in the chosen field, who plan to return to India',
    when: 'Usually opens in February; last date around May',
    steps: [
      'Choose a field the fellowship covers (such as arts, environment, economics, public health, management or urban planning).',
      'Apply online on the USIEF website with essays, recommendation letters and your degree marks.',
      'Shortlisted candidates are interviewed, then USIEF helps with US university admission.',
    ],
    links: [{ label: 'Fulbright-Nehru Master\'s Fellowships (USIEF)', url: 'https://usief.org.in/fulbright-fellowships/fellowships-for-indian-citizen/fulbright-nehru-masters-fellowships/' }], note: CHECK,
  },
  {
    id: 'abroad-chevening', title: 'Chevening Scholarships (UK)', scope: 'Study abroad',
    levels: ['Degree', 'Engineering'],
    gives: 'A fully funded one-year master\'s in the UK: tuition, living allowance, air fare and visa',
    who: 'Indian citizens with a bachelor\'s degree and at least 2,800 hours (about two years) of work experience, who will return to India for two years after the course',
    when: 'Usually August to early November, for courses starting the next September',
    steps: [
      'Pick three eligible one-year master\'s courses at UK universities.',
      'Apply on the Chevening website with four essays and references.',
      'Shortlisted candidates are interviewed at the British High Commission; you must get an unconditional university offer by the deadline.',
    ],
    links: [{ label: 'Chevening India', url: 'https://www.chevening.org/scholarship/india/' }], note: CHECK,
  },
  {
    id: 'abroad-commonwealth', title: 'Commonwealth Scholarships (UK)', scope: 'Study abroad',
    levels: ['Masters', 'Degree', 'Engineering', 'PhD'],
    gives: 'For a one-year taught master\'s in the UK: full tuition, return air fare and a monthly stipend of £1,712 (£2,000 in London). MBAs are not covered. Separate Commonwealth PhD scholarships also exist.',
    who: 'Indian citizens living in India with a first degree of at least UK upper second-class (2:1) standard, who could not afford to study in the UK without this scholarship and agree to return to India when their student visa ends. There is no age limit, and the commission does not ask for IELTS (your university may).',
    when: 'Usually August to October. The 2027-28 round closed on 20 October 2026, with results by July 2027.',
    steps: [
      'Watch for the nomination notice from the Ministry of Education (Department of Higher Education).',
      'Apply through the ministry and on the Commonwealth Scholarship Commission\'s online system.',
      'Shortlisted candidates are interviewed before final selection in the UK.',
    ],
    links: [
      { label: 'Commonwealth Master\'s Scholarships', url: 'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/' },
      { label: 'Ministry of Education (nominating agency)', url: 'https://www.education.gov.in/scholarships-education-loan-2' },
    ],
    note: CHECK,
  },
  {
    id: 'abroad-daad', title: 'DAAD scholarships (Germany)', scope: 'Study abroad',
    levels: ['Degree', 'Engineering', 'Masters', 'PhD'],
    gives: 'A monthly stipend, travel allowance and health insurance (current amounts are on the DAAD website); most public universities in Germany charge little or no tuition',
    who: 'Indian graduates for master\'s programmes (many development-related courses need two years of work experience) and postgraduates for PhD and research stays',
    when: 'Depends on the programme; many close between August and October',
    steps: [
      'Search the DAAD scholarship database for programmes open to Indian applicants.',
      'Prepare your degree certificates, CV, motivation letter, recommendation letters and English or German test scores.',
      'Apply through the DAAD portal or the university, as the programme says.',
    ],
    links: [{ label: 'DAAD India', url: 'https://www.daad.in' }], note: CHECK,
  },
  {
    id: 'abroad-erasmus', title: 'Erasmus Mundus Joint Master\'s scholarships (Europe)', scope: 'Study abroad',
    levels: ['Degree', 'Engineering'],
    gives: 'Full scholarship for a one- or two-year master\'s studied in two or more European countries: tuition, travel and a monthly allowance',
    who: 'Graduates from any country, including India; each programme sets its own subject and marks rules',
    when: 'Usually October to January, for courses starting the next September',
    steps: [
      'Browse the Erasmus Mundus catalogue and pick up to three programmes.',
      'Apply directly to each programme\'s consortium website with your documents.',
      'Selected students receive the scholarship along with admission.',
    ],
    links: [{ label: 'Erasmus Mundus Joint Master\'s (European Commission)', url: 'https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students/erasmus-mundus-joint-masters' }], note: CHECK,
  },
  {
    id: 'abroad-mext', title: 'MEXT Japanese Government Scholarship', scope: 'Study abroad',
    levels: ['Inter', 'Degree', 'Engineering', 'Masters', 'PhD'],
    gives: 'Full tuition, a monthly allowance and air fare to study in Japan (undergraduate, college of technology or research student)',
    who: 'Indian students who have finished Class 12 (for undergraduate study) or a degree (for research and master\'s study), within the age limits',
    when: 'Usually April to June, through the Embassy of Japan in India',
    steps: [
      'Watch the Embassy of Japan in India website for the MEXT notice.',
      'Apply with your marks, a study plan and recommendation letters.',
      'Write the screening tests and attend the interview at the embassy or consulate.',
    ],
    links: [{ label: 'Embassy of Japan in India', url: 'https://www.in.emb-japan.go.jp' }], note: CHECK,
  },
  {
    id: 'abroad-hungaricum', title: 'Stipendium Hungaricum (Hungary)', scope: 'Study abroad',
    levels: ['Inter', 'Degree', 'Engineering', 'Masters', 'PhD'],
    gives: 'Free tuition, a monthly stipend, a hostel place or housing allowance and medical insurance for bachelor\'s, master\'s or PhD study in Hungary',
    who: 'Indian students after Class 12 (bachelor\'s) or after a degree (master\'s and PhD); India nominates candidates through the Ministry of Education',
    when: 'Usually November to January',
    steps: [
      'Choose up to two courses on the Stipendium Hungaricum website.',
      'Apply online on the scholarship portal before the deadline.',
      'Apply for nomination through the Ministry of Education\'s scholarship portal when it opens; universities then hold entrance exams or interviews.',
    ],
    links: [{ label: 'Stipendium Hungaricum', url: 'https://stipendiumhungaricum.hu' }], note: CHECK,
  },
  {
    id: 'abroad-inlaks', title: 'Inlaks Shivdasani scholarships', scope: 'Study abroad',
    levels: ['Degree', 'Engineering', 'Masters'],
    gives: 'Up to about US$100,000 for tuition, living costs and travel at top universities in the USA, UK and Europe',
    who: 'Indians under 30 with a good degree from an Indian university, living in India, who already hold or are applying for admission at a top foreign university',
    when: 'Usually January to March',
    steps: [
      'Apply for admission at top universities abroad.',
      'Apply online on the Inlaks website with your degree, essays and references.',
      'Shortlisted candidates are interviewed in India.',
    ],
    links: [{ label: 'Inlaks Foundation', url: 'https://www.inlaksfoundation.org' }], note: CHECK,
  },
  {
    id: 'abroad-loan-scholarships', title: 'J.N. Tata Endowment and K.C. Mahindra loan scholarships', scope: 'Study abroad',
    levels: ['Degree', 'Engineering', 'Masters', 'PhD'],
    gives: 'Interest-free or low-cost loan scholarships (often a few lakh rupees) toward postgraduate study abroad, plus travel grants',
    who: 'Indian graduates with good marks who have admission or are applying for a master\'s or PhD abroad',
    when: 'J.N. Tata usually January to March; K.C. Mahindra usually March to April',
    steps: [
      'Apply online on each trust\'s website with marks, test scores and admission letters.',
      'Attend the interview if shortlisted.',
      'Repay the loan scholarship after the course, as the trust\'s rules say.',
    ],
    links: [{ label: 'J.N. Tata Endowment', url: 'https://www.jntataendowment.org' }, { label: 'K.C. Mahindra Education Trust', url: 'https://www.kcmet.org' }],
    note: CHECK,
  },
  {
    id: 'abroad-fulbright-research', title: 'Fulbright-Nehru Doctoral and Postdoctoral Research Fellowships (USA)', scope: 'Study abroad',
    levels: ['PhD', 'Post-doc'],
    gives: 'Funding for a research stay at a US university: monthly stipend, air fare, health cover and allowances',
    who: 'Doctoral: PhD students registered at an Indian institution. Postdoctoral: Indians who finished a PhD within the last four years.',
    when: 'Usually opens around May; last date around July',
    steps: [
      'Find a host researcher at a US university and get a letter of invitation.',
      'Apply on the USIEF website with your research proposal and references.',
      'Shortlisted candidates are interviewed.',
    ],
    links: [{ label: 'USIEF (Fulbright in India)', url: 'https://www.usief.org.in' }], note: CHECK,
  },
  {
    id: 'abroad-msca', title: 'Marie Skłodowska-Curie Actions (Europe): doctoral and post-doc', scope: 'Study abroad',
    levels: ['Masters', 'PhD', 'Post-doc'],
    gives: 'A full salary as a researcher in Europe, with social security and mobility allowances',
    who: 'Doctoral networks: master\'s graduates of any nationality, applying to advertised PhD positions. Postdoctoral fellowships: PhD holders with up to eight years of experience after the PhD, with a European host.',
    when: 'PhD positions are advertised all year; the post-doc call usually opens in spring and closes in September',
    steps: [
      'For a PhD, search the EURAXESS job portal for MSCA doctoral network positions and apply to each.',
      'For a post-doc, find a host supervisor in Europe and write a joint proposal.',
      'Submit through the EU Funding and Tenders portal before the deadline.',
    ],
    links: [{ label: 'MSCA (European Commission)', url: 'https://marie-sklodowska-curie-actions.ec.europa.eu' }, { label: 'EURAXESS jobs', url: 'https://euraxess.ec.europa.eu' }], note: CHECK,
  },
  {
    id: 'abroad-humboldt', title: 'Humboldt Research Fellowship (Germany)', scope: 'Study abroad',
    levels: ['Post-doc'],
    gives: 'A monthly fellowship for 6 to 24 months of research in Germany, plus family and travel allowances',
    who: 'Researchers from any country with a PhD completed within the last four years (post-doc) or up to twelve years (experienced researchers), with a host in Germany',
    when: 'Applications accepted all year',
    steps: [
      'Agree a research plan with a host at a German university or institute.',
      'Apply online with your proposal, publications and references.',
      'Selection committees meet several times a year.',
    ],
    links: [{ label: 'Alexander von Humboldt Foundation', url: 'https://www.humboldt-foundation.de' }], note: CHECK,
  },
  {
    id: 'abroad-jsps', title: 'JSPS Postdoctoral Fellowships (Japan)', scope: 'Study abroad',
    levels: ['Post-doc'],
    gives: 'A monthly stipend, air fare and research support for a post-doc in Japan',
    who: 'Researchers from any country with a PhD from the last six years, with a host researcher in Japan',
    when: 'Usually several rounds a year',
    steps: [
      'Find a host researcher in Japan; the host applies to JSPS on your behalf.',
      'Prepare your research plan and documents with the host.',
      'Wait for the JSPS selection result.',
    ],
    links: [{ label: 'JSPS', url: 'https://www.jsps.go.jp/english/' }], note: CHECK,
  },
  {
    id: 'abroad-swiss', title: 'Swiss Government Excellence Scholarships', scope: 'Study abroad',
    levels: ['Masters', 'PhD', 'Post-doc'],
    gives: 'A monthly stipend, tuition fee waiver and health insurance for PhD or post-doc research in Switzerland',
    who: 'Indian researchers with a master\'s degree (for PhD) or a PhD (for post-doc) and a host professor at a Swiss university',
    when: 'Usually August to November, through the Embassy of Switzerland in India',
    steps: [
      'Get a host professor at a Swiss university to support your research plan.',
      'Download the application for India from the Swiss government website.',
      'Submit through the Embassy of Switzerland in India before the deadline.',
    ],
    links: [{ label: 'Swiss Government Excellence Scholarships', url: 'https://www.sbfi.admin.ch/sbfi/en/home/education/scholarships-and-grants/swiss-government-excellence-scholarships.html' }], note: CHECK,
  },
  {
    id: 'abroad-eth-ssrf', title: 'ETH Zurich Student Summer Research Fellowship (Switzerland)', scope: 'Study abroad',
    levels: ['Engineering', 'Degree', 'Masters'],
    gives: 'Eight weeks of computer science research at ETH Zurich (2 July to 27 August 2027) with CHF 4,000 for housing and living, plus travel and visa costs paid back against receipts',
    who: 'Students from any country (except current ETH students) now enrolled in a bachelor\'s or master\'s in computer science or a close field such as electrical engineering, maths or physics, who will have finished two years of study by the start and expect to graduate in 2028 or later. Master\'s students meet the two-year rule automatically.',
    when: 'The 2027 round closes on 16 December 2026 at 13:00 Swiss time (5:30 PM IST). Results by the end of February 2027.',
    steps: [
      'Pick one or two research areas: machine learning, security, systems, robotics, programming languages and software engineering, bio and medical informatics, human-computer interaction, theory or visual computing.',
      'Prepare PDFs of a Europass CV, your official transcript with GPA and a one-page motivation letter.',
      'Apply on SiROP (the ETH application portal) before the deadline.',
    ],
    links: [
      { label: 'ETH Zurich: Summer Research Fellowship', url: 'https://inf.ethz.ch/studies/summer-research-fellowship.html' },
      { label: 'Apply on SiROP', url: 'https://sirop.org/app/1535d3bf-c2ef-4c74-8870-cb5bc17cb4da' },
    ],
    note: 'You do not need a completed degree: it is for students still studying. ' + CHECK,
  },
  {
    id: 'abroad-gates-rhodes', title: 'Gates Cambridge and Rhodes Scholarships (UK)', scope: 'Study abroad',
    levels: ['Degree', 'Engineering', 'Masters', 'PhD'],
    gives: 'Full cost of a master\'s or PhD at the University of Cambridge (Gates) or the University of Oxford (Rhodes): fees, living costs and travel',
    who: 'Outstanding Indian graduates; Rhodes India is for ages 19 to 25 (up to 27 for some), Gates Cambridge for anyone outside the UK applying to a full-time Cambridge course',
    when: 'Rhodes India usually June to August; Gates Cambridge with the Cambridge course deadline, usually October to December',
    steps: [
      'Choose a full-time master\'s or PhD course at Cambridge or Oxford.',
      'Apply to the course and the scholarship together (Gates) or on the Rhodes India portal.',
      'Shortlisted candidates are interviewed.',
    ],
    links: [{ label: 'Gates Cambridge', url: 'https://www.gatescambridge.org' }, { label: 'Rhodes Trust', url: 'https://www.rhodeshouse.ox.ac.uk' }], note: CHECK,
  },
];
