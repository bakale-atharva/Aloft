# Aloft

A flight search and booking demo app built with Next.js, Sanity, and Clerk.

## Stack

- **Next.js 16** (App Router) + React 19
- **Sanity** — content and booking data (flights, airports, airlines, aircraft, bookings)
- **Clerk** — authentication and PRO billing/entitlements
- **Tailwind CSS**

## Getting Started

Install dependencies:

```bash
pnpm install
```

Copy `.env.local` with your Sanity and Clerk credentials (project ID, dataset, API tokens, Clerk keys), then run the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app. The Sanity Studio is available at `/studio`.

## Seeding data

Seed airports, airlines, aircraft, flights, and support articles into your Sanity dataset:

```bash
pnpm seed
```

Requires `SANITY_API_WRITE_TOKEN` (Editor role) in `.env.local`. The seed script is idempotent and safe to re-run.

## Other scripts

```bash
pnpm build     # production build
pnpm start     # run the production build
pnpm lint      # lint the project
pnpm typegen   # extract Sanity schema and generate types
```

## Project structure

- `src/app` — routes, including the `(site)` route group for the customer-facing app
- `src/sanity` — Sanity client, schema types, and queries
- `src/components` — UI components (search, seat map, checkout, bookings)
- `src/lib` — pricing, PNR generation, seat map, and entitlement logic
- `scripts/seed.ts` — dataset seed script
