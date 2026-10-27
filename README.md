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
| `apps/api` | **Portr API**: Vercel route handlers on Google Sheets (data), with Drive for photos/videos |
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

Data lives in a **Google Sheet** behind a small **Vercel API** (`apps/api`). The apps and website are static exports that call `NEXT_PUBLIC_API_URL`; all Google keys stay in the API's Vercel env vars. With no `NEXT_PUBLIC_API_URL`, builds run in offline **demo mode**.

## Demo / offline mode

If `NEXT_PUBLIC_API_URL` is unset at build time, the apps build in **demo mode**:
- Any email and password signs you in as a demo user for that app (customer, runner, vendor, staff).
- The bundled seed catalog (`packages/shared/src/data/demo-catalog.ts`) loads, with no network calls.
- Orders, runs, deliveries, and messages persist on-device in localStorage.

Force a mode with `NEXT_PUBLIC_PORTR_MODE=demo` or `NEXT_PUBLIC_PORTR_MODE=live`. `npm run build:apks` (signed release) defaults to `live`.

Debug demo APK for one app: `cd apps/<app> && npx next build && npx cap sync android && cd android && ./gradlew assembleDebug`.

## Backend: Google Sheets + Vercel API (`apps/api`)

**Spreadsheet:** the shared TMBC Apps Database, `1jjv832cA9Y4weW2bRnRpQs8TkHHKIGzLNZWTkiQ6H74` (`GOOGLE_SHEET_ID`, configurable). Tabs are named `<TAB_PREFIX> - <table>` (default `FoodDelivery - orders`). Tabs without the prefix belong to other apps and are never touched.

**Tabs** (created by the setup script at exactly their column count and about 100 rows, because the file's 10M-cell limit is shared; the API appends rows as it grows): profiles, businesses, menu_items, coverage_rules, orders, runs, deliveries, earnings, notifications, favorites, staff_messages, plus `meta`, which holds the last-write time used for polling.

**Setup:**
1. In Google Cloud, create a service account, enable the Sheets and Drive APIs, and share the Sheet with the service account's email as **Editor**.
2. For uploads, create an OAuth "Desktop app" client. Run `GOOGLE_OAUTH_CLIENT_ID=… GOOGLE_OAUTH_CLIENT_SECRET=… npm run drive:token -w apps/api -- --create-folder` and sign in as themarkkbrandoncollective@gmail.com. Copy the printed refresh token and folder ID into Vercel. Never commit them.
3. Create a Vercel project with root directory `apps/api` and add the env vars from `apps/api/.env.example`:
   - `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`
   - `AUTH_JWT_SECRET` (32+ random chars)
   - `CORS_ALLOWED_ORIGINS`
   - `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REFRESH_TOKEN`, `DRIVE_FOLDER_ID`
4. Run `vercel env pull apps/api/.env.local`, then `npm run sheets:setup -w apps/api`. It's idempotent: it creates missing prefixed tabs and fixes header rows.
5. Seed accounts with `SEED_FOUNDER_EMAILS=… SEED_PASSWORD=… npm run sheets:seed -w apps/api -- --demo`.
6. Build the apps with `NEXT_PUBLIC_API_URL=https://<api>.vercel.app`.

**Endpoints:**
- `POST /api/auth/login|signup|reset` and `GET /api/auth/me` (bcrypt + JWT)
- `GET /api/marketplace?updated_since=` (apps poll this every 12s)
- `POST /api/db/:table` (upsert/update/delete with RLS-equivalent role checks)
- `POST /api/deliveries/accept` (check-then-write claim)
- `POST /api/upload` (Drive; saves the link to `profiles.avatar_url`)

The old Supabase SQL in `docs/supabase/` is kept for reference only.

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
