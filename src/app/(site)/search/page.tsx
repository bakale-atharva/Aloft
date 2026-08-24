import Link from 'next/link'

import {client} from '@/sanity/client'
import {SEARCH_FLIGHTS_QUERY} from '@/sanity/queries'
import {FlightCard} from '@/components/flight-card/FlightCard'
import type {CabinClass} from '@/lib/seat-map'
import type {FlightResult} from '@/lib/types'

type SearchParams = {
  tripType?: string
  origin?: string
  destination?: string
  departureDate?: string
  returnDate?: string
  passengers?: string
  cabinClass?: string
  outboundFlightId?: string
}

function dayRange(dateStr: string) {
  const dayStart = new Date(`${dateStr}T00:00:00.000Z`).toISOString()
  const dayEnd = new Date(`${dateStr}T23:59:59.999Z`).toISOString()
  return {dayStart, dayEnd}
}

async function fetchFlights(origin: string, destination: string, date: string, cabinClass: CabinClass) {
  const {dayStart, dayEnd} = dayRange(date)
  return client.fetch<FlightResult[]>(
    SEARCH_FLIGHTS_QUERY,
    {originCode: origin, destinationCode: destination, dayStart, dayEnd, cabinClass},
    {next: {revalidate: 30}},
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const {
    tripType = 'oneway',
    origin,
    destination,
    departureDate,
    returnDate,
    passengers: passengersStr = '1',
    cabinClass = 'economy',
    outboundFlightId,
  } = params

  if (!origin || !destination || !departureDate) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-black/60 dark:text-white/60">
          Missing search details.{' '}
          <Link href="/" className="underline">
            Start a new search
          </Link>
          .
        </p>
      </div>
    )
  }

  const passengers = Math.max(1, Number(passengersStr) || 1)
  const isRoundTrip = tripType === 'roundtrip'

  // Step 2 of a round trip: outbound already chosen, now show inbound flights.
  const showingInbound = isRoundTrip && !!outboundFlightId

  const activeOrigin = showingInbound ? destination : origin
  const activeDestination = showingInbound ? origin : destination
  const activeDate = showingInbound ? returnDate! : departureDate

  const flights = await fetchFlights(
    activeOrigin,
    activeDestination,
    activeDate,
    cabinClass as CabinClass,
  )

  const baseParams = new URLSearchParams({
    tripType,
    origin,
    destination,
    departureDate,
    passengers: String(passengers),
    cabinClass,
  })
  if (returnDate) baseParams.set('returnDate', returnDate)

  function buildSelectHref(flightId: string) {
    if (isRoundTrip && !showingInbound) {
      const next = new URLSearchParams(baseParams)
      next.set('outboundFlightId', flightId)
      return `/search?${next.toString()}`
    }
    const seatParams = new URLSearchParams(baseParams)
    if (showingInbound) {
      seatParams.set('outboundFlightId', outboundFlightId!)
      seatParams.set('inboundFlightId', flightId)
    } else {
      seatParams.set('outboundFlightId', flightId)
    }
    return `/seats?${seatParams.toString()}`
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="mb-6">
        <p className="text-sm text-black/50 dark:text-white/50">
          {showingInbound ? 'Return flight' : isRoundTrip ? 'Outbound flight' : 'Flights'} ·{' '}
          {passengers} passenger{passengers > 1 ? 's' : ''} · {cabinClass}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {activeOrigin} → {activeDestination}
        </h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          {new Date(`${activeDate}T00:00:00Z`).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {flights.length === 0 ? (
        <p className="rounded-xl border border-black/10 p-8 text-center text-black/60 dark:border-white/10 dark:text-white/60">
          No flights found for this route and date. Try a different date.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {flights.map((flight) => (
            <FlightCard
              key={flight._id}
              flight={flight}
              cabinClass={cabinClass as CabinClass}
              passengers={passengers}
              selectHref={buildSelectHref(flight._id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
