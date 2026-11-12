/**
 * Private jobs: the usual ways in for each qualification and sector, with how to apply.
 * Private companies hire all year, so there is no calendar month here. Every link is an
 * official portal or the company's own careers page; we never list a job we have not checked.
 * `quals` lists every qualification the route is open to (the Private tab filters on it).
 */

export type PrivQual = '10th' | 'ITI' | '12th' | 'Diploma' | 'Degree' | 'BTech';
export const PRIV_QUALS: PrivQual[] = ['10th', 'ITI', '12th', 'Diploma', 'Degree', 'BTech'];

export const PRIV_SECTORS = [
  'Job portals and job fairs', 'Apprenticeships and internships', 'IT and software', 'Customer support (BPO)',
  'Banking and finance', 'Retail and e-commerce', 'Delivery and logistics', 'Manufacturing and automobile',
  'Pharma and healthcare', 'Hotels and tourism', 'Skilled trades', 'Teaching', 'Accounts', 'Sales and marketing', 'Security services',
] as const;
export type PrivSector = (typeof PRIV_SECTORS)[number];

export interface PrivateRoute {
  id: string;
  title: string;
  sector: PrivSector;
  quals: PrivQual[];
  /** Typical first jobs. */
  roles: string;
  who: string;
  /** How people usually get selected. */
  selection: string;
  steps: string[];
  links: { label: string; url: string }[];
  note?: string;
  state?: 'Telangana' | 'Andhra Pradesh';
}

