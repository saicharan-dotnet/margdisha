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

-- SAMPLE DATA, NOT VERIFIED. Generated by scripts/gen-seed-sql.ts. Run after 001_init.sql.
-- Every row is sample = true, so it is shown with an "unverified" badge and cannot be marked verified.
insert into public.opportunities (id, kind, scope, sector, title, provider, summary, criteria, details, deadline, source_url, source_label, published_on, status, sample) values
('sch-central-postmatric', 'scholarship', 'Central', null, 'Central post-matric scholarship (sample entry)', 'National Scholarship Portal', 'Illustrative entry for a centrally funded post-matric scholarship for students from lower-income families studying after Class 10.', '{"studyingAt":["inter","diploma","ug","pg"],"maxIncome":250000,"categories":["SC","ST","OBC"],"manualChecks":["Admission in a recognised institution","Not receiving another government scholarship"]}'::jsonb, '{"amount":"Placeholder: tuition + maintenance allowance","documents":["Income certificate","Caste certificate","Previous marks memo","Aadhaar","Bank passbook"],"tags":["income","category"]}'::jsonb, '2026-12-31', 'https://scholarships.gov.in', 'National Scholarship Portal', null, 'in-review', true),
('sch-ts-epass', 'scholarship', 'State', null, 'Telangana post-matric scholarship – ePASS (sample entry)', 'Government of Telangana', 'Illustrative entry for Telangana state post-matric fee reimbursement and scholarship.', '{"studyingAt":["inter","diploma","ug","pg"],"states":["Telangana"],"maxIncome":200000,"manualChecks":["Attendance and renewal conditions"]}'::jsonb, '{"amount":"Placeholder: fee reimbursement as per course","documents":["Income certificate","Caste certificate","Bonafide certificate","Aadhaar"],"tags":["state","fee reimbursement"]}'::jsonb, '2026-12-15', 'https://telanganaepass.cgg.gov.in', 'Telangana ePASS portal', null, 'draft', true),
('sch-ap-jvd', 'scholarship', 'State', null, 'Andhra Pradesh education fee support (sample entry)', 'Government of Andhra Pradesh', 'Illustrative entry for AP state fee support for students in higher education.', '{"studyingAt":["diploma","ug","pg"],"states":["Andhra Pradesh"],"maxIncome":250000,"minPercentage":0,"manualChecks":["Minimum attendance requirement"]}'::jsonb, '{"amount":"Placeholder: full fee reimbursement","tags":["state"]}'::jsonb, '2027-01-20', 'https://jnanabhumi.ap.gov.in', 'AP Jnanabhumi portal', null, 'draft', true),
('sch-merit-girls', 'scholarship', 'Private', null, 'Foundation merit scholarship for girls in STEM (sample entry)', 'Example Foundation (placeholder)', 'Illustrative private foundation scholarship for girl students in science and engineering degrees.', '{"studyingAt":["ug"],"genders":["female"],"minPercentage":75,"maxIncome":600000,"streams":["Engineering","Science","MPC","BiPC"]}'::jsonb, '{"amount":"Placeholder: ₹50,000 per year","tags":["merit","girls","STEM"]}'::jsonb, '2026-11-30', 'https://scholarships.gov.in', 'Placeholder source – replace with foundation page', null, 'draft', true),
('sch-expired-demo', 'scholarship', 'Central', null, 'Pre-matric scholarship, last cycle (sample entry, expired)', 'National Scholarship Portal', 'Illustrative expired entry, kept to show how closed opportunities are labelled.', '{"studyingAt":["class8","class10"],"maxIncome":250000}'::jsonb, '{"tags":["school"]}'::jsonb, '2026-10-15', 'https://scholarships.gov.in', 'National Scholarship Portal', null, 'in-review', true),
('job-upsc-cse', 'govt-job', 'Central', 'UPSC', 'UPSC Civil Services Examination (sample entry)', 'Union Public Service Commission', 'Illustrative entry for the civil services exam (IAS, IPS, IFS and allied services).', '{"minLevel":"ug","allowPursuing":true,"minAge":21,"maxAge":32,"ageRelaxation":{"OBC":3,"SC":5,"ST":5},"manualChecks":["Number of attempts used"]}'::jsonb, '{"salary":"Placeholder: as per pay level","selection":"Prelims → Mains → Personality test","location":"All India","vacancies":"Placeholder","tags":["UPSC","civil services"]}'::jsonb, '2027-02-18', 'https://upsc.gov.in', 'UPSC official website', null, 'in-review', true),
('job-ssc-cgl', 'govt-job', 'Central', 'SSC', 'SSC Combined Graduate Level (sample entry)', 'Staff Selection Commission', 'Illustrative entry for Group B and C posts in central ministries and departments.', '{"minLevel":"ug","minAge":18,"maxAge":32,"ageRelaxation":{"OBC":3,"SC":5,"ST":5}}'::jsonb, '{"salary":"Placeholder: pay level 4–7","selection":"Tier 1 → Tier 2 → Document verification","location":"All India","tags":["SSC"]}'::jsonb, '2027-01-10', 'https://ssc.gov.in', 'SSC official website', null, 'draft', true),
('job-ssc-chsl', 'govt-job', 'Central', 'SSC', 'SSC CHSL – 12th level posts (sample entry)', 'Staff Selection Commission', 'Illustrative entry for clerk and data-entry posts open after Intermediate.', '{"minLevel":"inter","minAge":18,"maxAge":27,"ageRelaxation":{"OBC":3,"SC":5,"ST":5}}'::jsonb, '{"salary":"Placeholder: pay level 2–4","selection":"Tier 1 → Tier 2 (skill/typing test)","location":"All India","tags":["SSC","12th pass"]}'::jsonb, '2026-12-05', 'https://ssc.gov.in', 'SSC official website', null, 'draft', true),
('job-rrb-ntpc', 'govt-job', 'Central', 'Railways', 'Railway non-technical posts (sample entry)', 'Railway Recruitment Boards', 'Illustrative entry for railway clerical, commercial and station posts.', '{"minLevel":"inter","minAge":18,"maxAge":33,"ageRelaxation":{"OBC":3,"SC":5,"ST":5}}'::jsonb, '{"salary":"Placeholder","selection":"CBT 1 → CBT 2 → Skill test → Medical","location":"All India (zone-wise)","tags":["railways"]}'::jsonb, '2026-12-20', 'https://indianrailways.gov.in', 'Indian Railways', null, 'draft', true),
('job-tspsc-group', 'govt-job', 'State', 'State PSC', 'Telangana state services recruitment (sample entry)', 'Telangana State Public Service Commission', 'Illustrative entry for state group services posts in Telangana.', '{"minLevel":"ug","minAge":18,"maxAge":44,"states":["Telangana"],"ageRelaxation":{"OBC":5,"SC":5,"ST":5},"manualChecks":["Local / non-local status rules"]}'::jsonb, '{"location":"Telangana","tags":["state PSC"]}'::jsonb, '2027-01-31', 'https://www.tspsc.gov.in', 'TSPSC official website', null, 'draft', true),
('job-apprentice', 'govt-job', 'Central', 'Apprenticeship', 'Apprenticeship for ITI / Diploma holders (sample entry)', 'Apprenticeship portal', 'Illustrative entry for paid apprenticeship training in PSUs and industries.', '{"minLevel":"class10","minAge":14,"maxAge":25,"manualChecks":["Trade / branch specified in the notice"]}'::jsonb, '{"salary":"Placeholder: monthly stipend","location":"Across India","tags":["apprenticeship"]}'::jsonb, '2026-12-10', 'https://www.apprenticeshipindia.gov.in', 'Apprenticeship India portal', null, 'draft', true),
('pvt-software-fresher', 'private-job', 'Private', 'IT & Software', 'Graduate software engineer – fresher (sample entry)', 'Example IT company (placeholder)', 'Illustrative fresher role for engineering and science graduates. Hybrid, Hyderabad.', '{"minLevel":"ug","allowPursuing":true,"streams":["Engineering","Science"],"minPercentage":60}'::jsonb, '{"salary":"Placeholder","selection":"Online test → Technical interview → HR","location":"Hyderabad","workMode":"hybrid","experience":"Fresher","tags":["IT","fresher","Hyderabad"]}'::jsonb, '2026-12-01', 'https://www.ncs.gov.in', 'Placeholder – replace with employer posting', null, 'draft', true),
('int-data-wfh', 'internship', 'Private', 'IT & Software', 'Data analysis internship – work from home (sample entry)', 'Example startup (placeholder)', 'Illustrative 3-month remote internship for students who know spreadsheets or Python.', '{"minLevel":"inter","manualChecks":["Basic Excel or Python skills"]}'::jsonb, '{"salary":"Placeholder stipend","location":"Remote","workMode":"remote","experience":"Students","tags":["remote","data"]}'::jsonb, '2026-11-25', 'https://internship.aicte-india.org', 'Placeholder – AICTE internship portal', null, 'draft', true),
('exam-jee-main', 'exam', 'Central', null, 'JEE Main (sample entry)', 'National Testing Agency', 'Illustrative entry for the national engineering entrance exam (NITs, IIITs, and JEE Advanced qualifying).', '{"minLevel":"inter","allowPursuing":true,"streams":["MPC"]}'::jsonb, '{"tags":["engineering"]}'::jsonb, '2026-12-02', 'https://jeemain.nta.nic.in', 'JEE Main – NTA', null, 'in-review', true),
('exam-neet-ug', 'exam', 'Central', null, 'NEET UG (sample entry)', 'National Testing Agency', 'Illustrative entry for the national medical entrance exam (MBBS, BDS, AYUSH).', '{"minLevel":"inter","allowPursuing":true,"streams":["BiPC"],"minAge":17}'::jsonb, '{"tags":["medical"]}'::jsonb, '2027-03-07', 'https://neet.nta.nic.in', 'NEET – NTA', null, 'in-review', true),
('exam-eapcet', 'exam', 'State', null, 'TS / AP EAPCET (sample entry)', 'State higher education councils', 'Illustrative entry for state engineering, agriculture and pharmacy entrance exams in Telangana and Andhra Pradesh.', '{"minLevel":"inter","allowPursuing":true,"streams":["MPC","BiPC"],"states":["Telangana","Andhra Pradesh"],"manualChecks":["Local area status"]}'::jsonb, '{"tags":["engineering","pharmacy"]}'::jsonb, '2027-04-15', 'https://tsche.ac.in', 'Telangana State Council of Higher Education', null, 'draft', true),
('exam-cuet', 'exam', 'Central', null, 'CUET UG (sample entry)', 'National Testing Agency', 'Illustrative entry for central university undergraduate admissions, open to all streams.', '{"minLevel":"inter","allowPursuing":true}'::jsonb, '{"tags":["all streams"]}'::jsonb, '2027-03-20', 'https://cuet.nta.nic.in', 'CUET – NTA', null, 'draft', true),
('exam-gate', 'exam', 'Central', null, 'GATE (sample entry)', 'IITs / IISc', 'Illustrative entry for postgraduate engineering admissions and PSU recruitment.', '{"minLevel":"ug","allowPursuing":true,"streams":["Engineering","Science"]}'::jsonb, '{"tags":["PG","PSU"]}'::jsonb, '2026-10-10', 'https://gate2026.iitg.ac.in', 'Placeholder – replace with current GATE site', null, 'draft', true),
('skill-pmkvy', 'skill', 'Central', null, 'Government skill training programme (sample entry)', 'Skill India', 'Illustrative entry for free short-term skill training with certification.', '{"minLevel":"class8","minAge":15,"maxAge":45}'::jsonb, '{"tags":["free","certificate"]}'::jsonb, null, 'https://www.skillindiadigital.gov.in', 'Skill India Digital', null, 'draft', true),
('abroad-germany-ms', 'abroad', 'International', null, 'Master''s in Germany – public universities (sample entry)', 'German public universities', 'Illustrative entry for tuition-free or low-fee master''s programmes, usually needing IELTS/TOEFL and a relevant bachelor''s degree.', '{"minLevel":"ug","minPercentage":60,"manualChecks":["English test score (IELTS/TOEFL)","Blocked account / proof of funds","Student visa"]}'::jsonb, '{"tags":["Germany","PG"]}'::jsonb, null, 'https://www.daad.de/en/', 'DAAD', null, 'draft', true),
('job-ibps-po', 'govt-job', 'Central', 'Banking', 'Probationary Officer – public sector banks (sample entry)', 'IBPS', 'Illustrative entry for officer-level recruitment in public sector banks.', '{"minLevel":"ug","allowPursuing":true,"minAge":20,"maxAge":30,"ageRelaxation":{"OBC":3,"SC":5,"ST":5}}'::jsonb, '{"salary":"Placeholder: as per bank scale","selection":"Prelims → Mains → Interview","location":"All India","tags":[]}'::jsonb, '2026-12-12', 'https://www.ibps.in', 'IBPS official website', null, 'draft', true),
('job-sbi-clerk', 'govt-job', 'Central', 'Banking', 'Junior Associate (clerk) – bank (sample entry)', 'State Bank of India', 'Illustrative entry for clerical posts with a local language test.', '{"minLevel":"ug","allowPursuing":true,"minAge":20,"maxAge":28,"ageRelaxation":{"OBC":3,"SC":5,"ST":5},"manualChecks":["Knowledge of the local language of the state applied for"]}'::jsonb, '{"selection":"Prelims → Mains → Local language test","location":"All India (state-wise)","tags":[]}'::jsonb, '2027-01-05', 'https://sbi.co.in/web/careers', 'SBI careers', null, 'draft', true),
('job-army-agniveer', 'govt-job', 'Central', 'Defence', 'Armed forces entry after Class 10 / 12 (sample entry)', 'Indian Army', 'Illustrative entry for soldier-level recruitment with physical and medical standards.', '{"minLevel":"class10","minAge":17,"maxAge":21,"minPercentage":45,"manualChecks":["Physical and medical standards","Marital status rules"]}'::jsonb, '{"selection":"Online exam → Physical fitness test → Medical","location":"All India","tags":[]}'::jsonb, '2027-02-28', 'https://joinindianarmy.nic.in', 'Join Indian Army', null, 'draft', true),
('job-nda', 'govt-job', 'Central', 'Defence', 'National Defence Academy (sample entry)', 'UPSC', 'Illustrative entry for officer training after Intermediate.', '{"minLevel":"inter","allowPursuing":true,"minAge":16,"maxAge":19,"manualChecks":["Unmarried","Maths & Physics in 12th for Air Force / Navy"]}'::jsonb, '{"selection":"Written exam → SSB interview → Medical","location":"All India","tags":[]}'::jsonb, '2026-12-30', 'https://upsc.gov.in', 'UPSC official website', null, 'draft', true),
('job-ts-police', 'govt-job', 'State', 'Police', 'Police constable – Telangana (sample entry)', 'Telangana State Level Police Recruitment Board', 'Illustrative entry for civil and armed reserve constable posts.', '{"minLevel":"inter","minAge":18,"maxAge":22,"states":["Telangana"],"ageRelaxation":{"OBC":5,"SC":5,"ST":5},"manualChecks":["Height and chest standards"]}'::jsonb, '{"selection":"Prelims → Physical events → Final written exam","location":"Telangana","tags":[]}'::jsonb, '2026-11-20', 'https://www.tslprb.in', 'TSLPRB official website', null, 'draft', true),
('job-ap-police', 'govt-job', 'State', 'Police', 'Sub-inspector – Andhra Pradesh (sample entry)', 'AP State Level Police Recruitment Board', 'Illustrative entry for civil sub-inspector posts.', '{"minLevel":"ug","minAge":21,"maxAge":27,"states":["Andhra Pradesh"],"ageRelaxation":{"OBC":5,"SC":5,"ST":5},"manualChecks":["Physical standards"]}'::jsonb, '{"selection":"Prelims → Physical tests → Final exam","location":"Andhra Pradesh","tags":[]}'::jsonb, '2027-01-15', 'https://slprb.ap.gov.in', 'AP SLPRB official website', null, 'draft', true),
('job-ts-dsc', 'govt-job', 'State', 'Teaching', 'Government school teacher recruitment – Telangana (sample entry)', 'School Education Department, Telangana', 'Illustrative entry for school assistant and secondary grade teacher posts. Needs B.Ed / D.El.Ed and a TET pass.', '{"minLevel":"ug","minAge":18,"maxAge":46,"states":["Telangana"],"manualChecks":["B.Ed or D.El.Ed completed","TET qualified"]}'::jsonb, '{"selection":"Written test (with TET weightage)","location":"Telangana","tags":[]}'::jsonb, '2026-12-22', 'https://schooledu.telangana.gov.in', 'School Education, Telangana', null, 'draft', true),
('job-kvs', 'govt-job', 'Central', 'Teaching', 'Central school teachers (sample entry)', 'Kendriya Vidyalaya Sangathan', 'Illustrative entry for TGT / PGT / PRT posts in central schools.', '{"minLevel":"ug","maxAge":40,"manualChecks":["B.Ed","CTET for PRT / TGT"]}'::jsonb, '{"location":"All India","tags":[]}'::jsonb, '2027-01-25', 'https://kvsangathan.nic.in', 'KVS official website', null, 'draft', true),
('job-psu-gate', 'govt-job', 'Central', 'PSU', 'Engineer trainee through GATE – PSUs (sample entry)', 'Public sector undertakings', 'Illustrative entry for engineering PSUs that shortlist using GATE scores.', '{"minLevel":"ug","allowPursuing":true,"streams":["Engineering"],"minPercentage":65,"maxAge":28,"ageRelaxation":{"OBC":3,"SC":5,"ST":5}}'::jsonb, '{"selection":"GATE score → Group discussion / Interview","location":"All India","tags":[]}'::jsonb, '2027-02-10', 'https://dpe.gov.in', 'Department of Public Enterprises', null, 'draft', true),
('job-appsc-group2', 'govt-job', 'State', 'State PSC', 'Andhra Pradesh state services recruitment (sample entry)', 'Andhra Pradesh Public Service Commission', 'Illustrative entry for executive and non-executive state posts.', '{"minLevel":"ug","minAge":18,"maxAge":42,"states":["Andhra Pradesh"],"ageRelaxation":{"OBC":5,"SC":5,"ST":5}}'::jsonb, '{"location":"Andhra Pradesh","tags":[]}'::jsonb, '2026-11-12', 'https://psc.ap.gov.in', 'APPSC official website', null, 'draft', true),
('job-anganwadi', 'govt-job', 'State', 'Departments', 'Women & child welfare field posts (sample entry)', 'State women & child welfare department', 'Illustrative district-level posts for local women candidates.', '{"minLevel":"class10","genders":["female"],"minAge":21,"maxAge":35,"manualChecks":["Resident of the same village / ward"]}'::jsonb, '{"location":"District-wise","tags":[]}'::jsonb, '2026-11-18', 'https://wcd.nic.in', 'Ministry of Women & Child Development', null, 'draft', true),
('pvt-bpo-telugu', 'private-job', 'Private', 'Customer Support', 'Customer support executive – Telugu & English (sample entry)', 'Example services company (placeholder)', 'Illustrative fresher role for graduates comfortable speaking Telugu and English.', '{"minLevel":"inter","minAge":18,"manualChecks":["Spoken Telugu and English"]}'::jsonb, '{"salary":"Placeholder","location":"Hyderabad / Vijayawada","workMode":"onsite","experience":"Fresher","tags":[]}'::jsonb, '2026-12-08', 'https://www.ncs.gov.in', 'Placeholder – replace with employer posting', null, 'draft', true),
('pvt-pharma-qc', 'private-job', 'Private', 'Healthcare', 'Quality control chemist (sample entry)', 'Example pharma company (placeholder)', 'Illustrative role for B.Sc Chemistry / B.Pharm graduates in a pharma plant.', '{"minLevel":"ug","streams":["Science","Medical"],"minPercentage":55}'::jsonb, '{"salary":"Placeholder","location":"Visakhapatnam","workMode":"onsite","experience":"0–2 years","tags":[]}'::jsonb, '2026-12-18', 'https://www.ncs.gov.in', 'Placeholder – replace with employer posting', null, 'draft', true),
('pvt-accounts', 'private-job', 'Private', 'Banking & Finance', 'Junior accountant – work from home (sample entry)', 'Example accounting firm (placeholder)', 'Illustrative remote role for B.Com graduates with Tally or Excel skills.', '{"minLevel":"ug","streams":["Commerce","MEC","CEC"],"manualChecks":["Tally / Excel"]}'::jsonb, '{"salary":"Placeholder","location":"Remote","workMode":"remote","experience":"Fresher","tags":[]}'::jsonb, '2026-12-03', 'https://www.ncs.gov.in', 'Placeholder – replace with employer posting', null, 'draft', true),
('pvt-diploma-tech', 'private-job', 'Private', 'Manufacturing', 'Production technician – diploma (sample entry)', 'Example manufacturer (placeholder)', 'Illustrative shop-floor role for mechanical / electrical diploma holders.', '{"minLevel":"diploma","minAge":18,"maxAge":28}'::jsonb, '{"salary":"Placeholder","location":"Sri City","workMode":"onsite","experience":"Fresher","tags":[]}'::jsonb, '2026-12-26', 'https://www.ncs.gov.in', 'Placeholder – replace with employer posting', null, 'draft', true),
('pvt-senior-dev', 'private-job', 'Private', 'IT & Software', 'Senior backend developer (sample entry)', 'Example product company (placeholder)', 'Illustrative role for experienced professionals looking to grow into tech lead.', '{"minLevel":"ug","streams":["Engineering","Science"],"manualChecks":["4+ years of backend experience"]}'::jsonb, '{"salary":"Placeholder","location":"Bengaluru","workMode":"hybrid","experience":"4–8 years","tags":[]}'::jsonb, '2027-01-08', 'https://www.ncs.gov.in', 'Placeholder – replace with employer posting', null, 'draft', true),
('pvt-sales', 'private-job', 'Private', 'Sales & Marketing', 'Field sales associate (sample entry)', 'Example consumer brand (placeholder)', 'Illustrative entry-level sales role with travel within the district.', '{"minLevel":"inter","minAge":18,"maxAge":30,"manualChecks":["Two-wheeler and licence"]}'::jsonb, '{"salary":"Placeholder + incentives","location":"Warangal","workMode":"onsite","experience":"Fresher","tags":[]}'::jsonb, '2026-11-28', 'https://www.ncs.gov.in', 'Placeholder – replace with employer posting', null, 'draft', true),
('int-marketing', 'internship', 'Private', 'Sales & Marketing', 'Digital marketing internship (sample entry)', 'Example startup (placeholder)', 'Illustrative 2-month remote internship for any-stream students.', '{"minLevel":"inter"}'::jsonb, '{"salary":"Placeholder stipend","location":"Remote","workMode":"remote","experience":"Students","tags":[]}'::jsonb, '2026-11-22', 'https://internship.aicte-india.org', 'Placeholder – AICTE internship portal', null, 'draft', true)
on conflict (id) do nothing;
