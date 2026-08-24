import Link from 'next/link'

import type {FlightResult} from '@/lib/types'
import type {CabinClass} from '@/lib/seat-map'

function formatTime(iso: string, timezone: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(new Date(iso))
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

export function FlightCard({
  flight,
  cabinClass,
  passengers,
  selectHref,
}: {
  flight: FlightResult
  cabinClass: CabinClass
  passengers: number
  selectHref: string
}) {
  const fare = flight.fares.find((f) => f.cabinClass === cabinClass)
  if (!fare) return null

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-black/10 p-5 transition-colors hover:border-black/20 dark:border-white/10 dark:hover:border-white/25 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-6">
        <div className="w-24 shrink-0">
          <p className="text-sm font-semibold">{flight.airline.code}</p>
          <p className="text-xs text-black/50 dark:text-white/50">{flight.flightNumber}</p>
        </div>

        <div className="flex flex-1 items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-semibold">
              {formatTime(flight.departureTime, flight.origin.timezone)}
            </p>
            <p className="text-xs text-black/50 dark:text-white/50">{flight.origin.code}</p>
          </div>

          <div className="flex flex-1 flex-col items-center px-2">
            <p className="text-xs text-black/50 dark:text-white/50">
              {formatDuration(flight.durationMinutes)}
            </p>
            <div className="my-1 h-px w-full bg-black/15 dark:bg-white/20" />
            <p className="text-[10px] uppercase tracking-wide text-black/40 dark:text-white/40">
              Nonstop
            </p>
          </div>

          <div>
            <p className="text-lg font-semibold">
              {formatTime(flight.arrivalTime, flight.destination.timezone)}
            </p>
            <p className="text-xs text-black/50 dark:text-white/50">{flight.destination.code}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
        <div className="text-right">
          <p className="text-xl font-semibold">
            ${fare.basePrice}
            <span className="text-xs font-normal text-black/50 dark:text-white/50"> /person</span>
          </p>
          {passengers > 1 && (
            <p className="text-xs text-black/50 dark:text-white/50">
              ${fare.basePrice * passengers} total
            </p>
          )}
        </div>
        <Link
          href={selectHref}
          className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background hover:opacity-90"
        >
          Select
        </Link>
      </div>
    </div>
  )
}
