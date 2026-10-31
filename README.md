# Portr

**Pick Your Place. Run Your Time.**

Monorepo for the Portr coverage-driven delivery marketplace. The product lives at [portr.com](https://portr.com).

## What's in this repo

| Path | Purpose |
|------|---------|
| **`apps/website`** | **Main company website** — downloads, company info, how we operate |
| `apps/porter` | Portr customer Android app |
| `apps/fastfood` | **FastFood** — Portr customer app with a red/yellow color change |
| `apps/runr` | Portr Runner delivery Android app |
| `apps/vendr` | Portr Vendor business Android app |
| `apps/staff` | Portr Command ops Android app — orders, coverage, users, chat |
| `packages/shared` | Shared marketplace logic, UI, coverage engine |

## Quick start — Company website

```bash
npm install
npm run dev          # http://localhost:3000
npm run build:website
```

The marketing site includes APK download links, ecosystem overview, company information, and **unified web login**:

| Route | Purpose |
|-------|---------|
| `/login` | Sign in — app users (Portr / Portr Runner / Portr Vendor) or staff |
| `/account` | Billing, profile, preferences, and ratings for Portr / Portr Runner / Portr Vendor |
| `/staff` | Portr Command marketplace ops (also in the Portr Command app) |

Sign-in uses the Portr API (`NEXT_PUBLIC_API_URL`). When that variable is unset, apps run in **demo mode** with local preview catalog data. Set `NEXT_PUBLIC_API_URL` to your Cloudflare Worker URL for live orders, runs, coverage, and menus.

## Neon Postgres + Cloudflare backend

| Component | Path | Purpose |
|-----------|------|---------|
| **Schema** | `db/schema.sql` | Plain Postgres tables (profiles include `password_hash`) |
| **Migration** | `db/migrate-from-supabase.mjs` | Copy data from Supabase (`SUPABASE_DB_URL` → `DATABASE_URL`) |
| **API** | `apps/api` | Cloudflare Worker (Hono + Neon + R2) |
| **Website** | `apps/website/out` | Static export → Cloudflare Pages |

### Environment variables

See `.env.example`. Never commit secrets.

| Variable | Where |
|----------|--------|
| `DATABASE_URL` | Neon — API Worker secret (`wrangler secret put DATABASE_URL`) |
| `JWT_SECRET` | API Worker secret |
| `NEXT_PUBLIC_API_URL` | Website + Capacitor/Next apps (public API base URL) |
| `SUPABASE_DB_URL` | One-time migration only |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | GitHub Actions preview deploy |

### Local setup

```bash
# Apply schema on Neon
psql "$DATABASE_URL" -f db/schema.sql

# API (requires .dev.vars with DATABASE_URL and JWT_SECRET — gitignored)
npm install
npm run dev -w @porter/api

# Website pointed at local wrangler dev (default port 8787)
NEXT_PUBLIC_API_URL=http://127.0.0.1:8787 npm run dev:website
```

### Preview deploy (GitHub Actions)

Workflow: `.github/workflows/deploy-cloudflare.yml` on branch `neon-cloudflare`.

- Worker: `wrangler deploy --env preview` (not production)
- Pages: `wrangler pages deploy out --branch preview`

Repository secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`. Optional `PREVIEW_API_URL` for the website build. Set Worker secrets in Cloudflare: `DATABASE_URL`, `JWT_SECRET`.

Create R2 bucket `portr-files` and bind `FILES` (see `apps/api/wrangler.toml`).

### Migrate from Supabase

```bash
cd db && npm install
SUPABASE_DB_URL=... DATABASE_URL=... npm run migrate-from-supabase
```

Copies all public tables and merges bcrypt hashes from `auth.users` into `profiles.password_hash` when readable.

---

Sign-in previously used Supabase; production cutover uses the API above. Run `docs/supabase/*.sql` only for legacy Supabase projects.

## The Portr app family

| App | Role | Tagline |
|-----|------|---------|
| **Portr** | Customer | Get what you need. |
| **Portr Runner** | Delivery | Pick it up. Run it there. |
| **Portr Vendor** | Business | Sell. Manage. Grow. |
| **Portr Command** | Ops | Run the marketplace. |

> Portr creates the demand. Portr Vendor fulfills the business side. Portr Runner moves it.

## Build & distribute APKs

All four apps ship as **signed Capacitor APKs** with the Next.js UI bundled inside the APK (`assetPrefix: './'`). No Vercel or external website is required to run the apps.

```bash
npm run build:apks       # Build signed release APKs
npm run publish:apk      # Copy to release/apks/* and release/latest/ + version.json
npm run release:apk      # Build, publish, and create GitHub Releases
```

Versioned APKs live under `release/apks/<app>/`; current builds are also at `release/latest/<app>.apk` (tracked in git). Listed in the **MBC App Store**:

- [Portr](https://themarkkbradoncollective.github.io/main/download/#download-porter)
- [Portr Runner](https://themarkkbradoncollective.github.io/main/download/#download-runr)
- [Portr Vendor](https://themarkkbradoncollective.github.io/main/download/#download-vendr)
- [Portr Command](https://themarkkbradoncollective.github.io/main/download/#download-staff)

The company website (`apps/website`) links to the MBC App Store for installs. GitHub Releases provide direct APK downloads as a fallback.

## Deploy the website (optional marketing site)

Build static export:

```bash
npm run build:website
```

Output: `apps/website/out/` — deploy to any static host for company info and login. **APK installs are handled by the MBC App Store**, not the website.

## License

Private — The Markk Brandon Collective
