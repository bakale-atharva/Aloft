# Aloft

A flight search and booking demo app built with Next.js, Sanity, and Clerk, including an
AI travel concierge that reads live content through the Sanity Context MCP server.

## Stack

- **Next.js 16** (App Router) + React 19
- **Sanity** — content and booking data (flights, airports, airlines, aircraft, bookings, support articles)
- **Clerk** — authentication plus PRO billing and feature entitlements
- **AI SDK + OpenRouter** — the concierge chat agent, with tools over Sanity content
- **Tailwind CSS**

## Features

- Flight search with refinements, fare selection, and passenger counts
- Interactive seat map and seat selection
- Checkout, PNR generation, confirmation, and booking cancellation
- Clerk-backed pricing page with a custom PRO plan table
- AI concierge (`/concierge`) that can search flights and book or cancel on your behalf, gated behind PRO
- Embedded Sanity Studio at `/studio`

## Getting started

Install dependencies:

```bash
pnpm install
```

Copy `.env.example` to `.env.local` and fill it in:

```bash
cp .env.example .env.local
```

You will need:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`
- `SANITY_API_READ_TOKEN` and `SANITY_API_WRITE_TOKEN` (from sanity.io/manage → API → Tokens)
- `SANITY_CONTEXT_MCP_URL` — the Sanity Context MCP endpoint, filled in after publishing the Context document
- `OPENROUTER_API_KEY` (and optionally `OPENROUTER_MODEL`) for the concierge
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from your Clerk instance

Then run the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The Sanity Studio is at `/studio`.

## Seeding data

Seed airports, airlines, aircraft, flights, and support articles into your Sanity dataset:

```bash
pnpm seed
```

Requires `SANITY_API_WRITE_TOKEN` (Editor role) in `.env.local`. The seed script is idempotent
and safe to re-run.

## Billing and entitlements

PRO features are checked through Clerk Billing. In the Clerk Dashboard → Billing, the `pro`
plan carries the `ai_concierge` and `free_seat_selection` features. All gates read those slugs
through `src/lib/entitlements.ts`, so the plan and feature names must match.

## Scripts

```bash
pnpm dev       # dev server
pnpm build     # production build
pnpm start     # run the production build
pnpm lint      # lint the project
pnpm seed      # seed the Sanity dataset
pnpm typegen   # extract Sanity schema and generate types
```

## Project structure

- `src/app` — routes, including the `(site)` route group for the customer-facing app
- `src/app/api/concierge/chat` — concierge streaming chat endpoint (AI SDK + MCP)
- `src/app/actions` — server actions for booking
- `src/sanity` — Sanity client, schema types, queries, and Studio structure
- `src/components` — UI components (search, seat map, checkout, bookings, concierge)
- `src/lib` — pricing, PNR generation, seat map, billing, and entitlement logic
- `src/lib/agent` — concierge system prompt and tool definitions
- `scripts/seed.ts` — dataset seed script
