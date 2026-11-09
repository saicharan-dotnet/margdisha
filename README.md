# MargDisha — education, career & opportunities platform

Answers one question for students, graduates and job seekers in India:
**"I have completed my education. What can I do next?"**

> ⚠ Phase 1 MVP. All opportunity and pathway data in `src/data/seed.ts` is **sample data that
> has not been verified**. It must go through the admin verification workflow, with a real
> official notification, before it is shown as confirmed.

## Run

```bash
npm install
npm run dev          # local dev server
npm test             # eligibility engine tests
npm run build        # production build → dist/
npm run build:single # one self-contained HTML file → dist-single/ (shareable demo)
```

## What's in phase 1

- **What next? explorer** — pick a qualification (and Intermediate stream) to see courses, duration, eligibility, careers and entrance exams.
- **Profile** — qualification (completed / studying), stream, marks, age, state, category, gender, income, skills, interests, goal.
- **Matching** — scholarships, government jobs, private jobs, internships, exams, skills and study-abroad items grouped into **Likely eligible / Needs verification / Not eligible**, with the reason for every condition and the missing profile fields.
- **Dashboard** — next step, counts, upcoming deadlines, saved items.
- **Admin verification** — draft → in-review → verified (published) / rejected. Publishing needs an https notification link, publication date, reviewer name and confirmation that details match. Last-verified date is shown on cards.
- **Languages** — English, Telugu, Hindi UI strings (Telugu/Hindi need native-speaker review).

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the architecture and phase plan.
