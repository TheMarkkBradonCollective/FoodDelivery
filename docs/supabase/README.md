# Supabase

## Database setup

Run **`schema.sql`** in the Supabase SQL Editor whenever you need to create or refresh the database. The script is **idempotent** — safe to re-run after schema changes.

## Founder accounts (permanent)

One staff account per founder. **Sign in with your personal Gmail** until `@runr.com` mail is set up. Both emails live on the same profile.

| Name | Login (personal) | Company |
|------|------------------|---------|
| Markeith White | `Markkisstickz96@gmail.com` | `markeith@runr.com` |
| Immanuel Curry | `Immanuelcurry@gmail.com` | `immanuel@runr.com` |

Set your password in `schema.sql` (`upsert_runr_founder` calls) before first run. Change it in Supabase → Authentication after sign-in.

When `@runr.com` inboxes are ready, switch the auth email to your company address in Supabase → Authentication → Users.

## Dev test accounts (optional)

Password: **`RunrTest2026!`** — remove the test block in `schema.sql` before production launch.

| Email | App |
|-------|-----|
| `porter@test.runr.com` | PORTER |
| `runr@test.runr.com` | RUNR |
| `vendr@test.runr.com` | VENDR |
| `staff@runr.com` | Staff portal |

Each test account only works in its matching app (role is enforced at sign-in).
