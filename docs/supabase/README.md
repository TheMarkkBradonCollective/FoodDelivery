# Supabase

## Database setup

For [food-deliverytest.vercel.app](https://food-deliverytest.vercel.app/), run these in the Supabase SQL Editor, in order:

1. **`complete-schema.sql`** — tables, policies, marketplace seed, and staff (role, Porter Command access, staff chat, `staff@runr.com`). Idempotent.
2. **`founders.sql`** — adds Markeith White and Emmanuel Cury as founders. Staff already exists; this only creates their accounts with `role = 'staff'` and `is_founder = true`.

`schema.sql` is the older one-shot script (schema + founders together).

If you already ran an older schema, you can also run **`marketplace.sql`**, **`staff-chat.sql`**, and **`staff-rls.sql`** by themselves.

## Founder accounts (permanent)

One staff account per founder. **Sign in with the personal Gmail** on the Porter Command Portal until `@runr.com` mail is set up. Both emails live on the same profile. Password until you change it: **`RunrTest2026!`**

| Name | Login (personal) | Company |
|------|------------------|---------|
| Markeith White | `markkisstickz96@gmail.com` | `markeith@runr.com` |
| Emmanuel Cury | `immanuelcurry@gmail.com` | `emmanuel@runr.com` |

Change the password in Supabase → Authentication after sign-in.

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
