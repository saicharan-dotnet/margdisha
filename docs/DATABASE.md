# Database (Supabase)

## One-time setup

1. **Create the tables.** In Supabase, open **SQL Editor → New query**, paste the whole of
   [`supabase/setup-all.sql`](../supabase/setup-all.sql), and click **Run**. This creates the
   tables and security rules, then loads the sample data (every row is marked as sample and unverified).
2. **Set the sign-in URLs.** Go to **Authentication → URL Configuration**:
   - Site URL: `https://margdisha.com`
   - Redirect URLs: `https://margdisha.com/**`, `https://www.margdisha.com/**`, `https://margdisha.pages.dev/**`
3. **Make yourself admin.** Sign in once on the site (My profile → Send sign-in link), then run:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'YOUR-EMAIL@example.com';
   ```
   Refresh the site and the Admin link appears in the top bar.

## Security model

| Table | Who can read | Who can write |
|---|---|---|
| `opportunities` | Everyone: verified items, plus sample items that aren't rejected (always badged). Admins: everything | Admins only |
| `verification_log` | Admins | Written automatically by a trigger on every status change |
| `profiles`, `saved_items` | Only the owner | Only the owner |
| `admins` | Admins, plus each user's own row | SQL editor only |

Database rules that can't be bypassed from the browser:
- An item cannot become `verified` while `sample = true`.
- An item cannot be verified without an `https://` source link, a publication date and a reviewer name.
- `last_verified_on` is set by the database, not the browser.

The publishable key in `src/lib/supabase.ts` is public by design. Never put the secret / service-role key in the code.

## Regenerating the sample seed

`npm run db:seed-sql` writes `supabase/seed.sql` from `src/data/seed*.ts`.
