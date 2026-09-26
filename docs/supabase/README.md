# Supabase

## Database setup

Run **`schema.sql`** in the Supabase SQL Editor whenever you need to create or refresh the database. The script is **idempotent** — safe to re-run after schema changes.

It creates:

- Auth profiles + founder/test accounts
- Marketplace: businesses, menus, coverage rules, orders, RUNs, deliveries, earnings, notifications, favorites, staff ops chat
- Seed vendors owned by `vendr@test.runr.com` (Tony's Pizza, Golden Gate Burgers, Mission Tacos)

If you already ran an older schema, you can also run **`marketplace.sql`**, **`staff-chat.sql`**, and **`staff-rls.sql`** by themselves.

## Founder accounts (permanent)

Run **`founders.sql`** to create founder accounts only (self-contained — includes the function).

Or run the full **`schema.sql`** for everything (founders + dev test accounts).

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
| `porter@test.runr.com` | Porter |
| `runr@test.runr.com` | Porter Runner |
| `vendr@test.runr.com` | Porter Vendor |
| `staff@runr.com` | Porter Command |

Each test account only works in its matching app (role is enforced at sign-in).
