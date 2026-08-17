# DrukAgriLink

**A farm-to-market coordination platform for Bhutan.** DrukAgriLink connects smallholder farmers, institutional buyers, coordinators, and transporters so that scattered harvests can be pooled to meet large orders and moved efficiently across the country — from harvest listing through matching, approval, transport, delivery, and transparent payment.

🌐 **Live:** [druk-agri-link.vercel.app](https://druk-agri-link.vercel.app) · **Browse the marketplace (no login):** [/browse](https://druk-agri-link.vercel.app/browse)

The architecture is deliberately simple: Next.js (App Router) with server actions talking directly to Supabase. No separate backend.

---

## The problem

Bhutan's farmers are small and geographically scattered, while institutional buyers (hospitals, schools, hotels, wholesalers) need large, reliable volumes of produce. Neither side can easily reach the other, and transport is fragmented. DrukAgriLink sits in the middle: coordinators pool small harvests to fulfil big orders, and shared vehicles carry the produce from farm to buyer — with every step visible to everyone involved.

## What it does

Four roles, each with its own workspace and server-side enforcement:

- **Farmers** publish harvest listings, accept or decline allocation offers, and see their earnings.
- **Buyers** create procurement orders, approve matches, and see a transparent cost breakdown.
- **Coordinators** pool farmer supply to meet buyer demand, build match proposals, and assign transport.
- **Transporters** register vehicles, receive assigned trips, update delivery status, and see their earnings.

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

At every meaningful step, the relevant parties are notified — **in real time**, with the notification badge updating live and a toast sliding in without a page refresh.

## Key features

- **Four roles** with role-based access control and Postgres row-level security (RLS) enforcing per-user data isolation.
- **Complete coordination workflow** from harvest listing through matching, multi-party approval, transport assignment, and delivery tracking.
- **Real-time notifications** — live unread badge and toast popups via Supabase Realtime, delivered to all parties at each transport stage.
- **AI help assistant** — an in-app chatbot (Google Gemini) that answers questions about how the platform works. The API key is kept server-side and calls are made from a Next.js route handler.
- **Transparent payments model** — farmers receive their full produce price; transport is charged separately to the buyer. Every party sees their side: farmers see per-payment breakdowns (gross, deductions, net) with paid/pending status, buyers see produce + transport = total, transporters see their trip earnings.
- **Full CRUD** on orders and harvests with ownership checks.
- **Vehicle registration and transport assignment** — transporters register vehicles; coordinators assign an available vehicle to a confirmed order, creating a tracked shipment.
- **Search and filter** across all four dashboards (by product, status, and location).
- **Profile editing** with the full Bhutanese administrative hierarchy.
- **Authoritative Bhutanese location data** — a 1,051-record Dzongkhag → Gewog → Chiwog hierarchy powers cascading location selectors for standardized geographic entry.
- **Public marketplace page** — a secure, login-free `/browse` view of available produce and open demand, exposed through database views that reveal only non-sensitive columns.
- **Data visualization** — an earnings breakdown chart (Recharts) and animated count-up statistics.
- **Responsive, culturally themed UI** with subtle, accessible animations (respects `prefers-reduced-motion`) and a draggable chat widget.

## Technology stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, Server Actions, Route Handlers) |
| Language | TypeScript |
| Database & Auth | Supabase (PostgreSQL, Auth, Row-Level Security, Realtime) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| AI | Google Gemini API (server-side) |
| Icons | Lucide |
| Deployment | Vercel (continuous deployment from GitHub) |

## Architecture notes

- **Server Actions** handle all mutations (creating orders, responding to proposals, assigning transport, generating payments), keeping data logic on the server.
- **Row-Level Security** is the primary data-isolation boundary; server actions additionally verify ownership before sensitive writes.
- **Real-time** uses a client component subscribed to the user's own notification rows; RLS governs what the subscription is allowed to deliver.
- **The AI assistant** runs through a server route handler (`/api/chat`) so the Gemini API key never reaches the browser; the route retries on transient errors and returns friendly messages instead of raw errors.
- **The public marketplace** reads from dedicated database views that expose only safe columns (product, quantity, price, general location) — never farmer or buyer identities.
- **Notifications** are written as a side effect of workflow transitions; recipient lists are de-duplicated and defensively guarded so a missing link never breaks a status update.
- **A database trigger** creates each user's profile row on signup, so profile creation works correctly even with email confirmation enabled.

## Requirements

- Node.js 18+
- A free Supabase project
- A Google Gemini API key (free tier) for the chat assistant

## Installation

```bash
npm install
cp .env.example .env.local   # then fill in your values
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (safe for the browser) |
| `GEMINI_API_KEY` | Server-only key for the AI assistant |

Never commit `.env.local`. Only `.env.example` (placeholders) is tracked. On Vercel, the same variables are set under Project Settings → Environment Variables.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Project Settings → API: copy the URL + anon key into `.env.local`.
3. Run the SQL in `supabase/migrations/` to create tables, enums, triggers, and RLS policies.
4. Enable Realtime on the `notifications` table.

To try the app, register a fresh account through the sign-up page and choose a role. Currency is shown in Bhutanese Ngultrum (Nu. / BTN).

## Roadmap

- Ratings and reviews between parties
- More dashboard analytics (trends over time)
- Real payment processing and SMS/email notifications
- Verified Dzongkha translations and an i18n switcher
- GPS tracking and route optimization for transport

## Author

Built by **Kinga Tshering** · [GitHub](https://github.com/KingaTshering10)