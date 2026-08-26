import Link from 'next/link'

import {client} from '@/sanity/client'
import {
  AIRPORTS_QUERY,
  FAQ_PREVIEW_QUERY,
  LANDING_STATS_QUERY,
  POPULAR_ROUTES_QUERY,
} from '@/sanity/queries'
import {SearchForm} from '@/components/search-form/SearchForm'
import {PopularRoutes, type PopularRoute} from '@/components/landing/PopularRoutes'

type Airport = {_id: string; code: string; name: string; city: string; country: string}

function isCompleteAirport(airport: {
  _id: string
  code: string | null
  name: string | null
  city: string | null
  country: string | null
}): airport is Airport {
  return !!airport.code && !!airport.name && !!airport.city && !!airport.country
}

function isCompleteRoute(route: {
  originCode: string | null
  originCity: string | null
  destinationCode: string | null
  destinationCity: string | null
  fromPrice: number | null
  currency: string | null
  durationMinutes: number | null
  departureTime: string | null
}): route is PopularRoute {
  return (
    !!route.originCode &&
    !!route.originCity &&
    !!route.destinationCode &&
    !!route.destinationCity &&
    route.fromPrice !== null &&
    !!route.currency &&
    route.durationMinutes !== null &&
    !!route.departureTime
  )
}

