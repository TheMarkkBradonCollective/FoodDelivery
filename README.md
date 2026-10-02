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

Sign-in uses Supabase. The website and apps default to the Portr project (`https://gonsvtgsocjaykrmtmpz.supabase.co`); set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to point a build at another project. Run `docs/supabase/complete-schema.sql` in the SQL Editor, then `docs/supabase/founders.sql`, to create profiles, staff, marketplace tables, and the founder accounts. After that, Portr, Portr Runner, Portr Vendor, and Portr Command load live data (orders, runs, coverage, menus).

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
