'use client'

import Link from 'next/link'
import {useMemo, useState} from 'react'

import {SeatMap} from './SeatMap'
import {buttonClass} from '@/components/ui/Button'
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
              <p className="text-xs uppercase tracking-wide text-ink-muted">
                {leg.label}
              </p>
              <h2 className="font-display text-ink">
                {leg.flight.origin.code} → {leg.flight.destination.code}{' '}
                <span className="font-normal text-ink-muted">
                  · {leg.flight.flightNumber} · {leg.cabinClass}
                </span>
              </h2>
              <p className="text-sm text-ink-muted">
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

      <div className="sticky bottom-0 border-t border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="font-display text-lg text-ink">
              {fareBreakdown.currency} ${fareBreakdown.total}
              {fareBreakdown.seatFees > 0 && (
                <span className="ml-1 text-xs">(incl. ${fareBreakdown.seatFees} seat fees)</span>
              )}
            </p>
            <p className="text-xs text-ink-muted">
              {passengers} passenger{passengers > 1 ? 's' : ''} · taxes included
            </p>
          </div>
          {allComplete ? (
            <Link
              href={checkoutHref}
              className={buttonClass({variant: 'primary'})}
            >
              Continue to checkout
            </Link>
          ) : (
            <button
              disabled
              className={buttonClass({variant: 'primary', className: 'disabled:cursor-not-allowed disabled:opacity-50'})}
            >
              Continue to checkout
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
