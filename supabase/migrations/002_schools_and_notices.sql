-- 002: school admissions, and notices collected automatically from official websites.
-- Safe to run more than once.

-- ── School admissions as a new kind of listing ────────────────────────
alter table public.opportunities drop constraint if exists opportunities_kind_check;
alter table public.opportunities add constraint opportunities_kind_check
  check (kind in ('scholarship','govt-job','private-job','internship','exam','course','skill','abroad','school-admission'));

-- ── Official notices (filled by the GitHub Actions collector) ─────────
-- The collector only records the title and link of each new notice it finds on an
-- official website. Nothing here is a verified listing: an admin turns a notice into a
-- listing and verifies it through the normal workflow.
create table if not exists public.official_notices (
  id bigint generated always as identity primary key,
  url text not null unique check (url ~ '^https?://'),
  title text not null check (length(title) between 4 and 400),
  source_id text not null,
  source_name text not null,
  sector text,
  area text not null check (area in ('job','school','exam','scholarship')),
  first_seen timestamptz not null default now(),
  status text not null default 'new' check (status in ('new','listed','ignored')),
  listing_id text references public.opportunities(id) on delete set null
);
create index if not exists official_notices_seen_idx on public.official_notices (first_seen desc);
alter table public.official_notices enable row level security;

-- Everyone can read notices that were not dismissed (the site shows them as
-- "from official websites, not checked yet"). Admins see everything.
drop policy if exists "public reads notices" on public.official_notices;
create policy "public reads notices" on public.official_notices for select to anon, authenticated
  using (status <> 'ignored' or public.is_admin());
-- Admins can mark notices as listed or ignored, or delete them.
drop policy if exists "admins manage notices" on public.official_notices;
create policy "admins manage notices" on public.official_notices for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins delete notices" on public.official_notices;
create policy "admins delete notices" on public.official_notices for delete to authenticated
  using (public.is_admin());
-- No insert policy: only the collector, using the secret key (service_role), can add rows.

grant select on public.official_notices to anon, authenticated;
grant update, delete on public.official_notices to authenticated;
grant select, insert, update on public.official_notices to service_role;
grant usage, select on sequence public.official_notices_id_seq to service_role;
