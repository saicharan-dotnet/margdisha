/** Education levels, ordered. Higher index = higher completed qualification. */
export const LEVELS = [
  'class5', 'class8', 'class10', 'inter', 'diploma', 'ug', 'pg', 'phd',
] as const;
export type Level = (typeof LEVELS)[number];

export type Stream =
  | 'MPC' | 'BiPC' | 'MEC' | 'CEC' | 'HEC' | 'Vocational'
  | 'Engineering' | 'Science' | 'Commerce' | 'Arts' | 'Medical' | 'Any';

export type Category = 'General' | 'EWS' | 'OBC' | 'SC' | 'ST';
export type Gender = 'female' | 'male' | 'other';

export interface Profile {
  name?: string;
  level?: Level;
  /** Is the qualification completed, or currently studying it? */
  levelStatus?: 'completed' | 'pursuing';
  stream?: Stream;
  specialization?: string;
  percentage?: number;
  age?: number;
  state?: string;
  category?: Category;
  gender?: Gender;
  annualFamilyIncome?: number; // INR
  skills: string[];
  interests: string[];
  goals?: string;
}

/** Every rule is optional. A rule only applies when it is set. */
export interface Criteria {
  /** Minimum qualification that must be completed. */
  minLevel?: Level;
  /** Allow candidates currently pursuing minLevel (e.g. final-year students). */
  allowPursuing?: boolean;
  /** Applicant must be studying exactly at one of these levels (scholarships). */
  studyingAt?: Level[];
  streams?: Stream[];
  minPercentage?: number;
  maxIncome?: number;
  minAge?: number;
  maxAge?: number;
  /** Extra years of upper-age relaxation per category. */
  ageRelaxation?: Partial<Record<Category, number>>;
  states?: string[];
  categories?: Category[];
  genders?: Gender[];
  /** Free-text conditions the engine cannot check automatically. */
  manualChecks?: string[];
}

export type OpportunityKind =
  | 'scholarship' | 'govt-job' | 'private-job' | 'internship'
  | 'exam' | 'course' | 'skill' | 'abroad' | 'school-admission';

export const GOVT_SECTORS = ['UPSC', 'State PSC', 'SSC', 'Banking', 'Railways', 'Defence', 'Police', 'Teaching', 'PSU', 'Apprenticeship', 'Departments'] as const;
export const PRIVATE_SECTORS = ['IT & Software', 'Banking & Finance', 'Healthcare', 'Manufacturing', 'Sales & Marketing', 'Education', 'Customer Support'] as const;
export const SCHOOL_SECTORS = ['Navodaya', 'Sainik', 'Military School', 'Kendriya Vidyalaya', 'EMRS', 'State residential', 'School scholarship'] as const;
export type JobSector = (typeof GOVT_SECTORS)[number] | (typeof PRIVATE_SECTORS)[number] | (typeof SCHOOL_SECTORS)[number];
export type WorkMode = 'onsite' | 'remote' | 'hybrid';

export type VerificationStatus = 'draft' | 'in-review' | 'verified' | 'rejected';

export interface SourceInfo {
  /** Official source / notification link. */
  url: string;
  label: string;
  publishedOn?: string; // ISO date
  lastVerifiedOn?: string; // ISO date, only set once a reviewer verifies
  verifiedBy?: string;
}

export interface Opportunity {
  id: string;
  kind: OpportunityKind;
  title: string;
  provider: string;
  scope: 'Central' | 'State' | 'Private' | 'International' | 'Institutional';
  summary: string;
  criteria: Criteria;
  amount?: string;
  salary?: string;
  selection?: string;
  documents?: string[];
  opensOn?: string;
  deadline?: string; // ISO date
  source: SourceInfo;
  status: VerificationStatus;
  /** True for seeded demo content. Never shown without a warning. */
  sample: boolean;
  tags: string[];
  /** Jobs and school admissions. */
  sector?: JobSector;
  location?: string;
  workMode?: WorkMode;
  vacancies?: string;
  experience?: string;
  /** School admissions: the class a child joins (e.g. "Class 6"). */
  entryClass?: string;
}

export interface PathwayOption {
  id: string;
  title: string;
  duration: string;
  eligibility: string;
  leadsTo: string[];
  careers: string[];
  exams?: string[];
}

export interface Pathway {
  from: Level;
  stream?: Stream;
  options: PathwayOption[];
}

export type MatchStatus = 'likely' | 'verify' | 'not';

export interface Reason {
  ok: boolean | null; // null = could not check
  text: string;
}

export interface MatchResult {
  status: MatchStatus;
  reasons: Reason[];
  missing: string[];
  expired: boolean;
}
