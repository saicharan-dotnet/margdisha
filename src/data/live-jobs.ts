// Fresher and entry-level jobs in India, collected every day from companies' official job boards
// by scripts/jobs/collect-jobs.mjs (GitHub workflow "Collect private jobs"). Each job shows for 14 days at most.
import data from './live-jobs.json';

export interface LiveJob {
  id: string; title: string; company: string; location: string;
  /** The job's page on the company's own careers site. */
  url: string;
  intern: boolean;
  firstSeen: string; expires: string; source: string;
}

export const LIVE_JOBS_UPDATED: string = data.updated;
const ALL = data.jobs as LiveJob[];

/** Jobs still within their 14 days today. */
export function liveJobs(today = new Date()): LiveJob[] {
  return ALL.filter((j) => new Date(j.expires + 'T23:59:59+05:30') >= today);
}
