# RUNR Platform

**Pick Your Place. Run Your Time.**

Monorepo for the RUNR coverage-driven delivery marketplace.

## What's in this repo

| Path | Purpose |
|------|---------|
| **`apps/website`** | **Main company website** — downloads, company info, how we operate |
| `apps/porter` | PORTER customer Android app |
| `apps/runr` | RUNR delivery Android app |
| `apps/staff` | STAFF ops Android app — orders, coverage, users, chat |
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
| `/login` | Sign in — app users (PORTER/RUNR/VENDR) or staff |
| `/account` | Billing, profile, preferences, and ratings for PORTER / RUNR / VENDR |
| `/staff` | Staff-only marketplace ops (also in the STAFF app) |

Sign-in uses Supabase. Run `docs/supabase/schema.sql` in the SQL Editor to create profiles, marketplace tables, and seed restaurants. After that, PORTER/RUNR/VENDR/STAFF load live data (orders, RUNs, coverage, menus).

## The 3-App Ecosystem

| App | Role | Tagline |
|-----|------|---------|
| **PORTER** | Customer | Get what you need. |
| **RUNR** | Delivery | Pick it up. Run it there. |
| **STAFF** | Ops | Run the marketplace. |

> PORTER creates the demand. VENDR fulfills the business side. RUNR moves it.

## Build & distribute APKs

All three apps ship as **signed Capacitor APKs** with the Next.js UI bundled inside the APK (`assetPrefix: './'`). No Vercel or external website is required to run the apps.

```bash
npm run build:apks       # Build signed release APKs
npm run publish:apk      # Copy to release/ + write version.json
npm run release:apk      # Build, publish, and create GitHub Releases
```

APKs live in `release/` and are listed in the **MBC App Store**:

- [PORTER](https://themarkkbradoncollective.github.io/main/download/#download-porter)
- [RUNR](https://themarkkbradoncollective.github.io/main/download/#download-runr)
- [VENDR](https://themarkkbradoncollective.github.io/main/download/#download-vendr)

The company website (`apps/website`) links to the MBC App Store for installs. GitHub Releases provide direct APK downloads as a fallback.

## Deploy the website (optional marketing site)

Build static export:

```bash
npm run build:website
```

Output: `apps/website/out/` — deploy to any static host for company info and login. **APK installs are handled by the MBC App Store**, not the website.

## License

Private — The Markk Brandon Collective
