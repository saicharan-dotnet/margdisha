-- MargDisha database schema (phase 2).
-- Run once in Supabase: SQL Editor → New query → paste → Run.
-- Safe to re-run: every statement is idempotent.

-- ── Admins ───────────────────────────────────────────────────────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "admins see admins" on public.admins;
create policy "admins see admins" on public.admins for select to authenticated using (public.is_admin() or user_id = auth.uid());

-- ── Opportunities ────────────────────────────────────────────────────
create table if not exists public.opportunities (
  id text primary key,
  kind text not null check (kind in ('scholarship','govt-job','private-job','internship','exam','course','skill','abroad')),
  scope text not null check (scope in ('Central','State','Private','International','Institutional')),
  sector text,
  title text not null,
  provider text not null,
  summary text not null default '',
  criteria jsonb not null default '{}'::jsonb,
  details jsonb not null default '{}'::jsonb,   -- amount, salary, selection, documents, location, workMode, experience, vacancies, tags, opensOn
  deadline date,
  source_url text not null,
  source_label text not null,
  published_on date,
  last_verified_on date,
  verified_by text,
  status text not null default 'draft' check (status in ('draft','in-review','verified','rejected')),
  sample boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists opportunities_kind_idx on public.opportunities (kind);
create index if not exists opportunities_deadline_idx on public.opportunities (deadline);
alter table public.opportunities enable row level security;

-- Public sees verified items, plus sample items (always badged as unverified in the app).
-- Admins see everything.
drop policy if exists "public reads published" on public.opportunities;
create policy "public reads published" on public.opportunities for select to anon, authenticated
  using (status = 'verified' or (sample and status <> 'rejected') or public.is_admin());
drop policy if exists "admins write" on public.opportunities;
create policy "admins write" on public.opportunities for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Server-side rule: nothing becomes "verified" without an official https source,
-- a publication date, a reviewer and real (non-sample) data.
create or replace function public.enforce_verification()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if new.status = 'verified' then
    if new.sample then raise exception 'Sample data cannot be verified. Replace it with real data first.'; end if;
    if new.source_url !~ '^https://' then raise exception 'Verified items need an https official source link.'; end if;
    if new.published_on is null or coalesce(trim(new.verified_by), '') = '' then
      raise exception 'Verified items need a publication date and reviewer name.';
    end if;
    if tg_op = 'INSERT' or old.status is distinct from 'verified' then
      new.last_verified_on := current_date;
    end if;
  elsif new.status <> 'verified' then
    new.last_verified_on := null;
    new.verified_by := null;
  end if;
  return new;
end $$;
drop trigger if exists opportunities_verify on public.opportunities;
create trigger opportunities_verify before insert or update on public.opportunities
  for each row execute function public.enforce_verification();

-- ── Verification audit log (append-only) ─────────────────────────────
create table if not exists public.verification_log (
  id bigint generated always as identity primary key,
  opportunity_id text not null references public.opportunities (id) on delete cascade,
  from_status text,
  to_status text not null,
  source_url text,
  actor uuid default auth.uid(),
  actor_note text,
  created_at timestamptz not null default now()
);
alter table public.verification_log enable row level security;
drop policy if exists "admins read log" on public.verification_log;
create policy "admins read log" on public.verification_log for select to authenticated using (public.is_admin());

create or replace function public.log_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or old.status is distinct from new.status then
    insert into public.verification_log (opportunity_id, from_status, to_status, source_url, actor, actor_note)
    values (new.id, case when tg_op = 'UPDATE' then old.status end, new.status, new.source_url, auth.uid(), new.verified_by);
  end if;
  return new;
end $$;
drop trigger if exists opportunities_log on public.opportunities;
create trigger opportunities_log after insert or update on public.opportunities
  for each row execute function public.log_status_change();

-- ── User data: profile and saved items (each user sees only their own) ──
create table if not exists public.profiles (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.saved_items (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  opportunity_id text not null references public.opportunities (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);
alter table public.saved_items enable row level security;
drop policy if exists "own saved" on public.saved_items;
create policy "own saved" on public.saved_items for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── API access (new tables are not exposed automatically) ────────────
grant usage on schema public to anon, authenticated;
grant select on public.opportunities to anon, authenticated;
grant insert, update, delete on public.opportunities to authenticated;
grant select on public.verification_log to authenticated;
grant select on public.admins to authenticated;
grant select, insert, update, delete on public.profiles, public.saved_items to authenticated;
