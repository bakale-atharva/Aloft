import Link from 'next/link'

import {Plane} from 'lucide-react'

import {client} from '@/sanity/client'
import {FLIGHT_BY_ID_QUERY, OCCUPIED_SEATS_QUERY} from '@/sanity/queries'
import {Card} from '@/components/ui/Card'
import {SeatSelectionFlow} from '@/components/seat-map/SeatSelectionFlow'
import {getEntitlements} from '@/lib/entitlements'
import type {CabinClass} from '@/lib/seat-map'
import type {FlightResult} from '@/lib/types'

type SearchParams = {
  outboundFlightId?: string
  inboundFlightId?: string
  passengers?: string
  cabinClass?: string
  tripType?: string
  origin?: string
  destination?: string
  departureDate?: string
  returnDate?: string
}

export default async function SeatsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const {outboundFlightId, inboundFlightId, passengers: passengersStr = '1', cabinClass = 'economy'} =
    params

  if (!outboundFlightId) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Card tone="plain" padding="lg" className="text-center">
          <Plane className="mx-auto mb-3 size-8 text-ink-faint" aria-hidden />
          <p className="text-ink-muted">
            No flight selected.{' '}
            <Link href="/" className="font-medium text-accent-600 underline">
              Start a new search
            </Link>
            .
          </p>
        </Card>
      </div>
    )
  }

  const passengers = Math.max(1, Number(passengersStr) || 1)
  const {seatFeesWaived} = await getEntitlements()

  const flightIds = [outboundFlightId, ...(inboundFlightId ? [inboundFlightId] : [])]
  const [flights, occupiedByFlight] = await Promise.all([
    Promise.all(
      flightIds.map((id) =>
        client.fetch<FlightResult | null>(FLIGHT_BY_ID_QUERY, {id}, {next: {revalidate: 0}}),
      ),
    ),
    Promise.all(
      flightIds.map((id) =>
        client.fetch<string[]>(OCCUPIED_SEATS_QUERY, {flightId: id}, {next: {revalidate: 0}}),
      ),
    ),
  ])

  const missing = flights.some((f) => !f)
  if (missing) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Card tone="plain" padding="lg" className="text-center">
          <Plane className="mx-auto mb-3 size-8 text-ink-faint" aria-hidden />
          <p className="text-ink-muted">
            One of the selected flights could not be found.{' '}
            <Link href="/" className="font-medium text-accent-600 underline">
              Start a new search
            </Link>
            .
          </p>
        </Card>
      </div>
    )
  }

  const legs = flights.map((flight, i) => ({
    label: i === 0 ? (inboundFlightId ? 'Outbound' : 'Flight') : 'Return',
    flight: flight as FlightResult,
    cabinClass: cabinClass as CabinClass,
    occupiedSeatIds: occupiedByFlight[i],
  }))

  const checkoutParams = new URLSearchParams({
    outboundFlightId,
    passengers: String(passengers),
    cabinClass,
    tripType: params.tripType ?? 'oneway',
  })
  if (inboundFlightId) checkoutParams.set('inboundFlightId', inboundFlightId)

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="mb-6 font-display text-2xl font-semibold tracking-tight text-ink">Choose your seats</h1>
      <SeatSelectionFlow
        legs={legs}
        passengers={passengers}
        seatFeesWaived={seatFeesWaived}
        checkoutBasePath={`/checkout?${checkoutParams.toString()}`}
      />
    </div>
  )
}
