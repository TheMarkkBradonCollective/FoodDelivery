# RUNR

**Pick Your Place. Run Your Time.**

RUNR is a restaurant-based delivery workforce marketplace. Unlike traditional order-driven platforms, RUNR is **coverage-driven**:

- **Businesses** define how many RUNRs they need per time period
- **RUNRs** choose where and when to work (custom start/end times)
- **RUNR** matches coverage and dispatches eligible deliveries

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS 4** (design tokens)
- **Leaflet / React-Leaflet** (map-first UI)
- **Zustand** (client state)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and choose a role:

| Role | Path | Experience |
|------|------|------------|
| Customer | `/customer` | Discovery, menus, cart, order tracking |
| RUNR | `/runr` | Map-first work discovery, RUN scheduling, deliveries, earnings |
| Business | `/business` | Live operations map, orders, coverage management |

## Architecture

```
src/
├── app/              # Routes by role (customer, runr, business)
├── components/
│   ├── map/          # MapView abstraction (provider-agnostic)
│   └── ui/           # Design system (BottomSheet, CoverageBadge, etc.)
├── data/             # Mock data for MVP
├── lib/
│   ├── coverage-engine.ts  # Core coverage calculation
│   └── utils.ts
├── store/            # Zustand app state
└── types/            # Domain entities
```

## Coverage Engine

The coverage engine evaluates RUN availability minute-by-minute (30-min intervals):

- Compares **scheduled RUNRs** vs **maximum desired RUNRs**
- Supports overlapping custom RUN times (e.g. 5:37 PM–8:12 PM)
- Returns status: `FULL`, `LOW`, `GAP`, `OVER_CAPACITY`

## Design System

- **Primary brand:** `#FF4F00` (RUNR Orange)
- **Status:** Green (full), Orange (low), Red (gap)
- Light + dark mode
- Map-first, bottom sheets, responsive layouts (mobile / tablet / desktop)

## MVP Scope (Phase 1–3)

- [x] Design system + tokens
- [x] Role-based auth (demo login)
- [x] Map infrastructure
- [x] RUNR map + business bottom sheets
- [x] Custom RUN scheduling + coverage check
- [x] Customer discovery, menus, cart, tracking
- [x] Business live operations + coverage editor
- [ ] Real auth, payments, push notifications (future phases)

## License

Private — TheMarkkBradonCollective
