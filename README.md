# DrukAgriLink

**A farm-to-market coordination platform for Bhutan.** DrukAgriLink connects smallholder farmers, institutional buyers, coordinators, and transporters so that scattered harvests can be pooled to meet large orders and moved efficiently across the country — from harvest listing through matching, approval, transport, and delivery.

🌐 **Live demo:** [druk-agri-link.vercel.app](https://druk-agri-link.vercel.app)

The architecture is deliberately simple: Next.js (App Router) with server actions talking directly to Supabase. No separate backend.

---

## The problem

Bhutan's farmers is small and geographically scattered, while institutional buyers (hospitals, schools, hotels, wholesalers) need large, reliable volumes of produce. Neither side can easily reach the other, and transport is fragmented. DrukAgriLink sits in the middle: coordinators pool small harvests to fulfil big orders, and shared vehicles carry the produce from farm to buyer — with every step visible to everyone involved.

## What it does

The platform supports four roles, each with its own workspace and server-side enforcement:

- **Farmers** publish harvest listings (product, quantity, grade, price, location) and accept or decline allocation offers.
- **Buyers** create procurement orders on behalf of their organization and approve or reject proposed matches.
- **Coordinators** pool farmer supply to meet buyer demand, build match proposals with a plain-language summary, and assign transport.
- **Transporters** register vehicles, receive assigned trips, and update delivery status stage by stage.

### The end-to-end workflow

```
Farmer lists harvest
      │
Coordinator builds a match  ──►  Farmer accepts allocation
      │                                    │
Buyer approves the proposal  ◄─────────────┘
      │
Coordinator assigns a vehicle  ──►  Transporter delivers
                                    (assigned → accepted → collecting → in transit → delivered)
```

At each meaningful step, the relevant parties receive **in-app notifications**, so farmers, buyers, and coordinators always know where a deal — and the produce — stands.

## Key features

- **Four roles** — farmer, buyer, coordinator, transport — with role-based access control and Postgres row-level security (RLS) enforcing per-user data isolation.
- **Complete coordination workflow** from harvest listing through matching, multi-party approval, transport assignment, and delivery status updates.
- **Plain-language match summaries** (fulfilment %, farmer count, average price) instead of an opaque score.
- **In-app notification system** with unread badges, mark-as-read, and clickable notifications that deep-link to the relevant record; all parties are notified at each transport stage.
- **Full CRUD** on orders and harvests (create, view, edit, delete) with ownership checks.
- **Vehicle registration and transport assignment** — transporters register vehicles; coordinators assign an available vehicle to a confirmed order, creating a tracked shipment.
- **Authoritative Bhutanese location data** — a 1,051-record Dzongkhag → Gewog → Chiwog administrative hierarchy powers a cascading location selector for standardized geographic entry.
- **Decimal-safe money math** for collection and payment records.
- **Responsive, culturally themed UI** with a cohesive design across landing, authentication, and every role's dashboard.

## Technology stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, Server Actions) |
| Language | TypeScript |
| Database & Auth | Supabase (PostgreSQL, Auth, Row-Level Security) |
| Styling | Tailwind CSS |
| Validation | Zod |
| Money math | decimal.js |
| Icons | Lucide |
| Testing | Vitest |
| Deployment | Vercel (continuous deployment from GitHub) |

## Architecture notes

- **Server Actions** handle all mutations (creating orders, responding to proposals, assigning transport), keeping data logic on the server and out of the client.
- **Row-Level Security** is the primary data-isolation boundary; server actions additionally verify ownership before sensitive writes.
- **Notifications** are written as a side effect of workflow transitions; recipient lists are de-duplicated and defensively guarded so a missing link never breaks a status update.

## Repository structure

```
supabase/
  migrations/0001_init.sql   # tables, enums, triggers, RLS policies
  seed.sql                   # fictional Bhutan demo data
src/
  app/                       # routes (public, farmer, buyer, coordinator, transport, shared)
  components/                # UI (status badge, header, empty state, location picker)
  lib/
    supabase/                # browser + server clients, session middleware
    auth/                    # roles + server-side route guards
    validation/schemas.ts    # Zod schemas (harvest, order, matching)
    finance/calc.ts          # decimal-safe money calculations
    matching/match.ts        # match validation + summary text
    constants/               # Bhutan administrative data (dzongkhag/gewog/chiwog), products
    tests/                   # Vitest suite
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

1. Create a project at [supabase.com](https://supabase.com).
2. Project Settings → API: copy the URL + anon key into `.env.local`.
3. SQL Editor → run `supabase/migrations/0001_init.sql`.
4. SQL Editor → run `supabase/seed.sql` for demo data.

The migration creates every table with UUID ids, `created_at`/`updated_at`, `numeric()` money columns, and RLS policies. The seed inserts fictional farmers, buyers, transport providers, vehicles, products, listings, and orders. All people, phone numbers, and organizations are fictional. Currency shows as `Nu.` (BTN).

To try the app, register a fresh account through the sign-up page and choose a role.

## Development commands

```bash
npm run dev         # start dev server (http://localhost:3000)
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Vitest
npm run build       # production build
npm start           # run the production build
```

## Roadmap

Natural next steps beyond the current build:

- Collection-entry and farmer payment-receipt views (money math and status tracking already in place).
- Real payment processing and SMS/email notifications.
- Verified Dzongkha translations and an i18n switcher.
- GPS tracking and route optimization for transport.

## Author

Built by **Kinga Tshering** · [GitHub](https://github.com/KingaTshering10)