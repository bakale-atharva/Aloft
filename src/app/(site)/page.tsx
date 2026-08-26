import Link from 'next/link'

import {Armchair, ArrowLeftRight, Check, ChevronRight, Sparkles, Star} from 'lucide-react'

import {client} from '@/sanity/client'
import {
  AIRPORTS_QUERY,
  FAQ_PREVIEW_QUERY,
  LANDING_STATS_QUERY,
  POPULAR_ROUTES_QUERY,
} from '@/sanity/queries'
import {cn} from '@/components/ui/cn'
import {buttonClass} from '@/components/ui/Button'
import {Card} from '@/components/ui/Card'
import {Pill, Badge} from '@/components/ui/Pill'
import {StatChevron} from '@/components/ui/StatChevron'
import {GradientText} from '@/components/ui/GradientText'
import {HeroAircraft} from '@/components/landing/HeroAircraft'
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
      <section className="relative isolate hero-wash">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/4 -z-10 h-[420px] bg-[radial-gradient(55%_50%_at_50%_50%,var(--accent-200),transparent_72%)] opacity-70"
        />
        <div className="mx-auto w-full max-w-6xl px-6 pt-12 pb-44 sm:pt-16 lg:pb-48">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="max-w-2xl">
              <Pill as="span">Real seat maps · No hidden seat fees on PRO</Pill>
              <h1 className="mt-5 text-balance font-display text-[clamp(2.5rem,7vw,4.75rem)] font-semibold leading-[0.94] tracking-[-0.035em] text-ink">
                Book flights easily,
                <br />
                <GradientText>travel smarter.</GradientText>
              </h1>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-muted">
                Search flights, pick your exact seat on a real cabin map, and book in minutes. PRO
                members skip every seat fee and get their own AI concierge.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Link href="/pricing" className={buttonClass({variant: 'primary', size: 'lg'})}>
                  Get started
                  <ChevronRight className="size-4" />
                </Link>
                <SocialProof travellers={stats.travellers} />
              </div>
            </div>
            <StatRail stats={stats} />
          </div>
          <div className="relative mx-auto mt-6 w-full max-w-2xl lg:-mt-20">
            <HeroAircraft className="h-auto w-full select-none" />
          </div>
        </div>
      </section>

      <div className="relative z-20 -mt-32 px-4 sm:px-6 lg:-mt-36">
        <div className="mx-auto w-full max-w-5xl">
          <SearchForm airports={airports} />
        </div>
      </div>

      <section id="popular-routes">
        <PopularRoutes routes={popularRoutes} />
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold text-ink">How booking works</h2>
          <p className="mt-1 text-sm text-ink-muted">
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

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <Feature
            title="Visual seat picker"
            description="See the real cabin layout for your aircraft and tap the exact seat you want, exit rows and all. Seat availability is checked again at checkout, so you never double-book."
            icon="armchair"
          />
          <Feature
            title="One-way or round trip"
            description="Search both directions in a single flow, with a running total that updates as you pick seats for each leg."
            icon="arrow"
          />
          <Feature
            title="AI concierge, PRO only"
            description="Chat your way to a booking or get instant support answers. The concierge always shows you a confirmation card before it books or cancels anything."
            icon="sparkles"
          />
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto w-full max-w-4xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold text-ink">Free vs PRO</h2>
          <p className="mt-1 text-sm text-ink-muted">
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
          <h2 className="font-display text-2xl font-semibold text-ink">Common questions</h2>
          <p className="mt-1 text-sm text-ink-muted">
            PRO members can ask the concierge these directly, in plain language.
          </p>

          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {faqs.map((faq) => (
              <li key={faq._id}>
                <Card tone="plain" padding="sm">
                  <Badge tone="accent">{faq.category}</Badge>
                  <p className="mt-2 text-sm font-medium text-ink">{faq.question}</p>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="border-t border-border">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 px-6 py-16 text-center">
          <h2 className="font-display text-2xl font-semibold text-ink">Ready when you are.</h2>
          <p className="max-w-md text-sm text-ink-muted">
            Pick a route above, or let the concierge do the searching for you.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link href="/pricing" className={buttonClass({variant: 'primary', size: 'lg'})}>
              Upgrade to PRO
            </Link>
            <Link href="/bookings" className={buttonClass({variant: 'outline', size: 'lg'})}>
              My bookings
            </Link>
          </div>
        </div>
      </section>
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
      <span className="grid size-10 place-items-center rounded-full bg-accent-100 font-display font-semibold text-accent-600">
        {number}
      </span>
      <h3 className="mt-3 font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-muted">{description}</p>
    </li>
  )
}

function Feature({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: 'armchair' | 'arrow' | 'sparkles'
}) {
  const icons = {
    armchair: Armchair,
    arrow: ArrowLeftRight,
    sparkles: Sparkles,
  }
  const Icon = icons[icon]

  return (
    <Card tone="raised">
      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-100 text-accent-600">
        <Icon className="size-4" strokeWidth={2} aria-hidden />
      </div>
      <h2 className="mt-4 font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm text-ink-muted">{description}</p>
    </Card>
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
  if (highlighted) {
    return (
      <div className="rounded-card bg-gradient-brand p-px">
        <div className="rounded-[calc(1.5rem-1px)] bg-surface p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-ink">{name}</p>
          <p className="mt-1 text-sm text-ink-muted">{tagline}</p>
          <ul className="mt-5 flex flex-1 flex-col gap-2 text-sm">
            {features.map((feature) => (
              <li key={feature} className="flex gap-2">
                <Check className="size-4 shrink-0 text-accent-600" />
                <span className="text-ink">{feature}</span>
              </li>
            ))}
          </ul>
          {cta && (
            <Link
              href={cta.href}
              className={cn('mt-6 block', buttonClass({variant: 'primary', size: 'lg'}))}
            >
              {cta.label}
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card tone="plain">
      <p className="text-sm font-semibold uppercase tracking-wide text-ink">{name}</p>
      <p className="mt-1 text-sm text-ink-muted">{tagline}</p>
      <ul className="mt-5 flex flex-1 flex-col gap-2 text-sm">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <Check className="size-4 shrink-0 text-accent-600" />
            <span className="text-ink">{feature}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function StatRail({stats}: {stats: {airports: number; airlines: number; flights: number}}) {
  return (
    <ul className="-mx-6 flex snap-x gap-3 overflow-x-auto px-6 pb-2 lg:mx-0 lg:w-64 lg:flex-col lg:overflow-visible lg:px-0">
      <li className="shrink-0 snap-start lg:w-full">
        <StatChevron value={`${stats.airlines}+`} label="Airlines supported" />
      </li>
      <li className="shrink-0 snap-start lg:w-full">
        <StatChevron value={`${stats.airports}+`} label="Airports worldwide" />
      </li>
      <li className="shrink-0 snap-start lg:w-full">
        <StatChevron value={`${stats.flights}+`} label="Scheduled flights" />
      </li>
    </ul>
  )
}

function SocialProof({travellers}: {travellers?: number}) {
  if (!travellers) return null

  return (
    <div className="flex items-center gap-3">
      <div aria-hidden className="flex -space-x-2">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="size-8 rounded-full bg-gradient-to-br from-accent-300 to-pink-300 ring-2 ring-surface"
          />
        ))}
      </div>
      <div>
        <div className="flex items-center gap-1">
          <Star className="size-4 fill-warning text-warning" />
          <span className="text-sm font-semibold text-ink">{travellers.toLocaleString()}</span>
        </div>
        <p className="text-xs text-ink-muted">travellers booked with Aloft</p>
      </div>
    </div>
  )
}
