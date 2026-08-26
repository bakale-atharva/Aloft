import Link from 'next/link'
import {Plane} from 'lucide-react'

import {buttonClass} from '@/components/ui/Button'
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
    <div className="flex flex-col gap-4 rounded-card border border-border bg-surface-2 p-6 shadow-card transition hover:border-border-accent hover:shadow-float sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-6">
        <div className="w-24 shrink-0">
          <p className="text-sm font-semibold text-ink">{flight.airline.code}</p>
          <p className="text-xs text-ink-muted">{flight.flightNumber}</p>
        </div>

        <div className="flex flex-1 items-center gap-4">
          <div className="text-right">
            <p className="font-display text-lg text-ink">
              {formatTime(flight.departureTime, flight.origin.timezone)}
            </p>
            <p className="text-xs text-ink">{flight.origin.code}</p>
          </div>

          <div className="flex flex-1 flex-col items-center px-2">
            <p className="text-xs text-ink-muted">
              {formatDuration(flight.durationMinutes)}
            </p>
            <div className="relative my-1 flex w-full items-center">
              <div className="border-t border-dashed border-border flex-1" />
              <Plane className="absolute left-1/2 size-4 -translate-x-1/2 bg-surface-2 text-accent-600 rotate-90" aria-hidden />
              <div className="border-t border-dashed border-border flex-1" />
            </div>
            <p className="text-[10px] uppercase tracking-wide text-ink-muted">
              Nonstop
            </p>
          </div>

          <div>
            <p className="font-display text-lg text-ink">
              {formatTime(flight.arrivalTime, flight.destination.timezone)}
            </p>
            <p className="text-xs text-ink">{flight.destination.code}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
        <div className="text-right">
          <p className="font-display text-2xl text-ink">
            ${fare.basePrice}
            <span className="text-xs font-normal text-ink-faint"> /person</span>
          </p>
          {passengers > 1 && (
            <p className="text-xs text-ink-muted">
              ${fare.basePrice * passengers} total
            </p>
          )}
        </div>
        <Link
          href={selectHref}
          className={buttonClass({variant: 'primary', size: 'md'})}
        >
          Select
        </Link>
      </div>
    </div>
  )
}
