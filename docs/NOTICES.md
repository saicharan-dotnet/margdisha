# Automatic notices from official websites

Every 6 hours a free GitHub Actions job (`.github/workflows/notices.yml`) reads official websites
(SSC, UPSC, RRB, IBPS, SBI, RBI, TGPSC, APPSC, Army, India Post, NTA, Navodaya, Sainik/AISSEE,
KVS, Rashtriya Military Schools, NESTS/EMRS, TGCET, NSP) and saves the title and link of each new
notice in the `official_notices` table. The list of sites is in `src/notices/sources.ts`.

- The public site shows these under "Latest from official websites", clearly marked as **not checked**.
- Admins see them in **Admin → Notices inbox**. "Create listing" opens the listing form already filled
  with the title, organisation and official link (as a draft). "Ignore" hides a notice everywhere.
- Nothing becomes a verified listing automatically. Eligibility, dates and fees still come from the
  notification, through the normal verification step.

## One-time setup

1. Supabase → SQL Editor: run `supabase/setup-002.sql` (adds the notices table and school admissions).
2. Supabase → Project Settings → API Keys: copy the **secret** key (`sb_secret_…`).
3. GitHub → the `margdisha` repo → Settings → Secrets and variables → Actions → New repository secret.
   Name: `SUPABASE_SECRET_KEY`, value: the secret key. Never put this key in the code or in chat.
4. GitHub → Actions → "Collect official notices" → Run workflow. The run summary shows, for each site,
   how many notices were found and how many were new.

## Sites that block servers outside India

UPSC, the RRBs, Navodaya, the Army, the PSCs, TGCET and others time out for GitHub's servers, which are
outside India. Those sources are marked `india: true` in `src/notices/sources.ts`, and the collector
asks a Supabase Edge Function (`collect-notices`) to read them from Supabase's Mumbai region
(`x-region: ap-south-1`). The function keeps no key of its own: it checks that the caller's key can
write notices, then uses it for the inserts.

One-time setup for the function:

1. Supabase → your account (top right) → Access Tokens → Generate new token. Copy it.
2. GitHub → margdisha → Settings → Secrets and variables → Actions → New repository secret.
   Name: `SUPABASE_ACCESS_TOKEN`, value: that token.
3. GitHub → Actions → "Deploy Supabase function" → Run workflow. It also redeploys by itself whenever
   `src/notices` changes.

Until the function is deployed, blocked sites are tried directly from GitHub (and usually fail).
The function's code is built from `src/notices` by `npm run fn:build` into
`supabase/functions/collect-notices/index.ts`. That single file can also be pasted into the
Supabase dashboard (Edge Functions → Deploy a new function, name `collect-notices`, turn off
"Verify JWT").

## Notes

- Without the secret the job still runs and prints what it found, but saves nothing.
- Some government sites block or time out for overseas servers (GitHub's runners are outside India), or
  load their notices with JavaScript. The run summary shows which sites failed. Those can be watched
  by hand, or given a different page address in `src/notices/sources.ts`.
- To run it locally: `SUPABASE_SECRET_KEY=… npm run notices` (or without the key for a dry run).
