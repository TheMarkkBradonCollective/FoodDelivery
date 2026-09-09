# Supabase

## Database setup

Run **`schema.sql`** in the Supabase SQL Editor whenever you need to create or refresh the database:

- `profiles` table + RLS policies
- Sign-up trigger (auto-creates profile rows)
- Test accounts for PORTER, RUNR, VENDR, and staff

The script is **idempotent** — safe to re-run after schema changes.

## Test logins

Password for every account: **`RunrTest2026!`**

| Email | App |
|-------|-----|
| `porter@test.runr.com` | PORTER |
| `runr@test.runr.com` | RUNR |
| `vendr@test.runr.com` | VENDR |
| `staff@runr.com` | Staff portal |

Each account only works in its matching app (role is enforced at sign-in).
