'use client'

import Link from 'next/link'
import {useMemo, useState} from 'react'

import {SeatMap} from './SeatMap'
import {calculateFare} from '@/lib/pricing'
import type {CabinClass} from '@/lib/seat-map'
import type {FlightResult} from '@/lib/types'

type Leg = {
  label: string
  flight: FlightResult
  cabinClass: CabinClass
  occupiedSeatIds: string[]
}

export function SeatSelectionFlow({
  legs,
  passengers,
  seatFeesWaived,
  checkoutBasePath,
}: {
  legs: Leg[]
  passengers: number
  seatFeesWaived: boolean
  checkoutBasePath: string
}) {
  const [selections, setSelections] = useState<string[][]>(() => legs.map(() => []))

  const fareBreakdown = useMemo(() => {
    const pricingLegs = legs.map((leg, i) => {
      const fare = leg.flight.fares.find((f) => f.cabinClass === leg.cabinClass)!
      const exitRowIds = new Set(
        leg.flight.aircraft.seatLayout
          .find((s) => s.cabinClass === leg.cabinClass)
          ?.exitRows?.map(String) ?? [],
      )
      return {
        fare,
        passengerCount: passengers,
        seats: selections[i].map((seatId) => ({
          seatId,
          isExitRow: exitRowIds.has(seatId.replace(/[A-Z]+$/, '')),
        })),
      }
    })
    return calculateFare(pricingLegs, seatFeesWaived)
  }, [legs, passengers, selections, seatFeesWaived])

  const allComplete = selections.every((seats) => seats.length === passengers)

  const checkoutHref = useMemo(() => {
    const params = new URLSearchParams(checkoutBasePath.split('?')[1] ?? '')
    legs.forEach((leg, i) => {
      const prefix = i === 0 ? 'outbound' : 'inbound'
      params.set(`${prefix}Seats`, selections[i].join(','))
    })
    return `/checkout?${params.toString()}`
  }, [checkoutBasePath, legs, selections])

  return (
    <div className="pb-28">
      <div className="flex flex-col gap-10">
        {legs.map((leg, i) => (
          <div key={leg.flight._id}>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
                {leg.label}
              </p>
              <h2 className="text-lg font-semibold">
                {leg.flight.origin.code} → {leg.flight.destination.code}{' '}
                <span className="font-normal text-black/50 dark:text-white/50">
                  · {leg.flight.flightNumber} · {leg.cabinClass}
                </span>
              </h2>
              <p className="text-sm text-black/50 dark:text-white/50">
                Select {passengers} seat{passengers > 1 ? 's' : ''} ({selections[i].length}/{passengers} chosen)
              </p>
            </div>
            <SeatMap
              seatLayout={leg.flight.aircraft.seatLayout}
              cabinClass={leg.cabinClass}
              occupiedSeatIds={leg.occupiedSeatIds}
              selected={selections[i]}
              maxSeats={passengers}
              onChange={(seats) =>
                setSelections((prev) => prev.map((s, idx) => (idx === i ? seats : s)))
              }
              seatFee={
                leg.flight.fares.find((f) => f.cabinClass === leg.cabinClass)?.seatFee ?? 0
              }
              exitRowSeatFee={
                leg.flight.fares.find((f) => f.cabinClass === leg.cabinClass)?.exitRowSeatFee ?? 0
              }
              seatFeesWaived={seatFeesWaived}
            />
          </div>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-black/10 bg-background/95 backdrop-blur-sm dark:border-white/10">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-sm text-black/50 dark:text-white/50">
              {fareBreakdown.currency} ${fareBreakdown.total}
              {fareBreakdown.seatFees > 0 && (
                <span className="ml-1 text-xs">(incl. ${fareBreakdown.seatFees} seat fees)</span>
              )}
            </p>
            <p className="text-xs text-black/40 dark:text-white/40">
              {passengers} passenger{passengers > 1 ? 's' : ''} · taxes included
            </p>
          </div>
          {allComplete ? (
            <Link
              href={checkoutHref}
              className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90"
            >
              Continue to checkout
            </Link>
          ) : (
            <button
              disabled
              className="cursor-not-allowed rounded-full bg-black/10 px-6 py-3 text-sm font-semibold text-black/40 dark:bg-white/10 dark:text-white/40"
            >
              Continue to checkout
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
