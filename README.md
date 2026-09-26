# Porter

**Pick Your Place. Run Your Time.**

Monorepo for the Porter coverage-driven delivery marketplace.

## What's in this repo

| Path | Purpose |
|------|---------|
| **`apps/website`** | **Main company website** — downloads, company info, how we operate |
| `apps/porter` | Porter customer Android app |
| `apps/fastfood` | **FastFood** — Porter customer app with a red/yellow color change |
| `apps/runr` | Porter Runner delivery Android app |
| `apps/vendr` | Porter Vendor business Android app |
| `apps/staff` | Porter Command ops Android app — orders, coverage, users, chat |
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
| `/login` | Sign in — app users (Porter / Porter Runner / Porter Vendor) or staff |
| `/account` | Billing, profile, preferences, and ratings for Porter / Porter Runner / Porter Vendor |
| `/staff` | Porter Command marketplace ops (also in the Porter Command app) |

Sign-in uses Supabase. Run `docs/supabase/schema.sql` in the SQL Editor to create profiles, marketplace tables, and seed restaurants. After that, Porter, Porter Runner, Porter Vendor, and Porter Command load live data (orders, runs, coverage, menus).

## The Porter app family

| App | Role | Tagline |
|-----|------|---------|
| **Porter** | Customer | Get what you need. |
| **Porter Runner** | Delivery | Pick it up. Run it there. |
| **Porter Vendor** | Business | Sell. Manage. Grow. |
| **Porter Command** | Ops | Run the marketplace. |

> Porter creates the demand. Porter Vendor fulfills the business side. Porter Runner moves it.

## Build & distribute APKs

All four apps ship as **signed Capacitor APKs** with the Next.js UI bundled inside the APK (`assetPrefix: './'`). No Vercel or external website is required to run the apps.

```bash
npm run build:apks       # Build signed release APKs
npm run publish:apk      # Copy to release/apks/* and release/latest/ + version.json
npm run release:apk      # Build, publish, and create GitHub Releases
```

Versioned APKs live under `release/apks/<app>/`; current builds are also at `release/latest/<app>.apk` (tracked in git). Listed in the **MBC App Store**:

- [Porter](https://themarkkbradoncollective.github.io/main/download/#download-porter)
- [Porter Runner](https://themarkkbradoncollective.github.io/main/download/#download-runr)
- [Porter Vendor](https://themarkkbradoncollective.github.io/main/download/#download-vendr)
- [Porter Command](https://themarkkbradoncollective.github.io/main/download/#download-staff)

The company website (`apps/website`) links to the MBC App Store for installs. GitHub Releases provide direct APK downloads as a fallback.

## Deploy the website (optional marketing site)

Build static export:

```bash
npm run build:website
```

Output: `apps/website/out/` — deploy to any static host for company info and login. **APK installs are handled by the MBC App Store**, not the website.

## License

Private — The Markk Brandon Collective