export const PRIVATE_JOBS: PrivateRoute[] = [
  // ---- Free portals and job fairs (all qualifications) ----
  {
    id: 'ncs', title: 'National Career Service (NCS) portal', sector: 'Job portals and job fairs',
    quals: ['10th', 'ITI', '12th', 'Diploma', 'Degree', 'BTech'],
    roles: 'Private company vacancies across India, from helpers and drivers to engineers, plus job fairs and free counselling',
    who: 'Anyone looking for work. Free for job seekers.',
    selection: 'Each employer runs its own interview or test',
    steps: [
      'Register on ncs.gov.in as a jobseeker with your mobile number and Aadhaar or other ID.',
      'Fill your education, skills and preferred locations; upload your resume.',
      'Search jobs by district and qualification and click "Apply". Watch the "Job fairs" section for events near you.',
      'Never pay anyone for a job. NCS and genuine employers do not charge job seekers.',
    ],
    links: [{ label: 'ncs.gov.in', url: 'https://www.ncs.gov.in' }],
  },
  {
    id: 'task-tg', title: 'TASK job fairs and skilling (Telangana)', sector: 'Job portals and job fairs', state: 'Telangana',
    quals: ['12th', 'Diploma', 'Degree', 'BTech'],
    roles: 'Campus drives and job fairs with IT, BPO, pharma and manufacturing companies in Hyderabad and the districts',
    who: 'Students and graduates of Telangana colleges',
    selection: 'Training programme, then company test and interview at the drive',
    steps: [
      'Check if your college is a TASK member college, or register on the TASK website as a student.',
      'Join the free or low-cost skilling programmes (communication, coding, domain skills).',
      'Watch the TASK site and your college placement cell for job drives and attend with your resume and certificates.',
    ],
    links: [{ label: 'task.telangana.gov.in', url: 'https://task.telangana.gov.in' }],
  },
  {
    id: 'apssdc', title: 'APSSDC job melas and skilling (Andhra Pradesh)', sector: 'Job portals and job fairs', state: 'Andhra Pradesh',
    quals: ['10th', 'ITI', '12th', 'Diploma', 'Degree', 'BTech'],
    roles: 'District job melas with private employers, from production and sales jobs to IT and pharma',
    who: 'Youth from Andhra Pradesh',
    selection: 'Interview on the spot at the job mela',
    steps: [
      'Register on the APSSDC website with your qualification and district.',
      'Check the "Job melas" list for dates near you; carry your resume, certificate copies and ID.',
      'Join APSSDC skill courses if the employer asks for a skill you do not have yet.',
    ],
    links: [{ label: 'apssdc.in', url: 'https://www.apssdc.in' }],
  },

  // ---- Apprenticeships and internships ----
  {
    id: 'naps', title: 'Apprenticeship with a stipend (NAPS)', sector: 'Apprenticeships and internships',
    quals: ['10th', 'ITI', '12th', 'Diploma', 'Degree'],
    roles: 'Trade apprentice in factories, automobile plants, hospitals, hotels, retail and offices. Many apprentices are later hired permanently.',
    who: 'Age 14 and above (18 and above for hazardous trades). ITI, 10th, 12th, diploma or degree depending on the trade.',
    selection: 'Company shortlists from the portal; interview or test',
    steps: [
      'Register as a candidate on apprenticeshipindia.gov.in with Aadhaar, bank account and education details.',
      'Search "Apprenticeship opportunities" by state, trade and company and apply.',
      'If selected, sign the apprenticeship contract online. You get a monthly stipend; part of it is paid by the government.',
      'At the end, take the assessment to get the National Apprenticeship Certificate, which employers value.',
    ],
    links: [{ label: 'apprenticeshipindia.gov.in', url: 'https://www.apprenticeshipindia.gov.in' }],
  },
  {
    id: 'nats', title: 'Graduate and diploma apprenticeship (NATS)', sector: 'Apprenticeships and internships',
    quals: ['Diploma', 'Degree', 'BTech'],
    roles: 'One-year paid training in companies and PSUs: engineering, pharma, IT, banking and general graduate roles',
    who: 'Diploma holders and graduates (engineering and general streams), usually within a few years of passing',
    selection: 'Company shortlist, sometimes a test or interview',
    steps: [
      'Enrol on nats.education.gov.in with your final certificate details.',
      'Wait for your enrolment to be approved (it gets an enrolment number).',
      'Apply to establishments that post vacancies; accept the offer and sign the contract online.',
      'You receive a monthly stipend and a proficiency certificate at the end.',
    ],
    links: [{ label: 'nats.education.gov.in', url: 'https://nats.education.gov.in' }],
  },
  {
    id: 'pm-internship', title: 'PM Internship Scheme (top companies)', sector: 'Apprenticeships and internships',
    quals: ['10th', 'ITI', '12th', 'Diploma', 'Degree'],
    roles: '12-month internships in large companies across sectors, with a monthly allowance',
    who: 'Age 21 to 24, not in full-time study or a full-time job. Some groups are excluded (for example IIT/IIM graduates and families with an income-tax payer or government employee), so check the rules.',
    selection: 'Companies shortlist from the portal; offers are made online',
    steps: [
      'Register on pminternship.mca.gov.in using Aadhaar-based e-KYC.',
      'Build your profile and choose up to the allowed number of internships by location and sector.',
      'Accept an offer if you get one; the allowance is paid to your Aadhaar-linked bank account.',
    ],
    links: [{ label: 'pminternship.mca.gov.in', url: 'https://pminternship.mca.gov.in' }],
    note: 'Rules and rounds change; confirm the current eligibility on the portal.',
  },
  {
    id: 'aicte-intern', title: 'Internships for college students', sector: 'Apprenticeships and internships',
    quals: ['Diploma', 'Degree', 'BTech'],
    roles: 'Short internships (often 1 to 6 months) in startups and companies; many are online',
    who: 'Students currently in diploma, degree or engineering courses',
    selection: 'Application, sometimes a small assignment, then a short interview',
    steps: [
      'Register as a student on the AICTE internship portal (internship.aicte-india.org).',
      'Filter by skill, city, work-from-home and stipend, and apply with a short note on why you fit.',
      'Finish the work and ask for a certificate and a recommendation; it helps in placements.',
    ],
    links: [{ label: 'internship.aicte-india.org', url: 'https://internship.aicte-india.org' }],
  },

  // ---- IT ----
  {
    id: 'it-freshers', title: 'IT services companies: fresher hiring', sector: 'IT and software',
    quals: ['Degree', 'BTech'],
    roles: 'Software engineer trainee, systems engineer, testing, support. B.Tech, MCA, B.Sc and BCA are commonly considered.',
    who: 'Fresh graduates, usually with a minimum percentage (often around 60%) and no pending backlogs at joining',
    selection: 'Online aptitude and coding test, then technical and HR interviews',
    steps: [
      'Practise aptitude (maths, reasoning, English) and one programming language such as Python, Java or C#.',
      'Register on the company careers sites, for example TCS (the TCS National Qualifier Test), Infosys and Wipro.',
      'Take the online test when invited, then technical and HR interviews.',
      'Joining comes with company training; keep your mark sheets and ID ready for verification.',
    ],
    links: [
      { label: 'TCS careers', url: 'https://www.tcs.com/careers' },
      { label: 'Infosys careers', url: 'https://www.infosys.com/careers/' },
      { label: 'Wipro careers', url: 'https://careers.wipro.com' },
    ],
    note: 'Learn programming for free or cheaply: dotnetbrief.com for .NET and SQL.',
  },
  {
    id: 'hcl-techbee', title: 'Work in IT straight after 12th (HCLTech TechBee)', sector: 'IT and software',
    quals: ['12th'],
    roles: 'Paid training, then a full-time IT job, with an option to study a degree alongside',
    who: 'Students who passed 12th recently, usually with Maths and a minimum percentage',
    selection: 'Online test, interview, then training',
    steps: [
      'Check the eligibility for your year of passing on the TechBee page.',
      'Register online and take the career aptitude test.',
      'Clear the interview, complete the training and join as a full-time employee.',
    ],
    links: [{ label: 'HCLTech TechBee', url: 'https://www.hcltechbee.com' }],
  },

  // ---- BPO ----
  {
    id: 'bpo', title: 'Customer support and back office (BPO)', sector: 'Customer support (BPO)',
    quals: ['12th', 'Degree', 'BTech'],
    roles: 'Voice or chat support, email support, data entry, back-office processing. Telugu, Hindi and English speakers are in demand.',
    who: '12th pass or graduates with good spoken and written communication. Night shifts are common.',
    selection: 'Walk-in or online application, communication test, typing test, HR interview',
    steps: [
      'Improve spoken English and typing speed; practise answering common customer questions.',
      'Apply through NCS, TASK or APSSDC drives, or company careers pages; watch for walk-in interviews in Hyderabad and Visakhapatnam.',
      'Clear the voice/communication round and the HR round, then the background check.',
    ],
    links: [{ label: 'ncs.gov.in', url: 'https://www.ncs.gov.in' }],
  },

  // ---- Banking and finance ----
  {
    id: 'bfsi', title: 'Private banks, NBFCs and insurance', sector: 'Banking and finance',
    quals: ['12th', 'Degree'],
    roles: 'Sales officer, relationship officer, branch operations, collections, loan processing, insurance advisor',
    who: 'Mostly graduates (any stream; B.Com and BBA are a plus). Some field roles take 12th pass.',
    selection: 'Online application or campus drive, aptitude test, interviews',
    steps: [
      'Apply on the careers page of the bank or company, or through campus drives.',
      'For mutual fund or securities roles, clear the relevant NISM certificate exam; for insurance, the agent exam.',
      'Prepare for aptitude and an interview about customers, sales and basic banking.',
    ],
    links: [{ label: 'NISM certifications', url: 'https://www.nism.ac.in' }, { label: 'ncs.gov.in', url: 'https://www.ncs.gov.in' }],
  },

  // ---- Retail, delivery ----
  {
    id: 'retail', title: 'Retail stores and e-commerce warehouses', sector: 'Retail and e-commerce',
    quals: ['10th', '12th', 'Degree'],
    roles: 'Store associate, cashier, warehouse associate, picker/packer, inventory, team leader later',
    who: '10th or 12th pass, age 18 and above. Shift work.',
    selection: 'Walk-in or online application, short interview',
    steps: [
      'Apply on company careers pages (for example amazon.jobs for warehouse roles) or visit the store or warehouse for walk-ins.',
      'Keep Aadhaar, PAN and bank details ready; jobs are often through a staffing agency at first.',
      'Ask whether the job has PF and ESI. Genuine employers never ask you to pay a fee.',
    ],
    links: [{ label: 'amazon.jobs', url: 'https://www.amazon.jobs' }, { label: 'ncs.gov.in', url: 'https://www.ncs.gov.in' }],
  },
  {
    id: 'delivery', title: 'Delivery partner (food, grocery, parcels)', sector: 'Delivery and logistics',
    quals: ['10th', 'ITI', '12th', 'Diploma', 'Degree'],
    roles: 'Bike delivery partner, courier, logistics assistant. Flexible hours; pay is per order.',
    who: 'Age 18 and above with a smartphone; a two-wheeler and driving licence for bike delivery',
    selection: 'Online sign-up in the company app, document check and a short training',
    steps: [
      'Download the partner app of the delivery company and sign up with Aadhaar, PAN, licence and bank account.',
      'Complete the online training and collect any kit.',
      'Register on e-Shram (eshram.gov.in) as a gig worker so you can get government welfare benefits.',
    ],
    links: [{ label: 'e-Shram', url: 'https://eshram.gov.in' }],
  },

  // ---- Manufacturing ----
  {
    id: 'mfg', title: 'Factories and automobile plants', sector: 'Manufacturing and automobile',
    quals: ['10th', 'ITI', 'Diploma', 'BTech'],
    roles: 'Machine operator, fitter, electrician, welder, quality inspector, production supervisor (diploma), graduate engineer trainee (B.Tech)',
    who: 'ITI and diploma holders are preferred; B.Tech for engineer trainee roles',
    selection: 'Written test on trade basics, practical test, interview, medical',
    steps: [
      'The most common entry is an apprenticeship; apply on apprenticeshipindia.gov.in (ITI/10th) or nats.education.gov.in (diploma/B.Tech).',
      'Look for companies in industrial areas near you: Sri City and Visakhapatnam in Andhra Pradesh, and Hyderabad, Medchal and Zaheerabad in Telangana.',
      'Carry your trade certificate, marks memos and ID to the interview; expect a practical test.',
    ],
    links: [{ label: 'apprenticeshipindia.gov.in', url: 'https://www.apprenticeshipindia.gov.in' }, { label: 'nats.education.gov.in', url: 'https://nats.education.gov.in' }],
  },
  {
    id: 'core-eng', title: 'Core engineering companies (B.Tech)', sector: 'Manufacturing and automobile',
    quals: ['BTech'],
    roles: 'Graduate engineer trainee (GET) in construction, power, electrical, mechanical and chemical companies',
    who: 'B.Tech/B.E. graduates in the matching branch, often with a minimum percentage',
    selection: 'Campus drive or online test, technical interview, HR interview',
    steps: [
      'Use your college placement cell; core companies hire mostly through campus drives.',
      'Off campus, register on the company careers pages and on NATS for a one-year paid apprenticeship.',
      'A good GATE score also opens PSU jobs; see the Government tab.',
    ],
    links: [{ label: 'nats.education.gov.in', url: 'https://nats.education.gov.in' }],
  },

  // ---- Pharma and healthcare ----
  {
    id: 'pharma', title: 'Pharma and bulk drug companies', sector: 'Pharma and healthcare',
    quals: ['ITI', 'Diploma', 'Degree'],
    roles: 'Production chemist, quality control (QC) and quality assurance (QA) analyst, machine operator, packing, warehouse',
    who: 'B.Pharm, M.Pharm, B.Sc or M.Sc (chemistry), D.Pharm, or ITI for operator roles',
    selection: 'Walk-in interview or online application, technical interview',
    steps: [
      'Hyderabad and the pharma clusters around it, and Visakhapatnam in Andhra Pradesh, have many plants.',
      'Watch for "walk-in drives" announced by pharma companies, and apply on their careers pages.',
      'Learn GMP (good manufacturing practice) basics; interviews often ask about it.',
    ],
    links: [{ label: 'ncs.gov.in', url: 'https://www.ncs.gov.in' }],
  },
  {
    id: 'health', title: 'Private hospitals, labs and pharmacies', sector: 'Pharma and healthcare',
    quals: ['12th', 'Diploma', 'Degree'],
    roles: 'Staff nurse, lab technician, pharmacist, radiology technician, front office, medical coding (for B.Sc/B.Pharm)',
    who: 'GNM or B.Sc Nursing, DMLT/BMLT, D.Pharm/B.Pharm, or other paramedical courses',
    selection: 'Application to the hospital, interview, sometimes a skills test',
    steps: [
      'Register with your state council where needed (nursing council for nurses, pharmacy council for pharmacists).',
      'Apply directly to hospitals, diagnostic labs and pharmacy chains, or through NCS.',
      'Keep your registration certificate and course certificates ready for verification.',
    ],
    links: [{ label: 'ncs.gov.in', url: 'https://www.ncs.gov.in' }],
  },

  // ---- Hotels ----
  {
    id: 'hotels', title: 'Hotels, restaurants and travel', sector: 'Hotels and tourism',
    quals: ['10th', '12th', 'Diploma', 'Degree'],
    roles: 'Kitchen and food service, front office, housekeeping, travel desk; chef and manager roles after a hotel management course',
    who: '10th or 12th pass for entry jobs; a hotel management diploma or degree for faster growth',
    selection: 'Interview and trial work',
    steps: [
      'For a career, consider a hotel management course (the NCHMCT JEE admits to government institutes).',
      'Apply directly to hotels and restaurant chains, or through NCS and job fairs.',
      'Apprenticeships in hotels are also listed on apprenticeshipindia.gov.in.',
    ],
    links: [{ label: 'NCHM (courses)', url: 'https://nchm.gov.in' }, { label: 'apprenticeshipindia.gov.in', url: 'https://www.apprenticeshipindia.gov.in' }],
  },

  // ---- Skilled trades ----
  {
    id: 'trades', title: 'Electrician, plumber, AC and mobile repair', sector: 'Skilled trades',
    quals: ['10th', 'ITI', 'Diploma'],
    roles: 'Technician with a contractor or service company, or your own work through home-services apps',
    who: 'ITI in the trade, or a short certified skill course',
    selection: 'Skills test by the company or app',
    steps: [
      'Get certified: an ITI trade, or a free Skill India course (find centres on skillindiadigital.gov.in).',
      'For electrical work, get the state electrical licence or supervisor certificate where required.',
      'Join a service company or a home-services app as a partner, or work with local contractors.',
    ],
    links: [{ label: 'Skill India Digital', url: 'https://www.skillindiadigital.gov.in' }],
  },

  // ---- Teaching, accounts, sales, security ----
  {
    id: 'teaching', title: 'Teacher in private schools and coaching centres', sector: 'Teaching',
    quals: ['Degree', 'BTech'],
    roles: 'Primary teacher, subject teacher, coaching faculty, online tutor',
    who: 'A degree; B.Ed (or D.El.Ed for primary) and a TET pass are expected by good schools',
    selection: 'Demo class and interview',
    steps: [
      'Complete B.Ed or D.El.Ed; clear the state TET or CTET (see the Government tab for dates).',
      'Apply to schools directly or through school job portals; prepare a 10-minute demo lesson.',
      'Online tutoring platforms are a flexible way to start.',
    ],
    links: [{ label: 'CTET', url: 'https://ctet.nic.in' }],
  },
  {
    id: 'accounts', title: 'Accounts, GST and CA articleship', sector: 'Accounts',
    quals: ['12th', 'Degree'],
    roles: 'Accounts assistant, GST and tax assistant, audit assistant, CA articled assistant',
    who: 'Commerce students; B.Com graduates. Tally and Excel skills help a lot.',
    selection: 'Interview and a short accounting test',
    steps: [
      'Learn Tally, Excel and GST filing basics (short courses are widely available).',
      'Apply to CA firms, tax consultants and company accounts teams.',
      'To become a Chartered Accountant, register with ICAI; the course includes paid articleship at a CA firm.',
    ],
    links: [{ label: 'ICAI', url: 'https://www.icai.org' }],
  },
  {
    id: 'sales', title: 'Sales and marketing', sector: 'Sales and marketing',
    quals: ['12th', 'Diploma', 'Degree', 'BTech'],
    roles: 'Field sales executive, telesales, medical representative (B.Pharm/B.Sc), digital marketing assistant',
    who: '12th pass or graduates who like talking to people; a two-wheeler helps for field roles',
    selection: 'Interview, sometimes a role-play',
    steps: [
      'Apply through NCS, job fairs and company careers pages.',
      'For digital marketing, build a small portfolio (a page or campaign you ran) before applying.',
      'Ask how incentives are calculated and whether travel is paid.',
    ],
    links: [{ label: 'ncs.gov.in', url: 'https://www.ncs.gov.in' }],
  },
  {
    id: 'security', title: 'Security guard and facility services', sector: 'Security services',
    quals: ['10th', '12th'],
    roles: 'Security guard, supervisor, housekeeping and facility staff in offices, malls and apartments',
    who: '10th pass or more, physically fit; ex-servicemen are preferred for supervisor roles',
    selection: 'Interview, police verification, short training',
    steps: [
      'Apply to licensed private security agencies (licensed under the PSARA law) in your city.',
      'Complete the training and police verification.',
      'Check that you get PF, ESI and a payslip.',
    ],
    links: [{ label: 'ncs.gov.in', url: 'https://www.ncs.gov.in' }],
  },
];
