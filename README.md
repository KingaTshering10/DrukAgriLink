# DrukAgriLink

A Bhutan-focused agricultural coordination platform. It helps small farmers combine
their available produce, connect with institutional buyers, and coordinate shared
transport — from harvest listing through collection and payment status.

This is the **first functional MVP**. The architecture is deliberately simple: Next.js
(App Router) with server actions talking directly to Supabase. No separate backend.

## Main features

- Four roles — **farmer, buyer, coordinator, transport** — with server-side enforcement.
- Farmers publish harvest listings; buyers create procurement orders.
- Coordinators combine multiple farmer listings into one buyer order and build a
  **plain-language match summary** (fulfilment %, farmer count, avg price — no opaque score).
- Farmer and buyer approval gate the match; coordinators assign vehicles; transporters
  update shipment status.
- Collection records with decimal-safe money math: `net due = accepted × price − transport − other`.
- Payment status tracking (Pending / Paid) — **no real money movement**.
- Row Level Security so users only see their own private records.

## Technology stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase (Auth + Postgres) ·
Zod · React Hook Form-compatible forms · Lucide icons · `decimal.js` for money · Vitest.

## Repository structure

```
supabase/
  migrations/0001_init.sql   # tables, enums, triggers, RLS policies
  seed.sql                   # fictional Bhutan demo data + demo login accounts
src/
  app/                       # routes (public, farmer, buyer, coordinator, transport, shared)
  components/                # UI (status badge, header, empty state)
  lib/
    supabase/                # browser + server clients, session middleware
    auth/                    # roles + server-side route guards
    validation/schemas.ts    # Zod schemas (harvest, order, matching)
    finance/calc.ts          # decimal-safe money calculations
    matching/match.ts        # match validation + summary text
    constants/bhutan.ts      # dzongkhags, gewogs, products
    tests/                   # Vitest suite
locales/                     # en.json + dz.json (Dzongkha = review placeholders)
```

## Requirements

- Node.js 18+ (tested on 22)
- A free Supabase project

## Installation

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase values
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (safe for the browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; optional, for scripted seeding |

Never commit `.env.local`. Only `.env.example` (placeholders) is tracked.

## Supabase setup

1. Create a project at supabase.com.
2. Project Settings → API: copy the URL + anon key into `.env.local`.
3. SQL Editor → run `supabase/migrations/0001_init.sql`.
4. SQL Editor → run `supabase/seed.sql` for demo data.

### Database migration / seed

The migration creates every table with UUID ids, `created_at`/`updated_at`, `numeric()`
money columns, and RLS policies. The seed inserts fictional farmers, buyers, transport
providers, vehicles, products, listings, orders, and two match proposals.

If SQL-based auth seeding fails (it is Supabase-version dependent), create the demo
accounts under **Auth → Users** with the same emails and password, or just register
fresh accounts through the app.

## Development commands

```bash
npm run dev         # start dev server (http://localhost:3000)
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Vitest
npm run build       # production build
npm start           # run the production build
```

## Demo users

All demo accounts use password **`Druk@2024`**:

| Role | Email |
| --- | --- |
| Farmer | `farmer1@druk.demo` … `farmer8@druk.demo` |
| Buyer | `buyer1@druk.demo`, `buyer2@druk.demo`, `buyer3@druk.demo` |
| Transport | `transport1@druk.demo`, `transport2@druk.demo` |
| Coordinator | `coordinator@druk.demo` |

All people, phone numbers, and organizations are fictional. Currency shows as `Nu.` (BTN).

## Known limitations (not in this first MVP)

- Real payment processing, GPS tracking, automatic route optimization, SMS integration.
- Complete Dzongkha translation (only review placeholders in `locales/dz.json`).
- Production identity verification, advanced analytics, offline sync.
- Some role pages are implemented as the core workflow slice (dashboards + create/list +
  the match builder + trip status). A few detail/receipt pages listed in the spec are
  stubbed to their dashboard equivalents and are the natural next step (see below).

## Recommended next development phase

1. Fill remaining detail pages: harvest details, order details, match details,
   delivery confirmation, collection-entry form, farmer collection receipt + payment view.
2. Add vehicle registration + coordinator transport-assignment forms (schema already supports them).
3. Notifications on state changes (insert rows on allocation/proposal/shipment updates).
4. Wire `react-hook-form` + `zodResolver` on the client for inline field errors.
5. Verified Dzongkha translations and an i18n switcher.
