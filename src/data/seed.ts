import type { Opportunity, Pathway } from './types';
import { SEED_JOBS } from './seed-jobs';

/**
 * SAMPLE DATA — FOR DEVELOPMENT AND DEMO ONLY.
 *
 * Every entry below is illustrative. Names point at real programme families and the
 * source links go to official portal home pages, but amounts, dates, limits and
 * criteria are placeholders that have NOT been checked against any notification.
 * All entries start as `draft` / `in-review` with `sample: true` and must go through
 * the admin verification workflow (with a real notification link) before publication.
 */
const BASE: Opportunity[] = [
  // ── Scholarships ────────────────────────────────────────────
  {
    id: 'sch-central-postmatric', kind: 'scholarship', scope: 'Central', sample: true, status: 'in-review',
    title: 'Central post-matric scholarship (sample entry)',
    provider: 'National Scholarship Portal',
    summary: 'Illustrative entry for a centrally funded post-matric scholarship for students from lower-income families studying after Class 10.',
    amount: 'Placeholder: tuition + maintenance allowance',
    criteria: { studyingAt: ['inter', 'diploma', 'ug', 'pg'], maxIncome: 250000, categories: ['SC', 'ST', 'OBC'],
      manualChecks: ['Admission in a recognised institution', 'Not receiving another government scholarship'] },
    documents: ['Income certificate', 'Caste certificate', 'Previous marks memo', 'Aadhaar', 'Bank passbook'],
    deadline: '2026-12-31', source: { url: 'https://scholarships.gov.in', label: 'National Scholarship Portal' }, tags: ['income', 'category'],
  },
  {
    id: 'sch-ts-epass', kind: 'scholarship', scope: 'State', sample: true, status: 'draft',
    title: 'Telangana post-matric scholarship – ePASS (sample entry)',
    provider: 'Government of Telangana',
    summary: 'Illustrative entry for Telangana state post-matric fee reimbursement and scholarship.',
    amount: 'Placeholder: fee reimbursement as per course',
    criteria: { studyingAt: ['inter', 'diploma', 'ug', 'pg'], states: ['Telangana'], maxIncome: 200000,
      manualChecks: ['Attendance and renewal conditions'] },
    documents: ['Income certificate', 'Caste certificate', 'Bonafide certificate', 'Aadhaar'],
    deadline: '2026-12-15', source: { url: 'https://telanganaepass.cgg.gov.in', label: 'Telangana ePASS portal' }, tags: ['state', 'fee reimbursement'],
  },
  {
    id: 'sch-ap-jvd', kind: 'scholarship', scope: 'State', sample: true, status: 'draft',
    title: 'Andhra Pradesh education fee support (sample entry)',
    provider: 'Government of Andhra Pradesh',
    summary: 'Illustrative entry for AP state fee support for students in higher education.',
    amount: 'Placeholder: full fee reimbursement',
    criteria: { studyingAt: ['diploma', 'ug', 'pg'], states: ['Andhra Pradesh'], maxIncome: 250000, minPercentage: 0,
      manualChecks: ['Minimum attendance requirement'] },
    deadline: '2027-01-20', source: { url: 'https://jnanabhumi.ap.gov.in', label: 'AP Jnanabhumi portal' }, tags: ['state'],
  },
  {
    id: 'sch-merit-girls', kind: 'scholarship', scope: 'Private', sample: true, status: 'draft',
    title: 'Foundation merit scholarship for girls in STEM (sample entry)',
    provider: 'Example Foundation (placeholder)',
    summary: 'Illustrative private foundation scholarship for girl students in science and engineering degrees.',
    amount: 'Placeholder: ₹50,000 per year',
    criteria: { studyingAt: ['ug'], genders: ['female'], minPercentage: 75, maxIncome: 600000, streams: ['Engineering', 'Science', 'MPC', 'BiPC'] },
    deadline: '2026-11-30', source: { url: 'https://scholarships.gov.in', label: 'Placeholder source – replace with foundation page' }, tags: ['merit', 'girls', 'STEM'],
  },
  {
    id: 'sch-expired-demo', kind: 'scholarship', scope: 'Central', sample: true, status: 'in-review',
    title: 'Pre-matric scholarship, last cycle (sample entry, expired)',
    provider: 'National Scholarship Portal',
    summary: 'Illustrative expired entry, kept to show how closed opportunities are labelled.',
    criteria: { studyingAt: ['class8', 'class10'], maxIncome: 250000 },
    deadline: '2026-10-15', source: { url: 'https://scholarships.gov.in', label: 'National Scholarship Portal' }, tags: ['school'],
  },

  // ── Government jobs ─────────────────────────────────────────
  {
    id: 'job-upsc-cse', sector: 'UPSC', location: 'All India', vacancies: 'Placeholder', kind: 'govt-job', scope: 'Central', sample: true, status: 'in-review',
    title: 'UPSC Civil Services Examination (sample entry)',
    provider: 'Union Public Service Commission',
    summary: 'Illustrative entry for the civil services exam (IAS, IPS, IFS and allied services).',
    selection: 'Prelims → Mains → Personality test', salary: 'Placeholder: as per pay level',
    criteria: { minLevel: 'ug', allowPursuing: true, minAge: 21, maxAge: 32, ageRelaxation: { OBC: 3, SC: 5, ST: 5 },
      manualChecks: ['Number of attempts used'] },
    deadline: '2027-02-18', source: { url: 'https://upsc.gov.in', label: 'UPSC official website' }, tags: ['UPSC', 'civil services'],
  },
  {
    id: 'job-ssc-cgl', sector: 'SSC', location: 'All India', kind: 'govt-job', scope: 'Central', sample: true, status: 'draft',
    title: 'SSC Combined Graduate Level (sample entry)',
    provider: 'Staff Selection Commission',
    summary: 'Illustrative entry for Group B and C posts in central ministries and departments.',
    selection: 'Tier 1 → Tier 2 → Document verification', salary: 'Placeholder: pay level 4–7',
    criteria: { minLevel: 'ug', minAge: 18, maxAge: 32, ageRelaxation: { OBC: 3, SC: 5, ST: 5 } },
    deadline: '2027-01-10', source: { url: 'https://ssc.gov.in', label: 'SSC official website' }, tags: ['SSC'],
  },
  {
    id: 'job-ssc-chsl', sector: 'SSC', location: 'All India', kind: 'govt-job', scope: 'Central', sample: true, status: 'draft',
    title: 'SSC CHSL – 12th level posts (sample entry)',
    provider: 'Staff Selection Commission',
    summary: 'Illustrative entry for clerk and data-entry posts open after Intermediate.',
    selection: 'Tier 1 → Tier 2 (skill/typing test)', salary: 'Placeholder: pay level 2–4',
    criteria: { minLevel: 'inter', minAge: 18, maxAge: 27, ageRelaxation: { OBC: 3, SC: 5, ST: 5 } },
    deadline: '2026-12-05', source: { url: 'https://ssc.gov.in', label: 'SSC official website' }, tags: ['SSC', '12th pass'],
  },
  {
    id: 'job-rrb-ntpc', sector: 'Railways', location: 'All India (zone-wise)', kind: 'govt-job', scope: 'Central', sample: true, status: 'draft',
    title: 'Railway non-technical posts (sample entry)',
    provider: 'Railway Recruitment Boards',
    summary: 'Illustrative entry for railway clerical, commercial and station posts.',
    selection: 'CBT 1 → CBT 2 → Skill test → Medical', salary: 'Placeholder',
    criteria: { minLevel: 'inter', minAge: 18, maxAge: 33, ageRelaxation: { OBC: 3, SC: 5, ST: 5 } },
    deadline: '2026-12-20', source: { url: 'https://indianrailways.gov.in', label: 'Indian Railways' }, tags: ['railways'],
  },
  {
    id: 'job-tspsc-group', sector: 'State PSC', location: 'Telangana', kind: 'govt-job', scope: 'State', sample: true, status: 'draft',
    title: 'Telangana state services recruitment (sample entry)',
    provider: 'Telangana State Public Service Commission',
    summary: 'Illustrative entry for state group services posts in Telangana.',
    criteria: { minLevel: 'ug', minAge: 18, maxAge: 44, states: ['Telangana'], ageRelaxation: { OBC: 5, SC: 5, ST: 5 },
      manualChecks: ['Local / non-local status rules'] },
    deadline: '2027-01-31', source: { url: 'https://www.tspsc.gov.in', label: 'TSPSC official website' }, tags: ['state PSC'],
  },
  {
    id: 'job-apprentice', sector: 'Apprenticeship', location: 'Across India', kind: 'govt-job', scope: 'Central', sample: true, status: 'draft',
    title: 'Apprenticeship for ITI / Diploma holders (sample entry)',
    provider: 'Apprenticeship portal',
    summary: 'Illustrative entry for paid apprenticeship training in PSUs and industries.',
    salary: 'Placeholder: monthly stipend',
    criteria: { minLevel: 'class10', minAge: 14, maxAge: 25, manualChecks: ['Trade / branch specified in the notice'] },
    deadline: '2026-12-10', source: { url: 'https://www.apprenticeshipindia.gov.in', label: 'Apprenticeship India portal' }, tags: ['apprenticeship'],
  },

  // ── Private jobs & internships ──────────────────────────────
  {
    id: 'pvt-software-fresher', sector: 'IT & Software', location: 'Hyderabad', workMode: 'hybrid', experience: 'Fresher', kind: 'private-job', scope: 'Private', sample: true, status: 'draft',
    title: 'Graduate software engineer – fresher (sample entry)',
    provider: 'Example IT company (placeholder)',
    summary: 'Illustrative fresher role for engineering and science graduates. Hybrid, Hyderabad.',
    salary: 'Placeholder', selection: 'Online test → Technical interview → HR',
    criteria: { minLevel: 'ug', allowPursuing: true, streams: ['Engineering', 'Science'], minPercentage: 60 },
    deadline: '2026-12-01', source: { url: 'https://www.ncs.gov.in', label: 'Placeholder – replace with employer posting' }, tags: ['IT', 'fresher', 'Hyderabad'],
  },
  {
    id: 'int-data-wfh', sector: 'IT & Software', location: 'Remote', workMode: 'remote', experience: 'Students', kind: 'internship', scope: 'Private', sample: true, status: 'draft',
    title: 'Data analysis internship – work from home (sample entry)',
    provider: 'Example startup (placeholder)',
    summary: 'Illustrative 3-month remote internship for students who know spreadsheets or Python.',
    salary: 'Placeholder stipend',
    criteria: { minLevel: 'inter', manualChecks: ['Basic Excel or Python skills'] },
    deadline: '2026-11-25', source: { url: 'https://internship.aicte-india.org', label: 'Placeholder – AICTE internship portal' }, tags: ['remote', 'data'],
  },

  // ── Entrance exams ──────────────────────────────────────────
  {
    id: 'exam-jee-main', kind: 'exam', scope: 'Central', sample: true, status: 'in-review',
    title: 'JEE Main (sample entry)',
    provider: 'National Testing Agency',
    summary: 'Illustrative entry for the national engineering entrance exam (NITs, IIITs, and JEE Advanced qualifying).',
    criteria: { minLevel: 'inter', allowPursuing: true, streams: ['MPC'] },
    deadline: '2026-12-02', source: { url: 'https://jeemain.nta.nic.in', label: 'JEE Main – NTA' }, tags: ['engineering'],
  },
  {
    id: 'exam-neet-ug', kind: 'exam', scope: 'Central', sample: true, status: 'in-review',
    title: 'NEET UG (sample entry)',
    provider: 'National Testing Agency',
    summary: 'Illustrative entry for the national medical entrance exam (MBBS, BDS, AYUSH).',
    criteria: { minLevel: 'inter', allowPursuing: true, streams: ['BiPC'], minAge: 17 },
    deadline: '2027-03-07', source: { url: 'https://neet.nta.nic.in', label: 'NEET – NTA' }, tags: ['medical'],
  },
  {
    id: 'exam-eapcet', kind: 'exam', scope: 'State', sample: true, status: 'draft',
    title: 'TS / AP EAPCET (sample entry)',
    provider: 'State higher education councils',
    summary: 'Illustrative entry for state engineering, agriculture and pharmacy entrance exams in Telangana and Andhra Pradesh.',
    criteria: { minLevel: 'inter', allowPursuing: true, streams: ['MPC', 'BiPC'], states: ['Telangana', 'Andhra Pradesh'],
      manualChecks: ['Local area status'] },
    deadline: '2027-04-15', source: { url: 'https://tsche.ac.in', label: 'Telangana State Council of Higher Education' }, tags: ['engineering', 'pharmacy'],
  },
  {
    id: 'exam-cuet', kind: 'exam', scope: 'Central', sample: true, status: 'draft',
    title: 'CUET UG (sample entry)',
    provider: 'National Testing Agency',
    summary: 'Illustrative entry for central university undergraduate admissions, open to all streams.',
    criteria: { minLevel: 'inter', allowPursuing: true },
    deadline: '2027-03-20', source: { url: 'https://cuet.nta.nic.in', label: 'CUET – NTA' }, tags: ['all streams'],
  },
  {
    id: 'exam-gate', kind: 'exam', scope: 'Central', sample: true, status: 'draft',
    title: 'GATE (sample entry)',
    provider: 'IITs / IISc',
    summary: 'Illustrative entry for postgraduate engineering admissions and PSU recruitment.',
    criteria: { minLevel: 'ug', allowPursuing: true, streams: ['Engineering', 'Science'] },
    deadline: '2026-10-10', source: { url: 'https://gate2026.iitg.ac.in', label: 'Placeholder – replace with current GATE site' }, tags: ['PG', 'PSU'],
  },

  // ── Skills & study abroad ───────────────────────────────────
  {
    id: 'skill-pmkvy', kind: 'skill', scope: 'Central', sample: true, status: 'draft',
    title: 'Government skill training programme (sample entry)',
    provider: 'Skill India',
    summary: 'Illustrative entry for free short-term skill training with certification.',
    criteria: { minLevel: 'class8', minAge: 15, maxAge: 45 },
    source: { url: 'https://www.skillindiadigital.gov.in', label: 'Skill India Digital' }, tags: ['free', 'certificate'],
  },
  {
    id: 'abroad-germany-ms', kind: 'abroad', scope: 'International', sample: true, status: 'draft',
    title: "Master's in Germany – public universities (sample entry)",
    provider: 'German public universities',
    summary: "Illustrative entry for tuition-free or low-fee master's programmes, usually needing IELTS/TOEFL and a relevant bachelor's degree.",
    criteria: { minLevel: 'ug', minPercentage: 60, manualChecks: ['English test score (IELTS/TOEFL)', 'Blocked account / proof of funds', 'Student visa'] },
    source: { url: 'https://www.daad.de/en/', label: 'DAAD' }, tags: ['Germany', 'PG'],
  },
];

