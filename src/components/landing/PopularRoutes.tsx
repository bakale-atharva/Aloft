import Link from 'next/link'

import {Plane} from 'lucide-react'

import {cn} from '@/components/ui/cn'


export type PopularRoute = {
  originCode: string
  originCity: string
  destinationCode: string
  destinationCity: string
  fromPrice: number
  currency: string
  durationMinutes: number
  departureTime: string
}

function formatDuration(minutes: number) {
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

function searchHref(route: PopularRoute) {
  // Link at the date of the actual cheapest upcoming departure, so the
  // results page is never empty.
  const departureDate = route.departureTime.slice(0, 10)
  const params = new URLSearchParams({
    tripType: 'oneway',
    origin: route.originCode,
    destination: route.destinationCode,
    departureDate,
    passengers: '1',
    cabinClass: 'economy',
  })
  return `/search?${params.toString()}`
}

export function PopularRoutes({routes}: {routes: PopularRoute[]}) {
  if (routes.length === 0) return null

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Popular routes</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Lowest economy fares on our busiest city pairs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => (
          <Link
            key={`${route.originCode}-${route.destinationCode}`}
            href={searchHref(route)}
            className={cn(
              'transition hover:border-border-accent hover:shadow-float',
              'rounded-card border border-border p-5 flex flex-col',
            )}
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="flex items-center gap-2 font-semibold text-ink">
                {route.originCode}
                <Plane className="size-4 text-accent-600" aria-hidden />
                {route.destinationCode}
              </p>
              <p className="font-display text-accent-700">
                {route.currency} ${route.fromPrice}
              </p>
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              {route.originCity} to {route.destinationCity}
            </p>
            <p className="mt-3 text-xs text-ink-faint">
              Nonstop · {formatDuration(route.durationMinutes)} · next on{' '}
              {new Date(route.departureTime).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                timeZone: 'UTC',
              })}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
