<div align="center">

# 🌾 DrukAgriLink

### From Bhutan's farms to the nation's tables.

*A full-stack platform that pools smallholder harvests, connects them to institutional buyers, and coordinates shared transport across the Dragon Kingdom — with transparent, farmer-first payments.*

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-druk--agri--link-1f5c3d?style=for-the-badge)](https://druk-agri-link.vercel.app)
[![Browse Marketplace](https://img.shields.io/badge/🛒_Browse-No_login_needed-f4a300?style=for-the-badge)](https://druk-agri-link.vercel.app/browse)

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=flat&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat&logo=googlegemini&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

</div>

---

## 💡 Why this exists

Bhutan's farmers are small and scattered; institutional buyers — hospitals, schools, hotels — need large, reliable volumes. Neither side can easily reach the other, and transport is fragmented. **DrukAgriLink is the middle layer:** coordinators pool small harvests to fill big orders, shared vehicles move the produce, and every rupee and every step is visible to everyone involved.

Built farmer-first: **farmers always receive their full produce price** — transport is billed separately to the buyer, never skimmed from the grower.

## ✨ What it does

Four roles, four workspaces, one connected flow:

| Role | What they do |
|------|-------------|
| 🌱 **Farmer** | List harvests, accept allocation offers, track earnings |
| 🛒 **Buyer** | Post procurement orders, approve matches, see cost breakdowns |
| 🔗 **Coordinator** | Pool supply to meet demand, build matches, assign transport |
| 🚚 **Transporter** | Register vehicles, run trips, update delivery status, track pay |

### The journey of a harvest

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

Every step notifies the right people **in real time** — the badge ticks up and a toast slides in, no refresh needed.

## 🚀 Highlights

- 🔴 **Real-time notifications** — live badges + toasts via Supabase Realtime, to all parties at each stage
- 🤖 **AI help assistant** — an in-app Gemini chatbot that explains how anything works (API key stays server-side)
- 💰 **Transparent payments** — farmers get full price; every deduction and total shown to each party
- 🔒 **Row-level security** — Postgres RLS isolates every user's data at the database layer
- 🗺️ **Real Bhutan geography** — a 1,051-record Dzongkhag → Gewog → Chiwog hierarchy powers cascading selectors
- 🛍️ **Public marketplace** — a login-free `/browse` view built on secure views that expose only safe columns
- 📊 **Data visualization** — earnings charts (Recharts) and animated count-up stats
- 🔍 **Search & filter** on every dashboard · ✏️ profile editing · 🎨 accessible animations (respects reduced-motion)

## 🛠️ Built with

**Next.js 14** (App Router · Server Actions · Route Handlers) · **TypeScript** · **Supabase** (PostgreSQL · Auth · RLS · Realtime) · **Tailwind CSS** · **Recharts** · **Google Gemini** · **Vercel** (CI/CD from GitHub)

No separate backend — the frontend talks to Supabase directly through server actions.

## 🧠 Engineering notes

- **Server Actions** own every mutation, keeping data logic off the client.
- **RLS** is the real security boundary; server actions also verify ownership before sensitive writes.
- **Real-time** subscribes a client component to the user's own notification rows — RLS decides what the socket may deliver.
- **The AI route** (`/api/chat`) keeps the Gemini key server-side, retries on transient errors, and always returns a friendly message instead of a raw error.
- **The public marketplace** reads dedicated database *views* that never include farmer or buyer identities.
- **A signup trigger** creates each profile row in the database, so it works even with email confirmation on.

## ⚡ Run it locally

```bash
npm install
cp .env.example .env.local   # add your Supabase + Gemini values
npm run dev
```

Open [localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (browser-safe) |
| `GEMINI_API_KEY` | Server-only key for the AI assistant |

`.env.local` is gitignored. On Vercel, the same variables live under **Settings → Environment Variables**.

### Supabase setup

1. Create a project at [supabase.com](https://supabase.com) and copy the URL + anon key into `.env.local`.
2. Run the SQL in `supabase/migrations/` to create tables, enums, triggers, and RLS policies.
3. Enable Realtime on the `notifications` table.

Register a fresh account, pick a role, and explore. Prices are in Bhutanese Ngultrum (Nu. / BTN).

## 🗺️ Roadmap

Ratings & reviews · trends-over-time analytics · real payment processing · SMS/email notifications · verified Dzongkha translations · GPS tracking & route optimization.

---

<div align="center">

**Built by Kinga Tshering** · [GitHub](https://github.com/KingaTshering10)

*Made with care for Bhutan's farmers. 🇧🇹*

</div>