export const SEED_OPPORTUNITIES: Opportunity[] = [...BASE, ...SEED_JOBS];

/** What can I study next? Illustrative pathways, pending expert review. */
export const SEED_PATHWAYS: Pathway[] = [
  { from: 'class10', options: [
    { id: 'p10-mpc', title: 'Intermediate – MPC (Maths, Physics, Chemistry)', duration: '2 years', eligibility: 'Class 10 pass',
      leadsTo: ['B.Tech / B.E.', 'B.Sc', 'B.Arch', 'NDA'], careers: ['Engineer', 'Scientist', 'Architect', 'Defence officer'], exams: ['JEE Main', 'EAPCET', 'NDA'] },
    { id: 'p10-bipc', title: 'Intermediate – BiPC (Biology, Physics, Chemistry)', duration: '2 years', eligibility: 'Class 10 pass',
      leadsTo: ['MBBS / BDS', 'B.Pharm', 'B.Sc Nursing', 'B.Sc Agriculture'], careers: ['Doctor', 'Pharmacist', 'Nurse', 'Agricultural officer'], exams: ['NEET UG', 'EAPCET'] },
    { id: 'p10-mec', title: 'Intermediate – MEC / CEC (Commerce)', duration: '2 years', eligibility: 'Class 10 pass',
      leadsTo: ['B.Com', 'BBA', 'CA / CMA / CS Foundation'], careers: ['Accountant', 'Chartered Accountant', 'Banker', 'Business analyst'], exams: ['CA Foundation', 'CUET'] },
    { id: 'p10-hec', title: 'Intermediate – HEC (History, Economics, Civics)', duration: '2 years', eligibility: 'Class 10 pass',
      leadsTo: ['B.A.', 'LLB (5-year)', 'BSW'], careers: ['Civil servant', 'Lawyer', 'Journalist', 'Teacher'], exams: ['CLAT', 'CUET'] },
    { id: 'p10-poly', title: 'Polytechnic Diploma', duration: '3 years', eligibility: 'Class 10 pass',
      leadsTo: ['B.Tech lateral entry (2nd year)', 'Jobs as technician'], careers: ['Junior engineer', 'Technician'], exams: ['POLYCET', 'ECET (later)'] },
    { id: 'p10-iti', title: 'ITI trade course', duration: '1–2 years', eligibility: 'Class 8 / 10 pass (by trade)',
      leadsTo: ['Apprenticeship', 'Diploma lateral entry'], careers: ['Electrician', 'Fitter', 'Mechanic', 'Welder'] },
  ] },
  { from: 'inter', stream: 'MPC', options: [
    { id: 'pi-btech', title: 'B.Tech / B.E.', duration: '4 years', eligibility: 'Inter MPC', leadsTo: ['M.Tech', 'MBA', 'MS abroad', 'Jobs'], careers: ['Software engineer', 'Civil / mechanical engineer', 'Data scientist'], exams: ['JEE Main', 'JEE Advanced', 'EAPCET'] },
    { id: 'pi-bsc', title: 'B.Sc (Maths, Physics, Computer Science)', duration: '3–4 years', eligibility: 'Inter MPC', leadsTo: ['M.Sc', 'MCA', 'B.Ed'], careers: ['Teacher', 'Analyst', 'Researcher'], exams: ['CUET'] },
    { id: 'pi-nda', title: 'NDA (Army, Navy, Air Force)', duration: '3 years + training', eligibility: 'Inter MPC for Navy / Air Force', leadsTo: ['Commissioned officer'], careers: ['Defence officer'], exams: ['NDA'] },
    { id: 'pi-barch', title: 'B.Arch', duration: '5 years', eligibility: 'Inter MPC', leadsTo: ['M.Arch', 'Practice'], careers: ['Architect'], exams: ['NATA', 'JEE Main Paper 2'] },
  ] },
  { from: 'inter', stream: 'BiPC', options: [
    { id: 'pi-mbbs', title: 'MBBS / BDS / AYUSH', duration: '5–5.5 years', eligibility: 'Inter BiPC', leadsTo: ['MD / MS', 'Practice'], careers: ['Doctor', 'Dentist'], exams: ['NEET UG'] },
    { id: 'pi-pharm', title: 'B.Pharm / Pharm.D', duration: '4–6 years', eligibility: 'Inter BiPC or MPC', leadsTo: ['M.Pharm', 'Industry'], careers: ['Pharmacist', 'Drug inspector'], exams: ['EAPCET'] },
    { id: 'pi-nursing', title: 'B.Sc Nursing', duration: '4 years', eligibility: 'Inter BiPC', leadsTo: ['M.Sc Nursing', 'Hospital jobs'], careers: ['Staff nurse'], exams: ['State nursing entrance'] },
    { id: 'pi-agri', title: 'B.Sc Agriculture / Horticulture', duration: '4 years', eligibility: 'Inter BiPC', leadsTo: ['M.Sc Agriculture', 'Govt jobs'], careers: ['Agricultural officer'], exams: ['EAPCET', 'ICAR AIEEA'] },
  ] },
  { from: 'inter', options: [
    { id: 'pi-bcom', title: 'B.Com / BBA', duration: '3 years', eligibility: 'Inter any stream (Commerce preferred)', leadsTo: ['M.Com', 'MBA', 'CA'], careers: ['Accountant', 'Banker', 'Manager'], exams: ['CUET'] },
    { id: 'pi-ba', title: 'B.A.', duration: '3 years', eligibility: 'Inter any stream', leadsTo: ['M.A.', 'B.Ed', 'LLB'], careers: ['Civil servant', 'Teacher', 'Journalist'], exams: ['CUET'] },
    { id: 'pi-llb', title: 'Integrated LLB (5 years)', duration: '5 years', eligibility: 'Inter any stream', leadsTo: ['LLM', 'Practice', 'Judicial services'], careers: ['Lawyer', 'Judge'], exams: ['CLAT', 'LAWCET'] },
    { id: 'pi-jobs', title: 'Government jobs after 12th', duration: '—', eligibility: 'Inter pass, age limits apply', leadsTo: ['SSC CHSL', 'Railways', 'Police constable'], careers: ['Clerk', 'Constable', 'Railway staff'] },
  ] },
  { from: 'diploma', options: [
    { id: 'pd-lateral', title: 'B.Tech lateral entry (2nd year)', duration: '3 years', eligibility: 'Diploma in engineering', leadsTo: ['B.Tech degree'], careers: ['Engineer'], exams: ['ECET'] },
    { id: 'pd-jobs', title: 'Junior engineer / technician jobs', duration: '—', eligibility: 'Diploma', leadsTo: ['PSU and private jobs'], careers: ['Junior engineer'], exams: ['SSC JE', 'RRB JE'] },
    { id: 'pd-apprentice', title: 'Apprenticeship', duration: '1 year', eligibility: 'Diploma', leadsTo: ['Industry experience'], careers: ['Technician'] },
  ] },
  { from: 'ug', options: [
    { id: 'pu-pg', title: "Master's degree (M.Tech, M.Sc, M.A., M.Com)", duration: '2 years', eligibility: "Relevant bachelor's", leadsTo: ['PhD', 'Teaching', 'Industry'], careers: ['Specialist', 'Lecturer', 'Researcher'], exams: ['GATE', 'CUET PG', 'PGECET'] },
    { id: 'pu-mba', title: 'MBA / PGDM', duration: '2 years', eligibility: "Any bachelor's", leadsTo: ['Management roles'], careers: ['Manager', 'Consultant'], exams: ['CAT', 'ICET'] },
    { id: 'pu-govt', title: 'Government jobs for graduates', duration: '—', eligibility: "Any bachelor's, age limits apply", leadsTo: ['UPSC', 'State PSC', 'SSC CGL', 'Bank PO'], careers: ['Officer', 'Inspector', 'Bank PO'] },
    { id: 'pu-bed', title: 'B.Ed (teaching)', duration: '2 years', eligibility: "Bachelor's with minimum marks", leadsTo: ['Teacher jobs'], careers: ['School teacher'], exams: ['EdCET', 'TET'] },
    { id: 'pu-abroad', title: 'Study abroad (MS / MBA)', duration: '1–2 years', eligibility: "Bachelor's + English test", leadsTo: ['International careers'], careers: ['Varies'], exams: ['IELTS / TOEFL', 'GRE / GMAT'] },
  ] },
  { from: 'pg', options: [
    { id: 'pp-phd', title: 'PhD / research', duration: '3–5 years', eligibility: "Master's with minimum marks", leadsTo: ['Professor', 'Scientist'], careers: ['Researcher', 'Professor'], exams: ['UGC NET / CSIR NET', 'GATE'] },
    { id: 'pp-lecturer', title: 'Assistant professor / lecturer', duration: '—', eligibility: "Master's + NET/SET", leadsTo: ['Academic career'], careers: ['Lecturer'], exams: ['UGC NET', 'State SET'] },
  ] },
];
