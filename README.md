# RUNR Platform

**Pick Your Place. Run Your Time.**

Monorepo for the RUNR coverage-driven delivery marketplace.

## What's in this repo

| Path | Purpose |
|------|---------|
| **`apps/website`** | **Main company website** — downloads, company info, how we operate |
| `apps/porter` | PORTER customer Android app |
| `apps/runr` | RUNR delivery Android app |
| `apps/vendr` | VENDR business Android app |
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
| `/account` | Your account dashboard (orders, RUNs, business ops) |
| `/staff` | Staff portal — manage apps, users, businesses, orders |

**Demo logins:**

| Email | Password | Role |
|-------|----------|------|
| alex@example.com | porter123 | PORTER customer |
| james@example.com | runr123 | RUNR delivery |
| tony@tonyspizza.com | vendr123 | VENDR business |
| staff@runr.com | staff123 | Platform staff |

One account works across the mobile app and website.

## The 3-App Ecosystem

| App | Role | Tagline |
|-----|------|---------|
| **PORTER** | Customer | Get what you need. |
| **RUNR** | Delivery | Pick it up. Run it there. |
| **VENDR** | Business | Sell. Manage. Grow. |

> PORTER creates the demand. VENDR fulfills the business side. RUNR moves it.

## Build & distribute APKs

```bash
npm run android:all   # Build all 3 APKs + copy to website
```

APKs are served from `apps/website/public/downloads/` for the main website.

## Deploy the website

Build static export:

```bash
npm run build:website
```

Output: `apps/website/out/` — deploy to Vercel, Netlify, GitHub Pages, or any static host.

## License

Private — The Markk Brandon Collective
