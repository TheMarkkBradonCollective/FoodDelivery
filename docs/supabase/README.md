# Supabase

## Database setup

For [food-deliverytest.vercel.app](https://food-deliverytest.vercel.app/), run these in the Supabase SQL Editor, in order:

1. **`complete-schema.sql`** — tables, policies, marketplace seed, and staff. Idempotent.
2. **`founders.sql`** — adds Markeith White and Emmanuel Cury as founders (`role = founder`).

Staff positions are `support`, `moderator`, `administrator`, `manager`, `director`, and `founder`. Any of those, plus generic `staff`, can open Portr Command.

`schema.sql` is the older one-shot script (schema + founders together).

If you already ran an older schema, you can also run **`marketplace.sql`**, **`staff-chat.sql`**, and **`staff-rls.sql`** by themselves.

## Founder accounts (permanent)

Portr is at [portr.com](https://portr.com). Sign in on the Portr Command Portal. Password until you change it: **`RunrTest2026!`**

| Name | Login | Company |
|------|--------|---------|
| Markeith White | `markkisstickz96@gmail.com` | `markeith@portr.com` |
| Emmanuel Cury | `ecurry@portr.com` | `ecurry@portr.com` |

Change the password in Supabase → Authentication after sign-in.

## Dev test accounts (optional)

Password: **`RunrTest2026!`** — remove the test block in `schema.sql` before production launch.

| Email | App |
|-------|-----|
| `porter@test.portr.com` | Portr |
| `runr@test.portr.com` | Portr Runner |
| `vendr@test.portr.com` | Portr Vendor |
| `staff@portr.com` | Portr Command |

Each test account only works in its matching app (role is enforced at sign-in).
