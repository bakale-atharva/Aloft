import Link from 'next/link'

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
          <h2 className="text-2xl font-semibold tracking-tight">Popular routes</h2>
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            Lowest economy fares on our busiest city pairs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => (
          <Link
            key={`${route.originCode}-${route.destinationCode}`}
            href={searchHref(route)}
            className="group rounded-xl border border-black/10 p-5 transition-colors hover:border-black/25 dark:border-white/10 dark:hover:border-white/30"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-semibold">
                {route.originCode} → {route.destinationCode}
              </p>
              <p className="text-sm font-semibold">
                from {route.currency} ${route.fromPrice}
              </p>
            </div>
            <p className="mt-1 text-sm text-black/60 dark:text-white/60">
              {route.originCity} to {route.destinationCity}
            </p>
            <p className="mt-3 text-xs text-black/45 dark:text-white/45">
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
