import type { CalendarEntry } from './school-calendar';

/**
 * Government jobs: when notifications USUALLY come out (based on past years and the Railways'
 * yearly plan), who can apply, how selection works and how to apply. Planning guidance only:
 * every card links to the official site and shows the latest matching notice we collected.
 * `joins` holds the minimum qualification, which the Jobs page filters on.
 * `state` limits an entry to Telangana or Andhra Pradesh; entries without it are all-India.
 * `irregular` entries have no fixed yearly cycle and are notified only when there are vacancies.
 */

const UPSC_STEPS = [
  'Create your One Time Registration (OTR) on upsc.gov.in (once, reused for every UPSC exam).',
  'When the notification is out, open "Online Application" on upsc.gov.in and fill Part I and Part II.',
  'Upload photo, signature and ID; pay the fee (women, SC, ST and PwD candidates are usually exempt).',
  'Choose your exam centre early, as centres fill up. Download the e-admit card about 3 weeks before the exam.',
];
const SSC_STEPS = [
  'Register once on ssc.gov.in (One Time Registration) with Aadhaar, photo and signature.',
  'Log in, open the exam under "Apply", fill the form and choose up to 3 exam centres in your region.',
  'Pay the fee (₹100; women, SC, ST, PwD and ex-servicemen are exempt) and save the printout.',
  'Download the admit card from the SSC site about a week before the exam.',
];
const RRB_STEPS = [
  'Read the CEN (Centralised Employment Notice) on your regional RRB site, e.g. rrbsecunderabad.gov.in.',
  'Apply once on the common RRB portal (rrbapply.gov.in); choose one RRB and your post preferences.',
  'Pay the fee (₹500, of which ₹400 is refunded after you write the first exam; ₹250 for reserved categories, fully refunded).',
  'Check the exam city slip and download the e-call letter about 4 days before the exam.',
];
const IBPS_STEPS = [
  'Open ibps.in → "CRP" for your exam (PO, Clerk or RRB) and register with email and mobile.',
  'Fill details, upload photo, signature, thumb impression and handwritten declaration.',
  'Pay the fee online, then download the call letter for the free pre-exam training (if eligible) and the exam.',
  'After the result, provisional allotment to a bank happens through IBPS.',
];
const TGPSC_STEPS = [
  'Register your One Time Registration (OTR) on tgpsc.gov.in (Telangana Public Service Commission).',
  'When the notification is out, log in with your TGPSC ID and fill the application for that notification.',
  'Pay the fee online (some categories are exempt from the exam fee) and download the PDF.',
  'Download the hall ticket from tgpsc.gov.in about a week before the exam.',
];
const APPSC_STEPS = [
  'Register your One Time Profile Registration (OTPR) on psc.ap.gov.in (Andhra Pradesh Public Service Commission).',
  'When the notification is out, apply with your OTPR ID and pay the fee online.',
  'Download the hall ticket from psc.ap.gov.in before the screening test.',
];

