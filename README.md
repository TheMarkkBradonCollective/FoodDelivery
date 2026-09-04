# RUNR Platform — 3-App Ecosystem

Three separate Android apps connected to one marketplace network.

| App | Role | Tagline | Core Flow |
|-----|------|---------|-----------|
| **PORTER** | Customer | Get what you need. | Discover → Order → Track → Receive |
| **RUNR** | Delivery | Pick it up. Run it there. | Choose → RUN → Deliver → Earn |
| **VENDR** | Business | Sell. Manage. Grow. | Sell → Prepare → Dispatch → Fulfill → Grow |

> **PORTER** creates the demand. **VENDR** fulfills the business side. **RUNR** moves it.

## Monorepo Structure

```
apps/
  porter/     # Customer APK  (com.runr.porter)
  runr/       # Delivery APK  (com.runr.runr)
  vendr/      # Business APK  (com.runr.vendr)
packages/
  shared/     # Marketplace logic, UI, coverage engine, mock data
```

Each app is a **Next.js + Capacitor** mobile shell with its own branding, navigation, and APK build. All three share `@runr/shared` — the same marketplace types, coverage engine, and business data.

## Getting Started

```bash
npm install

# Run each app (separate ports)
npm run dev:porter   # http://localhost:3001
npm run dev:runr     # http://localhost:3002
npm run dev:vendr    # http://localhost:3003
```

## Build Android APKs

Requires Android SDK + Java. Each app builds independently:

```bash
npm run android:porter   # Debug APK → apps/porter/android/
npm run android:runr
npm run android:vendr
```

Release APKs:

```bash
npm run android:release -w @runr/porter
```

APK output: `apps/<app>/android/app/build/outputs/apk/`

### App IDs

| App | Package ID | Capacitor App Name |
|-----|------------|-------------------|
| PORTER | `com.runr.porter` | PORTER |
| RUNR | `com.runr.runr` | RUNR |
| VENDR | `com.runr.vendr` | VENDR |

## How They Connect

All three apps use the same `@runr/shared` marketplace layer:

- **Shared businesses, orders, RUNs, coverage rules**
- **Coverage engine** — businesses set max RUNRs per period; RUNRs fill gaps
- **Order flow** — PORTER places orders → VENDR receives → RUNR delivers

In production, each APK talks to the same backend API. The MVP uses shared local state (`runr-platform-marketplace`) for demo connectivity.

## Ecosystem Flow

```
         PLATFORM
             │
    ┌────────┼────────┐
    │        │        │
 PORTER    VENDR     RUNR
Customer  Business  Delivery
    │        │        │
    │ ORDER  │        │
    ├───────►│        │
    │        │DISPATCH│
    │        ├───────►│
    │        │        │ PICK UP
    │◄────────────────┤
    │     DELIVERY    │
```

## Tech Stack

- Next.js 15 (static export for Capacitor)
- Capacitor 7 (Android APK)
- TypeScript + Tailwind CSS 4
- Leaflet maps + Zustand state
- Shared coverage-driven dispatch model

## License

Private — TheMarkkBradonCollective
