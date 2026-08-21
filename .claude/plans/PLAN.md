# FlightTracker — Flight Booking App

## Context

We're building a flight booking app in `D:\Coding\JavaScript\Projects\Flight Tracker`: search source→destination,
one-way or round-trip, pick a cabin class (economy / business / first), choose seats on a **visual seat map**, then run a
**dummy payment** that writes a real booking to Sanity. Signed-in users on a **Clerk PRO plan** get free seat selection
plus an **AI concierge desk** that can search flights, answer support questions, and book on their behalf.

### Current workspace state

- `studio/` — a bare `sanity init` scaffold (project `0298rbtw`, dataset `production`, Sanity 6.10.1, pnpm,
  **empty `schemaTypes`**, one bootstrap commit in a nested `.git`, no remote). Nothing custom in it.
- Sanity CLI authenticated as `atharvabakale13@gmail.com` (`g3cgd3b3z`) ✓. `sanity projects list` confirms
  **`0298rbtw` / FlightTracker**, and `sanity dataset list` confirms **`production`**.
- Sanity **MCP** still returns `bearer token is invalid or expired` — `mcp configure` rewrote the credentials on disk,
  but this session's connected MCP server holds the old token. Only a Claude Code restart reloads it.
  **Nothing in this plan depends on MCP.**
- Nothing else exists. No Next.js app, no root git repo.

### Decisions (confirmed with you)

| Topic           | Decision                                                                                                                                                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Layout          | **Next.js 16 at the repo root, Studio embedded at `/studio`.** The `studio/` folder and its nested `.git` get **deleted** — it holds no custom code, only `projectId: '0298rbtw'` / `dataset: 'production'`, which carry over. One `git init` at root. |
| Package manager | **pnpm** throughout                                                                                                                                                                                                                                    |
| Sanity project  | `0298rbtw` / `production`                                                                                                                                                                                                                              |
| Clerk app       | `app_3IDjb6oHABWvYHwaMvhZg9jxrhY`                                                                                                                                                                                                                      |
| LLM             | **OpenRouter** via Vercel AI SDK (`@openrouter/ai-sdk-provider`)                                                                                                                                                                                       |
| Money           | Ticket checkout **simulated**; PRO subscription uses **real Clerk Billing** (Stripe test mode)                                                                                                                                                         |
| Seeding         | **`scripts/seed.ts`** with `@sanity/client` + write token — reproducible, no MCP dependency                                                                                                                                                            |

Note: embedding the Studio contradicts both Sanity's own guidance and your original setup prompt ("keep the Studio
standalone"). You asked for `/studio`, so that's what this builds — risk noted at the bottom.

### Assumptions (flag now if wrong)

1. The concierge can **complete real bookings**, but every write (`createBooking`, `cancelBooking`) is
   **confirm-gated**: the agent proposes, the UI renders a confirmation card, the write fires only on your click.
2. "Free seat bookings" for PRO = **seat-selection fees waived**; the base fare is still charged in the dummy flow.
3. Seat availability is derived from existing booking documents. No hold/TTL system — a server-side re-check at
   checkout returns a conflict if someone took the seat first.

---

## Things I need from you

| #   | Item                                              | Note                                                                                                                                                                                    |
| --- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `OPENROUTER_API_KEY`                              | I write it into `.env.local` and never print it                                                                                                                                         |
| 2   | Sanity **read** + **write** tokens                | sanity.io/manage → API → Tokens. Read token for the concierge, write token for seeding + bookings                                                                                       |
| 3   | Sanity **MCP** restart _(optional, nice-to-have)_ | Restart Claude Code whenever convenient so MCP content tools work in-editor. The build does not need it — schema goes through `sanity schema deploy`, content through `scripts/seed.ts` |

I'll build everything that doesn't depend on these while you gather them.

---

## Stack

Next.js **16.3.2** (App Router, Turbopack, TypeScript, Tailwind v4, `src/`) · React 19.2 · Sanity **6.10** embedded via
`next-sanity` **13.x** · `@clerk/nextjs` **7.x** + `@clerk/ui` · Vercel AI SDK **7.x** + `@ai-sdk/react` + `@ai-sdk/mcp` +
`@openrouter/ai-sdk-provider` **3.x** · shadcn/ui

---

## Phase 0 — Reset the workspace and scaffold

1. Record `projectId: 0298rbtw`, `dataset: production` (done — above).
2. **Delete `studio/`** (including its nested `.git`). It's a bare scaffold with an empty schema; nothing is lost.
3. Scaffold at root:
   ```bash
   pnpm create next-app@latest . --ts --app --src-dir --tailwind --eslint --import-alias "@/*" --turbopack
   ```
