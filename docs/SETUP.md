# Prerequisites and running cost (target: ₹0)

Free-tier limits change. Check each provider's current pricing page when you sign up.

| Need | Free choice | Free limits (approx.) | When you would pay |
|---|---|---|---|
| Code hosting | GitHub (free account) | Unlimited public/private repos | Never for this project |
| Website hosting | Cloudflare Pages | Unlimited bandwidth, commercial use allowed | Not expected |
| Free web address | `nextstep.pages.dev` (from Cloudflare) | — | — |
| Database | Supabase free plan (PostgreSQL) | ~500 MB DB, 1 GB file storage; pauses after 7 days with no activity | Pro plan (~$25/month) once traffic or data grows |
| Sign-in | Supabase Auth (email link / OTP, Google sign-in) | ~50,000 monthly users | SMS OTP costs per message, so skip it at first |
| Scheduled jobs (source watcher, deadline reminders, keep DB awake) | GitHub Actions cron | Unlimited minutes on a public repo, ~2,000 min/month on a private repo | Not expected |
| Email reminders | Brevo (~300/day) or Resend (~100/day) free plans | — | Paid plan above the daily limit |
| Analytics | Cloudflare Web Analytics | Free, no cookies | — |
| Error tracking | Sentry free plan | ~5,000 errors/month | — |
| AI extraction of notification PDFs | Manual entry by admins, or Gemini API free tier | Rate-limited | Paid API at scale |

## Only real cost: a custom domain (optional)

- `.in` costs roughly ₹500–900 for the first year, plus a renewal of a similar amount. `.com` costs roughly ₹800–1,200 a year.
- Buy it at the Cloudflare Registrar (at-cost pricing, `.com` only), or at an Indian registrar for `.in`.
- You can launch on `nextstep.pages.dev` for free and add a domain later without changing the code.

## Accounts to create (all free)

1. GitHub: create an empty repo, e.g. `nextstep-platform` (public keeps GitHub Actions unlimited).
2. Cloudflare: connect the GitHub repo to Pages (build command `npm run build`, output folder `dist`).
3. Supabase: create a project in the Mumbai region; copy the project URL and anon key into Cloudflare Pages environment variables.
4. Optional: Brevo or Resend for email, and Sentry for errors.

Avoid Vercel's Hobby plan if the site will ever show ads or charge money, because its terms limit it to non-commercial use.