export const JOB_CALENDAR: CalendarEntry[] = [
  // ---------- UPSC ----------
  { id: 'upsc-cse', school: 'UPSC Civil Services (IAS, IPS, IFS)', sector: 'UPSC', joins: 'Graduate',
    who: 'Any degree. Age 21 to 32 (relaxation for reserved categories); 6 attempts for General', formsFrom: 1, formsTo: 2,
    selection: 'Prelims in May or June, Mains in August or September, then interview', url: 'https://upsc.gov.in', match: 'civil services', steps: UPSC_STEPS },
  { id: 'upsc-ese', school: 'UPSC Engineering Services (IES)', sector: 'UPSC', joins: 'Graduate',
    who: 'B.E. or B.Tech (Civil, Mechanical, Electrical, Electronics and Telecom). Age 21 to 30', formsFrom: 9, formsTo: 10,
    selection: 'Prelims in February, Mains in June, then interview', url: 'https://upsc.gov.in', match: 'engineering services', steps: UPSC_STEPS },
  { id: 'upsc-cds', school: 'UPSC CDS (IMA, Naval Academy, Air Force Academy, OTA)', sector: 'UPSC', joins: 'Graduate',
    who: 'Degree (B.E. for Navy and Air Force). Age about 19 to 25, unmarried for academies', formsFrom: 12, formsTo: 1,
    selection: 'Written exam, then SSB interview and medical', url: 'https://upsc.gov.in', match: 'CDS|combined defence', note: 'Held twice a year: forms again around May–June.', steps: UPSC_STEPS },
  { id: 'upsc-capf', school: 'UPSC CAPF Assistant Commandant (BSF, CRPF, CISF, ITBP, SSB)', sector: 'UPSC', joins: 'Graduate',
    who: 'Any degree. Age 20 to 25', formsFrom: 4, formsTo: 5,
    selection: 'Written exam in August, physical test, then interview', url: 'https://upsc.gov.in', match: 'CAPF|assistant commandant', steps: UPSC_STEPS },
  { id: 'upsc-nda', school: 'UPSC NDA and NA (Army, Navy, Air Force)', sector: 'UPSC', joins: '12th pass',
    who: '12th pass or appearing (Maths and Physics for Navy and Air Force). Age about 16½ to 19½, unmarried', formsFrom: 12, formsTo: 1,
    selection: 'Written exam, then SSB interview and medical', url: 'https://upsc.gov.in', match: 'NDA|naval academy', note: 'Held twice a year: forms again around May–June.', steps: UPSC_STEPS },

  // ---------- SSC ----------
  { id: 'ssc-cgl', school: 'SSC CGL (Inspector, Assistant, Auditor and other Group B and C posts)', sector: 'SSC', joins: 'Graduate',
    who: 'Any degree. Age 18 to 32 depending on the post', formsFrom: 6, formsTo: 7,
    selection: 'Tier 1 and Tier 2 computer-based exams, then document check', url: 'https://ssc.gov.in', match: 'CGL|combined graduate', steps: SSC_STEPS },
  { id: 'ssc-chsl', school: 'SSC CHSL (LDC, Data Entry Operator, Postal and Sorting Assistant)', sector: 'SSC', joins: '12th pass',
    who: '12th pass. Age 18 to 27', formsFrom: 4, formsTo: 6,
    selection: 'Tier 1 and Tier 2 computer-based exams (Tier 2 includes typing)', url: 'https://ssc.gov.in', match: 'CHSL|higher secondary', steps: SSC_STEPS },
  { id: 'ssc-cpo', school: 'SSC CPO (Sub-Inspector in Delhi Police and CAPFs)', sector: 'SSC', joins: 'Graduate',
    who: 'Any degree. Age 20 to 25', formsFrom: 3, formsTo: 4,
    selection: 'Paper 1, physical test, Paper 2 and medical', url: 'https://ssc.gov.in', match: 'CPO|sub-inspector', steps: SSC_STEPS },
  { id: 'ssc-mts', school: 'SSC MTS and Havaldar', sector: 'SSC', joins: '10th pass',
    who: '10th pass. Age 18 to 25 or 27', formsFrom: 6, formsTo: 7,
    selection: 'Computer-based exam; physical test for Havaldar', url: 'https://ssc.gov.in', match: 'MTS|multi tasking', steps: SSC_STEPS },
  { id: 'ssc-gd', school: 'SSC GD Constable (BSF, CRPF, CISF, ITBP, SSB, Assam Rifles)', sector: 'SSC', joins: '10th pass',
    who: '10th pass. Age 18 to 23', formsFrom: 9, formsTo: 11,
    selection: 'Computer-based exam, physical test and medical', url: 'https://ssc.gov.in', match: 'GD|general duty|constable', steps: SSC_STEPS },

  // ---------- Railways ----------
  { id: 'rrb-alp', school: 'Railways Assistant Loco Pilot (RRB ALP)', sector: 'Railways', joins: '10th pass',
    who: '10th pass plus ITI, or a diploma or degree in engineering. Age 18 to 30', formsFrom: 1, formsTo: 3,
    selection: 'Two computer-based tests and an aptitude test', url: 'https://indianrailways.gov.in', match: 'ALP|loco pilot', steps: RRB_STEPS },
  { id: 'rrb-tech', school: 'Railways Technicians (RRB)', sector: 'Railways', joins: '10th pass',
    who: '10th pass plus ITI, or a diploma or B.Sc. Age 18 to 33', formsFrom: 4, formsTo: 6,
    selection: 'Computer-based test, then documents and medical', url: 'https://indianrailways.gov.in', match: 'technician', steps: RRB_STEPS },
  { id: 'rrb-ntpc', school: 'Railways NTPC (clerks, station master, goods guard)', sector: 'Railways', joins: '12th pass',
    who: '12th pass for some posts, a degree for others. Age 18 to 33', formsFrom: 7, formsTo: 9,
    selection: 'Computer-based tests, then typing or aptitude test', url: 'https://indianrailways.gov.in', match: 'NTPC|non technical', steps: RRB_STEPS },
  { id: 'rrb-je', school: 'Railways Junior Engineer (RRB JE)', sector: 'Railways', joins: 'Graduate',
    who: 'Diploma or B.E./B.Tech in engineering. Age 18 to 33', formsFrom: 7, formsTo: 9,
    selection: 'Two computer-based tests, documents and medical', url: 'https://indianrailways.gov.in', match: 'junior engineer|JE', note: 'Diploma holders can apply too.', steps: RRB_STEPS },
  { id: 'rrb-d', school: 'Railways Group D (Level 1)', sector: 'Railways', joins: '10th pass',
    who: '10th pass or ITI. Age 18 to 33', formsFrom: 10, formsTo: 12,
    selection: 'Computer-based test, then physical test', url: 'https://indianrailways.gov.in', match: 'group d|level 1|level-1', steps: RRB_STEPS },

  // ---------- Banks ----------
  { id: 'ibps-po', school: 'IBPS PO (Probationary Officer, public sector banks)', sector: 'Banking', joins: 'Graduate',
    who: 'Any degree. Age 20 to 30', formsFrom: 7, formsTo: 8,
    selection: 'Prelims, Mains and interview', url: 'https://www.ibps.in', match: 'PO|probationary', steps: IBPS_STEPS },
  { id: 'ibps-clerk', school: 'IBPS Clerk (public sector banks)', sector: 'Banking', joins: 'Graduate',
    who: 'Any degree, and the state language. Age 20 to 28', formsFrom: 7, formsTo: 8,
    selection: 'Prelims and Mains (no interview)', url: 'https://www.ibps.in', match: 'clerk|CSA', steps: IBPS_STEPS },
  { id: 'ibps-rrb', school: 'IBPS RRB (Gramin banks: Officer Scale I and Office Assistant)', sector: 'Banking', joins: 'Graduate',
    who: 'Any degree, and the local language. Office Assistant age 18 to 28; Officer 18 to 30', formsFrom: 6, formsTo: 6,
    selection: 'Prelims and Mains; interview for officers', url: 'https://www.ibps.in', match: 'RRB|regional rural|gramin', note: 'Telangana Grameena Bank, AP Grameena Vikas Bank and others recruit through this.', steps: IBPS_STEPS },
  { id: 'sbi-po', school: 'SBI PO (Probationary Officer)', sector: 'Banking', joins: 'Graduate',
    who: 'Any degree. Age 21 to 30', formsFrom: 6, formsTo: 6, irregular: true,
    selection: 'Prelims, Mains, then psychometric test, group exercise and interview', url: 'https://sbi.co.in/web/careers', match: 'probationary officer|PO',
    steps: ['Open sbi.co.in → Careers → "Current openings" and choose the PO notification.', 'Register, fill the form and upload photo, signature, thumb impression and declaration.', 'Pay the fee and download the call letter before each stage.'] },
  { id: 'sbi-clerk', school: 'SBI Clerk (Junior Associate)', sector: 'Banking', joins: 'Graduate',
    who: 'Any degree, and the local language of the state you apply for. Age 20 to 28', formsFrom: 11, formsTo: 12, irregular: true,
    selection: 'Prelims, Mains and a local language test', url: 'https://sbi.co.in/web/careers', match: 'junior associate|clerk',
    steps: ['Open sbi.co.in → Careers → "Current openings" and choose Junior Associates.', 'Apply for one state only; you must know its language.', 'Pay the fee and download the call letters.'] },
  { id: 'rbi', school: 'RBI Grade B Officer and RBI Assistant', sector: 'Banking', joins: 'Graduate',
    who: 'Degree (Grade B: 60%, Assistant: 50%). Grade B age 21 to 30; Assistant 20 to 28', formsFrom: 7, formsTo: 9, irregular: true,
    selection: 'Grade B: Phase 1, Phase 2 and interview. Assistant: Prelims, Mains and language test', url: 'https://opportunities.rbi.org.in', match: 'grade b|assistant',
    steps: ['Watch opportunities.rbi.org.in → Current vacancies.', 'Apply online, upload documents and pay the fee.', 'Download call letters from the same site.'] },

  // ---------- Postal ----------
  { id: 'gds', school: 'India Post Gramin Dak Sevak (BPM, ABPM, Dak Sevak)', sector: 'Departments', joins: '10th pass',
    who: '10th pass with maths and the local language, and basic computer knowledge. Age 18 to 40', formsFrom: 1, formsTo: 2,
    selection: 'No exam: merit list from 10th marks, then document check', url: 'https://indiapostgdsonline.gov.in', match: 'GDS|gramin dak',
    note: 'Sometimes a second schedule in the middle of the year. Postal and Sorting Assistant jobs come through SSC CHSL; Postman and MTS through circle notifications.',
    steps: ['Register on indiapostgdsonline.gov.in with mobile and email.', 'Pay the fee (₹100; women, SC, ST, PwD and transwomen exempt) at the post office or online.', 'Choose your circle and up to the allowed number of post office preferences, upload photo and signature.', 'Watch the site for merit lists; shortlisted candidates go for document verification.'] },

  // ---------- Defence ----------
  { id: 'agniveer', school: 'Indian Army Agniveer', sector: 'Defence', joins: '10th pass',
    who: '10th or 12th pass depending on the trade. Age 17½ to 21', formsFrom: 2, formsTo: 4,
    selection: 'Online exam, then rally (physical test and medical)', url: 'https://joinindianarmy.nic.in', match: 'agniveer|agnipath',
    steps: ['Register on joinindianarmy.nic.in with your 10th details.', 'Choose your trade and pay ₹250 online.', 'Write the online Common Entrance Exam; selected candidates get a rally call letter.'] },
  { id: 'agniveervayu', school: 'Indian Air Force Agniveervayu', sector: 'Defence', joins: '12th pass',
    who: '12th pass (Maths, Physics, English for science) or a 3-year diploma. Age 17½ to 21', formsFrom: 1, formsTo: 2,
    selection: 'Online test, physical fitness test, adaptability test and medical', url: 'https://agnipathvayu.cdac.in', match: 'agniveervayu|air force',
    note: 'Usually a second window around July.',
    steps: ['Register on agnipathvayu.cdac.in.', 'Fill the form, upload documents and pay the fee.', 'Download the admit card for the online test.'] },

  // ---------- Telangana ----------
  { id: 'tg-group1', school: 'TGPSC Group 1 (Deputy Collector, DSP, CTO and more)', sector: 'State PSC', joins: 'Graduate', state: 'Telangana',
    who: 'Any degree. Age limits and relaxations as per the notification', formsFrom: 4, formsTo: 4, irregular: true,
    selection: 'Prelims (objective), then Mains (written)', url: 'https://www.tgpsc.gov.in', match: 'group-i|group 1|group-1|group i', steps: TGPSC_STEPS },
  { id: 'tg-group2', school: 'TGPSC Group 2 (Naib Tehsildar, Sub-Registrar, Municipal Commissioner and more)', sector: 'State PSC', joins: 'Graduate', state: 'Telangana',
    who: 'Any degree. Age limits and relaxations as per the notification', formsFrom: 1, formsTo: 1, irregular: true,
    selection: 'Written exam (four papers)', url: 'https://www.tgpsc.gov.in', match: 'group-ii|group 2|group-2|group ii', steps: TGPSC_STEPS },
  { id: 'tg-group3', school: 'TGPSC Group 3 (Senior Assistant, Auditor and more)', sector: 'State PSC', joins: 'Graduate', state: 'Telangana',
    who: 'Any degree. Age limits and relaxations as per the notification', formsFrom: 1, formsTo: 1, irregular: true,
    selection: 'Written exam (three papers)', url: 'https://www.tgpsc.gov.in', match: 'group-iii|group 3|group-3|group iii', steps: TGPSC_STEPS },
  { id: 'tg-group4', school: 'TGPSC Group 4 (Junior Assistant, Typist and more)', sector: 'State PSC', joins: '12th pass', state: 'Telangana',
    who: 'Depends on the post: a degree for most, 12th with typing for some. Check the notification', formsFrom: 12, formsTo: 1, irregular: true,
    selection: 'Written exam (two papers)', url: 'https://www.tgpsc.gov.in', match: 'group-iv|group 4|group-4|group iv', steps: TGPSC_STEPS },
  { id: 'tg-police', school: 'Telangana Police Constable and Sub-Inspector (TGSLPRB)', sector: 'Police', joins: '12th pass', state: 'Telangana',
    who: 'Constable: 12th pass. SI: any degree. Height and age limits as per the notification', formsFrom: 4, formsTo: 5, irregular: true,
    selection: 'Preliminary written test, physical measurement and efficiency tests, final written exam', url: 'https://www.tgprb.in', match: 'constable|sub inspector|SI',
    steps: ['Register on tgprb.in when the notification is out.', 'Fill the form, upload documents and pay the fee.', 'Download the hall ticket for the preliminary test, then for the physical tests.'] },
  { id: 'tg-tet', school: 'TG TET (Teacher Eligibility Test)', sector: 'Teaching', joins: 'Graduate', state: 'Telangana',
    who: 'D.El.Ed for Classes 1 to 5 (Paper 1); degree with B.Ed for Classes 6 to 8 (Paper 2)', formsFrom: 11, formsTo: 12, irregular: true,
    selection: 'One exam; the TET score is needed to apply for DSC teacher jobs', url: 'https://schooledu.telangana.gov.in', match: 'TET|teacher eligibility',
    note: 'Usually held once or twice a year.', steps: ['Apply on the TG TET website when the notification is out.', 'Pay the fee, upload photo and signature.', 'Download the hall ticket and write the computer-based test.'] },
  { id: 'tg-dsc', school: 'TG DSC (government school teacher recruitment)', sector: 'Teaching', joins: 'Graduate', state: 'Telangana',
    who: 'TET qualified, with D.El.Ed or B.Ed as required for the post', formsFrom: 3, formsTo: 4, irregular: true,
    selection: 'Teacher Recruitment Test (TRT) with TET weightage', url: 'https://schooledu.telangana.gov.in', match: 'DSC|TRT|teacher recruitment',
    steps: ['Apply online on the DSC portal when the notification is out.', 'Choose the post (SGT, School Assistant, language pandit, PET) and district.', 'Write the exam; merit lists are district-wise.'] },
  { id: 'tg-power', school: 'TGGENCO, TGTRANSCO and power distribution companies (AE, JLM, Sub-Engineer)', sector: 'PSU', joins: '10th pass', state: 'Telangana',
    who: 'AE: B.E./B.Tech (Electrical, Mechanical, Civil, ECE). Sub-Engineer: diploma. JLM: 10th with ITI (Electrical)', formsFrom: 1, formsTo: 3, irregular: true,
    selection: 'Written test; JLM also has a pole-climbing test', url: 'https://tsgenco.co.in', match: 'GENCO|TRANSCO|assistant engineer|junior lineman|JLM',
    note: 'Also watch the Telangana distribution companies (TGSPDCL and TGNPDCL).', steps: ['Watch the Careers page of TGGENCO, TGTRANSCO, TGSPDCL and TGNPDCL.', 'Apply online when the notification is out and pay the fee.', 'Download the hall ticket for the written test.'] },
  { id: 'sccl', school: 'Singareni Collieries (SCCL): Management Trainee, Junior Assistant, ITI trainees', sector: 'PSU', joins: '10th pass', state: 'Telangana',
    who: 'Depends on the post: degree for trainees, ITI for trades', formsFrom: 1, formsTo: 3, irregular: true,
    selection: 'Written test, then document check and medical', url: 'https://scclmines.com', match: 'singareni|SCCL',
    steps: ['Watch scclmines.com → Careers.', 'Apply online and pay the fee.', 'Download the hall ticket for the written test.'] },

  // ---------- Andhra Pradesh ----------
  { id: 'ap-group1', school: 'APPSC Group 1 (Deputy Collector, DSP and more)', sector: 'State PSC', joins: 'Graduate', state: 'Andhra Pradesh',
    who: 'Any degree. Age 18 to 42 with relaxations as per the notification', formsFrom: 1, formsTo: 2, irregular: true,
    selection: 'Screening test (Prelims), Mains, then interview', url: 'https://psc.ap.gov.in', match: 'group-i|group 1|group-1|group i', steps: APPSC_STEPS },
  { id: 'ap-group2', school: 'APPSC Group 2 (Deputy Tahsildar, Sub-Registrar, Municipal Commissioner and more)', sector: 'State PSC', joins: 'Graduate', state: 'Andhra Pradesh',
    who: 'Any degree. Age 18 to 42 with relaxations as per the notification', formsFrom: 12, formsTo: 1, irregular: true,
    selection: 'Screening test, then Mains', url: 'https://psc.ap.gov.in', match: 'group-ii|group 2|group-2|group ii', steps: APPSC_STEPS },
  { id: 'ap-police', school: 'AP Police Constable and Sub-Inspector (APSLPRB)', sector: 'Police', joins: '12th pass', state: 'Andhra Pradesh',
    who: 'Constable: 12th pass. SI: any degree. Height and age limits as per the notification', formsFrom: 11, formsTo: 12, irregular: true,
    selection: 'Preliminary written test, physical tests, final written exam', url: 'https://slprb.ap.gov.in', match: 'constable|sub inspector|SI',
    steps: ['Register on slprb.ap.gov.in when the notification is out.', 'Fill the form, upload documents and pay the fee.', 'Download hall tickets for each stage.'] },
  { id: 'ap-tet', school: 'AP TET (Teacher Eligibility Test)', sector: 'Teaching', joins: 'Graduate', state: 'Andhra Pradesh',
    who: 'D.El.Ed for primary (Paper 1); degree with B.Ed for upper primary (Paper 2)', formsFrom: 7, formsTo: 8, irregular: true,
    selection: 'One exam; the TET score is needed for AP DSC', url: 'https://aptet.apcfss.in', match: 'TET|teacher eligibility',
    steps: ['Apply on aptet.apcfss.in when the notification is out.', 'Pay the fee and upload documents.', 'Download the hall ticket for the computer-based test.'] },
  { id: 'ap-dsc', school: 'AP DSC (government school teacher recruitment)', sector: 'Teaching', joins: 'Graduate', state: 'Andhra Pradesh',
    who: 'TET qualified, with D.El.Ed or B.Ed as required for the post', formsFrom: 4, formsTo: 5, irregular: true,
    selection: 'Teacher Recruitment Test with TET weightage', url: 'https://apdsc.apcfss.in', match: 'DSC|TRT|teacher recruitment',
    steps: ['Apply on apdsc.apcfss.in when the notification is out.', 'Choose the post and district.', 'Write the exam; merit lists are district-wise.'] },
  { id: 'ap-power', school: 'APGENCO, APTRANSCO and power distribution companies (AE, JLM)', sector: 'PSU', joins: '10th pass', state: 'Andhra Pradesh',
    who: 'AE: B.E./B.Tech. JLM: 10th with ITI (Electrical)', formsFrom: 1, formsTo: 3, irregular: true,
    selection: 'Written test; JLM also has a pole-climbing test', url: 'https://apgenco.gov.in', match: 'GENCO|TRANSCO|assistant engineer|junior lineman|JLM',
    note: 'Also watch APSPDCL, APEPDCL and APCPDCL.', steps: ['Watch the Careers pages of APGENCO, APTRANSCO and the AP distribution companies.', 'Apply online when the notification is out and pay the fee.', 'Download the hall ticket for the written test.'] },
  { id: 'rinl', school: 'Vizag Steel Plant (RINL): Management Trainee and Junior Trainee', sector: 'PSU', joins: '10th pass', state: 'Andhra Pradesh',
    who: 'Management Trainee: B.E./B.Tech. Junior Trainee: ITI or diploma in the trade', formsFrom: 1, formsTo: 3, irregular: true,
    selection: 'Computer-based test (some years through GATE scores), then interview or trade test', url: 'https://www.vizagsteel.com', match: 'RINL|vizag steel|management trainee|junior trainee',
    steps: ['Watch vizagsteel.com → Careers.', 'Apply online and pay the fee.', 'Download the call letter for the test.'] },

  // ---------- All-India PSUs ----------
  { id: 'sail', school: 'SAIL (Steel Authority of India): Management Trainee, Operator-cum-Technician, Attendant', sector: 'PSU', joins: '10th pass',
    who: 'MT: B.E./B.Tech, often through GATE. OCTT: diploma. Attendant: 10th with ITI', formsFrom: 1, formsTo: 3, irregular: true,
    selection: 'GATE score or computer-based test, then interview or skill test', url: 'https://sailcareers.com', match: 'SAIL|steel authority',
    steps: ['Watch sailcareers.com.', 'Apply online and pay the fee.', 'Download the admit card for the test.'] },
  { id: 'nmdc', school: 'NMDC: Junior Officer Trainee, Maintenance Assistant, Field Attendant', sector: 'PSU', joins: '10th pass',
    who: 'Depends on the post: degree or diploma for trainees, ITI for maintenance posts', formsFrom: 1, formsTo: 3, irregular: true,
    selection: 'Computer-based test, then trade or physical test', url: 'https://www.nmdc.co.in', match: 'NMDC',
    note: 'Head office is in Hyderabad.', steps: ['Watch nmdc.co.in → Careers.', 'Apply online and pay the fee.', 'Download the admit card.'] },
  { id: 'psu-gate', school: 'PSU jobs through GATE (NTPC, BHEL, IOCL, PGCIL, ONGC and more)', sector: 'PSU', joins: 'Graduate',
    who: 'B.E./B.Tech with a valid GATE score in the right paper', formsFrom: 1, formsTo: 3,
    selection: 'Shortlisting by GATE score, then group discussion and interview', url: 'https://www.ntpc.co.in', match: 'GATE',
    note: 'Write GATE in February; PSUs open forms right after the results.', steps: ['Write GATE in your branch.', 'Apply to each PSU on its own careers page with your GATE registration number.', 'Shortlisted candidates are called for interview.'] },
];