4. `git init` at root; `.gitignore` covers `.env*.local`, `node_modules`, `.next`, `sanity.types.ts` stays tracked.
5. Install the Sanity Context skills:
   ```bash
   pnpm dlx skills add sanity-io/context --all
   ```
6. `pnpm add sanity @sanity/vision @sanity/context next-sanity @sanity/image-url styled-components`
7. `.npmrc` with `shamefully-hoist=true` — pnpm's strict linking breaks Sanity Studio's `styled-components` peer
   resolution inside a Next.js bundle.

Follow the `sanity-best-practices` skill's `get-started` + `nextjs` references (installed at
`~/.claude/skills/sanity-best-practices/`), adapted for the embedded layout.

---

## Phase 1 — Sanity: Studio at `/studio` + content model

**Root config** (next to `next.config.ts`):

- `sanity.config.ts` — `defineConfig({ projectId: '0298rbtw', dataset: 'production', basePath: '/studio',
plugins: [structureTool({structure}), visionTool(), contextPlugin()], schema })`
- `sanity.cli.ts` — same api block, plus a `typegen` block: `path: './src/**/*.{ts,tsx}'`,
  `generates: './sanity.types.ts'`, `overloadClientMethods: true`
- `src/app/studio/[[...tool]]/page.tsx` — `NextStudio` from `next-sanity/studio`,
  `export const dynamic = 'force-static'`, re-export `metadata`/`viewport` from `next-sanity/studio`

**Schema — `src/sanity/schemaTypes/`** (all `defineType`/`defineField`, registered in `index.ts`):

| Type                      | Key fields                                                                                                                                                                                                                                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `airport`                 | `code` (IATA, 3 chars, unique), `name`, `city`, `country`, `timezone`                                                                                                                                                                                                                                                                            |
| `airline`                 | `name`, `code` (2 chars), `logo`                                                                                                                                                                                                                                                                                                                 |
| `aircraft`                | `model`, `seatLayout[]` → `cabinSection` objects                                                                                                                                                                                                                                                                                                 |
| `cabinSection` _(object)_ | `cabinClass` (`economy`\|`business`\|`first`), `startRow`, `endRow`, `columns` (string[] where `""` = aisle, e.g. `["A","B","C","","D","E","F"]`), `exitRows` (number[]), `seatPitch`                                                                                                                                                            |
| `flight`                  | `flightNumber`, `airline`→ref, `aircraft`→ref, `origin`/`destination`→ref airport, `departureTime`, `arrivalTime`, `durationMinutes`, `fares[]` → `{cabinClass, basePrice, seatFee, currency}`, `status`                                                                                                                                         |
| `booking`                 | `pnr` (6 chars, unique), `clerkUserId`, `contact{name,email}`, `tripType`, `outbound{flight→ref, cabinClass, seats[]}`, `inbound{…}` optional, `passengers[]`, `fareBreakdown{baseFare, seatFees, taxes, total, currency}`, `status` (`pending`\|`confirmed`\|`cancelled`), `payment{method, last4, transactionId, paidAt}`, `proSeatFeesWaived` |
| `supportArticle`          | `question`, `answer` (Portable Text), `category` — powers the concierge's support answers                                                                                                                                                                                                                                                        |

`aircraft.seatLayout` is the crux: **seats are generated deterministically from the layout, never authored as
documents.** A 787 is 3 `cabinSection` entries, not 250 seat records.

`src/sanity/structure.ts`: bookings grouped by status, a divider, then the Sanity Context document
(filtered via `CONTEXT_SCHEMA_TYPE_NAME`).

Deploy: `pnpm sanity schema deploy` — required before Sanity Context can see anything.

**Seed — `scripts/seed.ts`** (`@sanity/client` + write token, run via `node --env-file=.env.local`):
~8 airports, 4 airlines, 3 aircraft with real-shaped layouts, ~40 flights over the next 30 days (both directions so
round-trips resolve), ~12 support articles. Idempotent through deterministic `_id`s (`createOrReplace`).

---

## Phase 2 — Clerk auth + PRO billing

`clerk update --yes` → `clerk auth login` (already authenticated) →
`clerk init --app app_3IDjb6oHABWvYHwaMvhZg9jxrhY` → `clerk doctor`.

- **Next.js 16 uses `proxy.ts`**, not `middleware.ts`. Verify `config.matcher` contains `'/(api|trpc)(.*)'` then
  `'/__clerk/:path*'`. **Leave `/studio(.*)` public** — Sanity Studio does its own auth; Clerk must not intercept it.
- `ClerkProvider` inside `<body>` in `src/app/layout.tsx`, `appearance={{ theme: shadcn }}`;
  `@import '@clerk/ui/themes/shadcn.css'` in `globals.css`.
