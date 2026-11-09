# Architecture and phased plan

## Principles

1. **Never present unverified information as confirmed.** Every item carries a verification
   status, an official source link, a publication date and a last-verified date. The public
   site shows only `verified` items; sample/demo data is always badged.
2. **Explain every result.** Matching returns a reason for each condition and lists missing
   profile fields. Results are guidance, never a guarantee.
3. **Simple for everyone.** Mobile first, plain language, three languages, works on low-end phones.

## Eligibility engine (`src/engine/match.ts`)

Each opportunity has structured `Criteria` (min qualification, studying-at level, streams, marks,
income, age with category relaxation, states, categories, gender) plus free-text `manualChecks`.

| Outcome | Rule |
|---|---|
| Not eligible | any checkable condition fails |
| Needs verification | nothing fails, but the profile lacks data needed for a condition |
| Likely eligible | every checkable condition passes; manual checks are still listed |

Deadlines past today mark the item **Expired** and sort it last. Pure function, unit tested.

## Target stack (phase 2+)

| Layer | Choice | Why |
|---|---|---|
| Web | React + TypeScript (current), move to Next.js for SEO/SSR of public pages | Search engines must index exam and scholarship pages |
| API | Node (NestJS or Next route handlers) | Same language as the engine; engine is reused server-side |
| DB | PostgreSQL (+ Prisma) | Relational data: opportunities, criteria, sources, reviews, users |
| Search | Postgres full-text first, Meilisearch/OpenSearch later | |
| Auth | Phone OTP + email (many students have no email) | |
| Jobs | Scheduled workers for deadline reminders and expiry | |
| Notifications | Email, SMS/WhatsApp, web push | |
| i18n | Message catalogues per language; content translations stored per field with their own review status | |
| Hosting | Any managed Postgres + container host; CDN for static | |

### Core data model

- `opportunity` (kind, title, provider, scope, summary, amounts, dates, status)
- `criteria` (structured rules, one row per opportunity version)
- `source` (url, label, published_on) and `verification` (reviewer, checked_on, notes) — append-only audit log
- `pathway`, `course`, `career`, `skill`, `institution`, `exam`
- `user`, `profile`, `saved_item`, `reminder`
- `translation` (entity, field, lang, text, status)

## Phases

1. **MVP (this repo now)** — what-next explorer, profile, matching with explanations, dashboard,
   admin verification workflow, EN/TE/HI UI, sample data. Browser storage only.
2. **Backend + real data** — Postgres API, sign-in, admin roles and audit log, data entry of the
   first verified set (central + Telangana + AP scholarships, major exams, UPSC/SSC/RRB/bank/state PSC),
   deadline reminders, public SEO pages.
3. **Guidance depth** — career assessment questionnaire, career roadmaps with progress, skills and
   certification recommendations, course and college comparison.
4. **Jobs and abroad** — private job and internship feeds (partner APIs / employer posting),
   experienced-professional growth paths, study-abroad country guides and visa checklists.
5. **Scale** — more states and languages, mobile app / PWA offline, analytics and reports for admins.
