import type { Opportunity } from './types';

/** Shape of a row in public.opportunities. */
export interface OppRow {
  id: string; kind: Opportunity['kind']; scope: Opportunity['scope']; sector: string | null;
  title: string; provider: string; summary: string;
  criteria: Opportunity['criteria']; details: Record<string, unknown>;
  deadline: string | null; source_url: string; source_label: string;
  published_on: string | null; last_verified_on: string | null; verified_by: string | null;
  status: Opportunity['status']; sample: boolean;
}

const DETAIL_KEYS = ['amount', 'salary', 'selection', 'documents', 'opensOn', 'location', 'workMode', 'vacancies', 'experience', 'entryClass', 'tags'] as const;

export function oppToRow(o: Opportunity): OppRow {
  const details: Record<string, unknown> = {};
  for (const k of DETAIL_KEYS) if (o[k] !== undefined) details[k] = o[k];
  return {
    id: o.id, kind: o.kind, scope: o.scope, sector: o.sector ?? null, title: o.title, provider: o.provider, summary: o.summary,
    criteria: o.criteria, details, deadline: o.deadline ?? null, source_url: o.source.url, source_label: o.source.label,
    published_on: o.source.publishedOn ?? null, last_verified_on: o.source.lastVerifiedOn ?? null, verified_by: o.source.verifiedBy ?? null,
    status: o.status, sample: o.sample,
  };
}

export function rowToOpp(r: OppRow): Opportunity {
  const d = r.details ?? {};
  return {
    id: r.id, kind: r.kind, scope: r.scope, title: r.title, provider: r.provider, summary: r.summary,
    criteria: r.criteria ?? {}, deadline: r.deadline ?? undefined, status: r.status, sample: r.sample,
    sector: (r.sector ?? undefined) as Opportunity['sector'],
    source: { url: r.source_url, label: r.source_label, publishedOn: r.published_on ?? undefined,
      lastVerifiedOn: r.last_verified_on ?? undefined, verifiedBy: r.verified_by ?? undefined },
    tags: (d.tags as string[]) ?? [],
    ...(Object.fromEntries(DETAIL_KEYS.filter((k) => k !== 'tags' && d[k] !== undefined).map((k) => [k, d[k]])) as Partial<Opportunity>),
  };
}