- Nav: `<Show when="signed-out">` → `SignInButton`/`SignUpButton`; `<Show when="signed-in">` → `UserButton`.
- Billing: `clerk enable billing --for users`, then a **`pro`** plan with features **`free_seat_selection`** and
  **`ai_concierge`** (via `clerk api`, using the `clerk-cli` skill; dashboard fallback if the API can't create plans).
- `/pricing` renders Clerk's `<PricingTable />`.
- `src/lib/entitlements.ts`:
  ```ts
  export async function getEntitlements() {
    const { userId, has } = await auth(); // async in Next 15+ — always await
    return {
      userId,
      isPro: has?.({ plan: "pro" }) ?? false,
      canUseConcierge: has?.({ feature: "ai_concierge" }) ?? false,
      seatFeesWaived: has?.({ feature: "free_seat_selection" }) ?? false,
    };
  }
  ```

---

## Phase 3 — Booking flow

State flows through **URL search params** — shareable and refresh-safe. No global store.

| Route                 | Purpose                                                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `/`                   | Hero + `SearchForm`: one-way/round-trip toggle, from/to airport combobox, dates, passengers, cabin class                            |
| `/search`             | Results. One-way → single list. Round-trip → outbound list, then inbound, with a sticky bar showing both legs and the running total |
| `/seats`              | **Visual seat picker**, one panel per leg                                                                                           |
| `/checkout`           | Passenger details + dummy card form + fare breakdown                                                                                |
| `/confirmation/[pnr]` | Boarding-pass-style confirmation                                                                                                    |
| `/bookings`           | My bookings (Clerk-protected), with cancel                                                                                          |

**Key modules:**

- `src/sanity/queries.ts` — all GROQ through `defineQuery` so TypeGen picks it up: `SEARCH_FLIGHTS_QUERY`,
  `FLIGHT_BY_ID_QUERY`, `OCCUPIED_SEATS_QUERY`, `MY_BOOKINGS_QUERY`, `BOOKING_BY_PNR_QUERY`
- `src/lib/seat-map.ts` — pure, unit-testable. `generateSeats(seatLayout, cabinClass)` → `Seat[]` of
  `{ id: "12A", row, column, cabinClass, isExitRow, isWindow, isAisle }`;
  `isSeatSelectable(seat, occupied, selected, maxSeats)`
- `src/lib/pricing.ts` — `calculateFare({ legs, cabinClass, passengers, seats, seatFeesWaived })` →
  `{ baseFare, seatFees, taxes (12%), total }`. **Runs on the server at booking time; the client figure is display-only.**
- `src/components/seat-map/SeatMap.tsx` — client component. Fuselage-shaped container, rows with aisle gaps, class
  dividers, exit-row markers. Seat states: available / selected / occupied / other-class / extra-legroom. Legend,
  tooltips, arrow-key navigation, per-seat `aria-label`, `aria-disabled` on taken seats.
- `src/app/actions/booking.ts` — `processBooking(formData)` server action:
  1. `await getEntitlements()` → require `userId`
  2. Re-fetch flights from Sanity, **recompute the fare server-side**
  3. Re-query occupied seats → on conflict return `{ error: 'SEAT_TAKEN', seats }` and bounce back to `/seats`
  4. Simulate processing (~1.5s). Deterministic outcomes: card ending **`0000` → declined**, anything else approves
  5. `writeClient.create()` the booking with a generated PNR. **Only `last4` is stored** — no card data leaves the form
  6. `redirect('/confirmation/' + pnr)`

Two clients: `src/sanity/client.ts` (public, `useCdn: true`) and `src/sanity/write-client.ts`
(**server-only**: `import 'server-only'`, `SANITY_API_WRITE_TOKEN`, `useCdn: false`).

---

## Phase 4 — AI concierge (PRO only)

Sanity Context is **read-only by design** — it cannot write. So the agent gets two tool families.

**Read — Sanity Context MCP** (`groq_query`, `schema_explorer`, `array_field_reader`)
Set up with the `create-agent-with-sanity-context` skill: `contextPlugin()` in `sanity.config.ts`, then publish a Context
document with slug `flight-concierge` and
`groqFilter: _type in ["flight","airport","airline","aircraft","supportArticle"]` — which deliberately **excludes
`booking`**, so the agent can never read another user's PNR. Instructions shaped with the `shape-your-agent` skill.

**Write/act — custom AI SDK tools** in `src/lib/agent/tools.ts`, every one scoped to the Clerk `userId`:

| Tool                  | Behavior                                                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `searchFlights`       | Structured GROQ — faster and more reliable than letting the model write the query                                           |
| `getSeatAvailability` | Seat layout + occupied list for a flight/class                                                                              |
| `getMyBookings`       | `clerkUserId == $userId` only                                                                                               |
| `createBooking`       | **No `execute`** → renders a confirm card; the write runs only on user click, through the same server action as `/checkout` |
| `cancelBooking`       | Same confirm-gate; ownership verified server-side                                                                           |

**`src/app/api/concierge/chat/route.ts`:**

1. `await getEntitlements()` → **403 unless `canUseConcierge`** (server-side gate, not just UI)
2. Fetch `/initial-context` (module-scoped cache) and prepend it to the system prompt — saves a tool call per conversation
3. `createMCPClient` over HTTP with `Authorization: Bearer ${SANITY_API_READ_TOKEN}`; strip `initial_context` from the tools
4. `streamText({ model: openrouter('anthropic/claude-sonnet-4.5'), system, tools: {...mcpTools, ...customTools}, stopWhen: stepCountIs(10) })`
5. `.toUIMessageStreamResponse()`; close the MCP client in `onFinish`

**`/concierge`** — server component checks `canUseConcierge`. Non-PRO sees an upsell with `<PricingTable />`.
PRO sees a chat UI (`useChat` from `@ai-sdk/react`) with custom renderers: flight cards with a select action, a seat-map
preview, and the booking confirm card.

---

## Files at a glance

```
sanity.config.ts · sanity.cli.ts · proxy.ts · .npmrc · .env.local
scripts/seed.ts
src/app/
  layout.tsx  page.tsx  globals.css
  studio/[[...tool]]/page.tsx
  search/page.tsx   seats/page.tsx   checkout/page.tsx
  confirmation/[pnr]/page.tsx   bookings/page.tsx
  pricing/page.tsx  concierge/page.tsx
  api/concierge/chat/route.ts
  actions/booking.ts
src/components/  search-form/  flight-card/  seat-map/  checkout/  concierge/  nav/
src/lib/         seat-map.ts  pricing.ts  entitlements.ts  pnr.ts  agent/tools.ts  agent/system-prompt.ts
src/sanity/      client.ts  write-client.ts  queries.ts  structure.ts  schemaTypes/
```

**Env** (`.env.local`, git-ignored): `NEXT_PUBLIC_SANITY_PROJECT_ID=0298rbtw`, `NEXT_PUBLIC_SANITY_DATASET=production`,
`SANITY_API_READ_TOKEN`, `SANITY_API_WRITE_TOKEN`, `SANITY_CONTEXT_MCP_URL`, `OPENROUTER_API_KEY`,
plus the Clerk keys written by `clerk init`.

---

## Verification

**Unit** — `src/lib/seat-map.ts` and `src/lib/pricing.ts` are pure; test with `node --test`: seat generation per cabin
layout, aisle/window flags, exit rows, fare math with and without the PRO waiver.

**Build** — `pnpm sanity schema deploy && pnpm typegen` (no `any` in `sanity.types.ts`), then a clean `pnpm build`.

**End-to-end** — I drive this with the Browser MCP and report what I actually see:

1. `/studio` loads, Studio authenticates, seeded flights visible
2. `/` → search DEL→BOM round-trip, economy → results for both legs
3. `/seats` → seat map renders the correct layout; occupied seats unclickable; "Continue" gated until N seats chosen for N passengers
4. `/checkout` → card ending `0000` declines; a normal card creates the booking → `/confirmation/[pnr]`
5. Studio shows the `booking` document with the right `fareBreakdown` and seats
6. Re-run the same flight/seats in a second session → server-side conflict error, no double-booking
7. `/concierge` signed out and as a **free** user → upsell; a direct `POST /api/concierge/chat` returns **403**
8. Upgrade via `<PricingTable/>` (Stripe test card `4242…`) → `/concierge` opens; seat fees now show **$0** at checkout
9. In chat: "find me a flight to Mumbai next Friday" → tool call → flight cards; "book it" → confirm card → click → booking appears in `/bookings`
10. "What's your baggage policy?" → answered from `supportArticle` content via Sanity Context

**Health** — `clerk doctor` clean; browser console clean on client-side route transitions, not just SSR.

---

## Known risks

1. **Sanity Studio 6 embedded in Next.js 16 / React 19 under pnpm.** Sanity recommends a standalone Studio; you asked
   for `/studio`. `shamefully-hoist=true` should handle the `styled-components` peer resolution. If it still breaks,
   I'll report the exact error and the options rather than silently reverting to a standalone Studio.
2. **Clerk Billing plan creation** may not be fully scriptable via `clerk api`. If not, I'll give you the exact
   dashboard fields for the `pro` plan and its two features.
3. **`proxy.ts` vs `middleware.ts`** — I'll use whatever `clerk init` generates for Next 16 and verify the matcher.
4. **Sanity MCP** stays unusable until you restart Claude Code. Nothing in this plan depends on it.