/** One card per city pair — the query is sorted by price, so the first wins. */
function dedupeByRoute(routes: PopularRoute[], limit: number) {
  const seen = new Set<string>()
  const result: PopularRoute[] = []
  for (const route of routes) {
    const key = `${route.originCode}-${route.destinationCode}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push(route)
    if (result.length === limit) break
  }
  return result
}

export default async function Home() {
  const [rawAirports, rawRoutes, stats, faqs] = await Promise.all([
    client.fetch(AIRPORTS_QUERY, {}, {next: {revalidate: 300}}),
    client.fetch(POPULAR_ROUTES_QUERY, {}, {next: {revalidate: 300}}),
    client.fetch(LANDING_STATS_QUERY, {}, {next: {revalidate: 300}}),
    client.fetch(FAQ_PREVIEW_QUERY, {}, {next: {revalidate: 300}}),
  ])

  const airports = rawAirports.filter(isCompleteAirport)
  const popularRoutes = dedupeByRoute(rawRoutes.filter(isCompleteRoute), 6)

  return (
    <div className="flex flex-1 flex-col">
      <section className="relative overflow-hidden border-b border-black/10 bg-gradient-to-b from-blue-50 to-background dark:border-white/10 dark:from-blue-950/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black/60 dark:border-white/15 dark:text-white/60">
              Real seat maps · No hidden seat fees on PRO
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Fly further, sit better.
            </h1>
            <p className="mt-4 text-lg text-black/60 dark:text-white/60">
              Search flights, pick your exact seat on a real cabin map, and book in minutes. PRO
              members skip every seat fee and get their own AI concierge.
            </p>
          </div>
          <SearchForm airports={airports} />

          <dl className="grid grid-cols-3 gap-6 border-t border-black/10 pt-8 dark:border-white/10 sm:max-w-lg">
            <Stat value={stats.airports} label="Airports" />
            <Stat value={stats.airlines} label="Airlines" />
            <Stat value={stats.flights} label="Scheduled flights" />
          </dl>
        </div>
      </section>

      <PopularRoutes routes={popularRoutes} />

      <section className="border-y border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">How booking works</h2>
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            Four steps, no account required until checkout.
          </p>

          <ol className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Step
              number={1}
              title="Search"
              description="Pick one-way or round trip, your dates, passengers, and cabin class. Both legs are searched in a single flow."
            />
            <Step
              number={2}
              title="Compare"
              description="See every scheduled flight on your route with times, duration, and per-person fares side by side."
            />
            <Step
              number={3}
              title="Choose your seat"
              description="A real cabin map for your aircraft — window, aisle, and exit rows marked, taken seats greyed out."
            />
            <Step
              number={4}
              title="Confirm"
              description="Enter passenger details, pay, and get a boarding-pass style confirmation with your PNR."
            />
          </ol>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-6 py-16 sm:grid-cols-3">
        <Feature
          title="Visual seat picker"
          description="See the real cabin layout for your aircraft and tap the exact seat you want, exit rows and all. Seat availability is checked again at checkout, so you never double-book."
        />
        <Feature
          title="One-way or round trip"
          description="Search both directions in a single flow, with a running total that updates as you pick seats for each leg."
        />
        <Feature
          title="AI concierge, PRO only"
          description="Chat your way to a booking or get instant support answers. The concierge always shows you a confirmation card before it books or cancels anything."
        />
      </section>

      <section className="border-y border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mx-auto w-full max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Free vs PRO</h2>
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            Everything in Free, plus the parts that save you money on every trip.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PlanCard
              name="Free"
              tagline="Everything you need to book a flight."
              features={[
                'Search one-way and round trips',
                'Full visual seat map',
                'Manage and cancel your bookings',
                'Seat selection charged per seat',
              ]}
            />
            <PlanCard
              name="PRO"
              highlighted
              tagline="For people who fly often enough to care where they sit."
              features={[
                'Everything in Free',
                'Every seat fee waived, including exit rows',
                'AI concierge that can search and book for you',
                'Instant answers from our support library',
              ]}
              cta={{href: '/pricing', label: 'See pricing'}}
            />
          </div>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="mx-auto w-full max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Common questions</h2>
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            PRO members can ask the concierge these directly, in plain language.
          </p>

          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {faqs.map((faq) => (
              <li
                key={faq._id}
                className="rounded-xl border border-black/10 p-4 dark:border-white/10"
              >
                <p className="text-xs uppercase tracking-wide text-black/40 dark:text-white/40">
                  {faq.category}
                </p>
                <p className="mt-1 text-sm font-medium">{faq.question}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="border-t border-black/10 dark:border-white/10">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Ready when you are.</h2>
          <p className="max-w-md text-sm text-black/60 dark:text-white/60">
            Pick a route above, or let the concierge do the searching for you.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/pricing"
              className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90"
            >
              Upgrade to PRO
            </Link>
            <Link
              href="/bookings"
              className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            >
              My bookings
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function Stat({value, label}: {value: number; label: string}) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="text-2xl font-semibold tracking-tight">{value}</dd>
      <p className="mt-0.5 text-xs text-black/50 dark:text-white/50">{label}</p>
    </div>
  )
}

function Step({
  number,
  title,
  description,
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <li>
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-black/15 text-sm font-semibold dark:border-white/20">
        {number}
      </span>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-black/60 dark:text-white/60">{description}</p>
    </li>
  )
}

function Feature({title, description}: {title: string; description: string}) {
  return (
    <div>
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">{description}</p>
    </div>
  )
}

function PlanCard({
  name,
  tagline,
  features,
  highlighted,
  cta,
}: {
  name: string
  tagline: string
  features: string[]
  highlighted?: boolean
  cta?: {href: string; label: string}
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border p-6 ${
        highlighted
          ? 'border-blue-500/40 bg-blue-50/50 dark:border-blue-400/30 dark:bg-blue-950/20'
          : 'border-black/10 dark:border-white/10'
      }`}
    >
      <p className="text-sm font-semibold uppercase tracking-wide">{name}</p>
      <p className="mt-1 text-sm text-black/60 dark:text-white/60">{tagline}</p>
      <ul className="mt-5 flex flex-1 flex-col gap-2 text-sm">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span aria-hidden className="text-black/30 dark:text-white/30">
              —
            </span>
            <span className="text-black/70 dark:text-white/70">{feature}</span>
          </li>
        ))}
      </ul>
      {cta && (
        <Link
          href={cta.href}
          className="mt-6 rounded-full bg-foreground px-5 py-2.5 text-center text-sm font-semibold text-background hover:opacity-90"
        >
          {cta.label}
        </Link>
      )}
    </div>
  )
}
