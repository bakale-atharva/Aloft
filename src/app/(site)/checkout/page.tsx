import Link from 'next/link'
import {redirect} from 'next/navigation'

import {client} from '@/sanity/client'
import {FLIGHT_BY_ID_QUERY} from '@/sanity/queries'
import {CheckoutForm} from '@/components/checkout/CheckoutForm'
import {Card} from '@/components/ui/Card'
import {getEntitlements} from '@/lib/entitlements'
import {calculateFare} from '@/lib/pricing'
import type {CabinClass} from '@/lib/seat-map'
import type {FlightResult} from '@/lib/types'

type SearchParams = {
  outboundFlightId?: string
  inboundFlightId?: string
  passengers?: string
  cabinClass?: string
  tripType?: string
  outboundSeats?: string
  inboundSeats?: string
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const {
    outboundFlightId,
    inboundFlightId,
    passengers: passengersStr = '1',
    cabinClass = 'economy',
    tripType = 'oneway',
    outboundSeats = '',
    inboundSeats = '',
  } = params

  const {userId, seatFeesWaived} = await getEntitlements()
  if (!userId) {
    redirect('/sign-in')
  }

  if (!outboundFlightId || !outboundSeats) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Card tone="plain" padding="lg" className="text-center">
          <p className="text-ink-muted">
            Missing booking details.{' '}
            <Link href="/" className="underline">
              Start a new search
            </Link>
            .
          </p>
        </Card>
      </div>
    )
  }

  const passengers = Math.max(1, Number(passengersStr) || 1)
  const flightIds = [outboundFlightId, ...(inboundFlightId ? [inboundFlightId] : [])]
  const flights = await Promise.all(
    flightIds.map((id) =>
      client.fetch<FlightResult | null>(FLIGHT_BY_ID_QUERY, {id}, {next: {revalidate: 0}}),
    ),
  )

  if (flights.some((f) => !f)) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Card tone="plain" padding="lg" className="text-center">
          <p className="text-ink-muted">
            One of the selected flights could not be found.{' '}
            <Link href="/" className="underline">
              Start a new search
            </Link>
            .
          </p>
        </Card>
      </div>
    )
  }

  const legSeatIds = [
    outboundSeats.split(',').filter(Boolean),
    ...(inboundFlightId ? [inboundSeats.split(',').filter(Boolean)] : []),
  ]

  const legs = flights.map((flight, i) => {
    const f = flight as FlightResult
    const fare = f.fares.find((fr) => fr.cabinClass === cabinClass)!
    const exitRows = f.aircraft.seatLayout.find((s) => s.cabinClass === cabinClass)?.exitRows ?? []
    const exitRowSet = new Set(exitRows.map(String))
    return {
      fare,
      passengerCount: passengers,
      seats: legSeatIds[i].map((seatId) => ({
        seatId,
        isExitRow: exitRowSet.has(seatId.match(/^\d+/)?.[0] ?? ''),
      })),
    }
  })

  const fareBreakdown = calculateFare(legs, seatFeesWaived)

  const seatsParams = new URLSearchParams({
    outboundFlightId,
    passengers: String(passengers),
    cabinClass,
    tripType,
  })
  if (inboundFlightId) seatsParams.set('inboundFlightId', inboundFlightId)

  const hidden: Record<string, string> = {
    outboundFlightId,
    outboundSeats,
    passengers: String(passengers),
    cabinClass,
    tripType,
  }
  if (inboundFlightId) {
    hidden.inboundFlightId = inboundFlightId
    hidden.inboundSeats = inboundSeats
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <h1 className="mb-6 font-display text-ink">Checkout</h1>
      <Card tone="plain" padding="sm" className="mb-8">
        <div className="flex flex-col gap-2">
          {flights.map((flight, i) => {
            const f = flight as FlightResult
            return (
              <p key={f._id} className="text-sm">
                <span className="font-display text-ink">{i === 0 && inboundFlightId ? 'Outbound' : i === 1 ? 'Return' : 'Flight'}</span>
                {' '}·{' '}
                <span className="text-ink-muted">{f.origin.code} → {f.destination.code} · {f.flightNumber} · {(cabinClass as CabinClass).replace(/^\w/, (c) => c.toUpperCase())} · Seats {legSeatIds[i].join(', ')}</span>
              </p>
            )
          })}
        </div>
      </Card>
      <CheckoutForm
        hidden={hidden}
        passengers={passengers}
        seatFeesWaived={seatFeesWaived}
        fareBreakdown={fareBreakdown}
        seatsHref={`/seats?${seatsParams.toString()}`}
      />
    </div>
  )
}
