import type { Opportunity } from './types';

/**
 * School admissions. NOT VERIFIED: these describe the admission schemes in general terms and
 * link to the official websites, but have not been checked against the current year's notice.
 * There are no dates on purpose: dates change every year and must come from the notification.
 * Each entry is `sample: true` until an admin edits it from the official notice and verifies it.
 */
const base = { scope: 'Central' as const, sample: true, status: 'in-review' as const, kind: 'school-admission' as const };

export const SEED_SCHOOLS: Opportunity[] = [
  {
    ...base, id: 'school-jnvst-6', sector: 'Navodaya', entryClass: 'Class 6',
    title: 'Jawahar Navodaya Vidyalaya admission, Class 6 (JNVST)',
    provider: 'Navodaya Vidyalaya Samiti',
    summary: 'Free residential, co-educational schools run by the Government of India, one in most districts. Children studying Class 5 apply through the Jawahar Navodaya Vidyalaya Selection Test for the Navodaya in their own district. Most seats are kept for children from rural areas.',
    selection: 'Selection test (mental ability, arithmetic, language)',
    amount: 'Education, boarding and lodging are free',
    criteria: { studyingAt: ['class5'], manualChecks: [
      'Studying Class 5 in a government or government-recognised school in the same district as the Navodaya',
      'Date of birth falls inside the window given in this year\'s notice',
      'Rural-quota seats need the child to have studied Classes 3, 4 and 5 in rural areas',
    ] },
    documents: ['Photo and signature of the child and parent', 'Certificate from the head of the current school', 'Aadhaar or residence proof'],
    source: { url: 'https://navodaya.gov.in', label: 'Navodaya Vidyalaya Samiti' }, tags: ['residential', 'free', 'rural'],
  },
  {
    ...base, id: 'school-jnvst-9', sector: 'Navodaya', entryClass: 'Class 9',
    title: 'Jawahar Navodaya Vidyalaya lateral entry, Class 9',
    provider: 'Navodaya Vidyalaya Samiti',
    summary: 'A selection test for the few seats that fall vacant in Class 9 at each Navodaya. For children studying Class 8 in the same district.',
    selection: 'Selection test (English, Hindi, Maths, Science)',
    criteria: { studyingAt: ['class8'], manualChecks: [
      'Studying Class 8 in a government or recognised school in the same district',
      'Date of birth falls inside the window given in this year\'s notice',
    ] },
    source: { url: 'https://navodaya.gov.in', label: 'Navodaya Vidyalaya Samiti' }, tags: ['residential', 'lateral entry'],
  },
  {
    ...base, id: 'school-aissee-6', sector: 'Sainik', entryClass: 'Class 6',
    title: 'Sainik School admission, Class 6 (AISSEE)',
    provider: 'Sainik Schools Society, exam by National Testing Agency',
    summary: 'Residential schools that prepare children for the National Defence Academy and other officer entries. Admission to Class 6 is through the All India Sainik Schools Entrance Examination. Girls can apply for Class 6.',
    selection: 'Written exam (maths, intelligence, language, general knowledge), then medical check',
    amount: 'Fees apply; state and central scholarships are available for many students',
    criteria: { manualChecks: [
      'Age limit for Class 6 as given in this year\'s notice (usually around 10 to 12 years)',
      'Seat reservation for the home state, SC, ST, OBC and defence wards',
    ] },
    documents: ['Birth certificate', 'Domicile certificate', 'Category certificate if any'],
    source: { url: 'https://exams.nta.ac.in/AISSEE/', label: 'NTA, AISSEE page' }, tags: ['defence', 'residential'],
  },
  {
    ...base, id: 'school-aissee-9', sector: 'Sainik', entryClass: 'Class 9',
    title: 'Sainik School admission, Class 9 (AISSEE)',
    provider: 'Sainik Schools Society, exam by National Testing Agency',
    summary: 'Class 9 entry to Sainik Schools through the same entrance exam. For children studying Class 8 in a recognised school.',
    selection: 'Written exam (maths, intelligence, English, general science, social studies), then medical check',
    criteria: { studyingAt: ['class8'], manualChecks: [
      'Age limit for Class 9 as given in this year\'s notice (usually around 13 to 15 years)',
      'Whether girls can apply for Class 9 at the school you choose',
    ] },
    source: { url: 'https://exams.nta.ac.in/AISSEE/', label: 'NTA, AISSEE page' }, tags: ['defence', 'residential'],
  },
  {
    ...base, id: 'school-rms-cet', sector: 'Military School', entryClass: 'Class 6 and Class 9',
    title: 'Rashtriya Military School admission (CET), Class 6 and Class 9',
    provider: 'Rashtriya Military Schools, Ministry of Defence',
    summary: 'Five residential schools at Ajmer, Bengaluru, Belagavi, Chail and Dholpur. A Common Entrance Test is held for Class 6 and Class 9. Seats are kept for children of defence personnel, with some open to civilians.',
    selection: 'Common Entrance Test, interview and medical check',
    criteria: { manualChecks: [
      'Age limit for the class you apply to, as given in this year\'s notice',
      'Seat quota for wards of serving or retired defence personnel and for civilians',
      'Whether girls are admitted this year',
    ] },
    source: { url: 'https://www.rashtriyamilitaryschools.edu.in', label: 'Rashtriya Military Schools' }, tags: ['defence', 'residential'],
  },
  {
    ...base, id: 'school-kv-class1', sector: 'Kendriya Vidyalaya', entryClass: 'Balvatika and Class 1',
    title: 'Kendriya Vidyalaya admission, Balvatika and Class 1',
    provider: 'Kendriya Vidyalaya Sangathan',
    summary: 'Central government schools across India with CBSE curriculum. Balvatika and Class 1 admissions are online, by lottery within priority categories. Children of central government employees, including transferable staff, get the highest priority.',
    selection: 'Online registration, then lottery within priority categories',
    amount: 'Low fees; some groups are exempt',
    criteria: { manualChecks: [
      'Child\'s age on the cut-off date in this year\'s admission guidelines (Class 1 needs at least 6 years)',
      'Your priority category (central government employee, state government, PSU, others)',
    ] },
    documents: ['Birth certificate', 'Residence proof', 'Service certificate of the parent, if claiming priority', 'Category certificate if any'],
    source: { url: 'https://kvsangathan.nic.in', label: 'Kendriya Vidyalaya Sangathan' }, tags: ['CBSE', 'central government'],
  },
  {
    ...base, id: 'school-kv-other', sector: 'Kendriya Vidyalaya', entryClass: 'Class 2 to Class 11',
    title: 'Kendriya Vidyalaya admission, Class 2 onwards and Class 11',
    provider: 'Kendriya Vidyalaya Sangathan',
    summary: 'Admission to Class 2 and above is offline at each school, only where seats are vacant. Class 11 admission depends on Class 10 marks and the streams the school offers.',
    selection: 'Registration at the school; for Class 11, merit in Class 10',
    criteria: { manualChecks: [
      'Vacant seats in the class at the school you want',
      'Age on the cut-off date for that class',
      'For Class 11: marks needed for the stream you want',
    ] },
    source: { url: 'https://kvsangathan.nic.in', label: 'Kendriya Vidyalaya Sangathan' }, tags: ['CBSE', 'central government'],
  },
  {
    ...base, id: 'school-emrs-6', sector: 'EMRS', entryClass: 'Class 6',
    title: 'Eklavya Model Residential School admission, Class 6',
    provider: 'National Education Society for Tribal Students, Ministry of Tribal Affairs',
    summary: 'Free residential schools for Scheduled Tribe children, in many states including Telangana and Andhra Pradesh. Class 6 admission is through an entrance test conducted by the state.',
    selection: 'Entrance test conducted by the state society',
    amount: 'Education, boarding and lodging are free',
    criteria: { studyingAt: ['class5'], categories: ['ST'], manualChecks: ['Age and residence conditions in your state\'s notice', 'Some seats may be open to non-ST children'] },
    source: { url: 'https://nests.tribal.gov.in', label: 'NESTS, Ministry of Tribal Affairs' }, tags: ['residential', 'free', 'tribal'],
  },
  {
    ...base, id: 'school-tg-gurukul-5', sector: 'State residential', scope: 'State', entryClass: 'Class 5',
    title: 'Telangana Gurukul schools admission, Class 5 (TGCET)',
    provider: 'Telangana social, tribal, BC and general welfare residential societies',
    summary: 'One common entrance test for admission to Class 5 in Telangana\'s residential welfare schools (Gurukulams). Education, food and hostel are free.',
    selection: 'Common entrance test',
    amount: 'Education, boarding and lodging are free',
    criteria: { states: ['Telangana'], manualChecks: [
      'Studying Class 4 in a government or recognised school in Telangana',
      'Age and family income limits in this year\'s notice',
    ] },
    source: { url: 'https://tgcet.cgg.gov.in', label: 'TGCET portal' }, tags: ['residential', 'free', 'state'],
  },
  {
    ...base, id: 'school-ap-residential-5', sector: 'State residential', scope: 'State', entryClass: 'Class 5',
    title: 'Andhra Pradesh residential schools admission, Class 5',
    provider: 'AP Residential Educational Institutions Society and welfare residential societies',
    summary: 'Entrance tests for Class 5 admission in Andhra Pradesh residential schools, including APREIS schools and the social and tribal welfare Gurukulams.',
    selection: 'Entrance test',
    criteria: { states: ['Andhra Pradesh'], manualChecks: [
      'Studying Class 4 in a government or recognised school in Andhra Pradesh',
      'Age and family income limits in this year\'s notice',
    ] },
    source: { url: 'https://aprs.apcfss.in', label: 'APREIS admissions portal' }, tags: ['residential', 'state'],
  },
  {
    ...base, id: 'school-nmms', kind: 'scholarship', sector: 'School scholarship', entryClass: 'Classes 9 to 12',
    title: 'National Means-cum-Merit Scholarship (NMMS)',
    provider: 'Ministry of Education, exam by the state',
    summary: 'A scholarship for Class 8 students in government, local body and aided schools, paid each year from Class 9 to Class 12 if the student keeps studying. Selection is through a state-level exam.',
    amount: 'Paid yearly for Classes 9 to 12; check the current amount in the notice',
    selection: 'State-level exam (mental ability and scholastic aptitude)',
    criteria: { studyingAt: ['class8'], manualChecks: [
      'Studying in a government, local body or government-aided school (not Navodaya, KV or residential schools)',
      'Family income and Class 7 marks limits in this year\'s notice',
    ] },
    source: { url: 'https://scholarships.gov.in', label: 'National Scholarship Portal' }, tags: ['school', 'merit', 'income'],
  },
];
