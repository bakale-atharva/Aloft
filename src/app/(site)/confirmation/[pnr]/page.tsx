import Link from 'next/link'
import {notFound} from 'next/navigation'

import {client} from '@/sanity/client'
import {BOOKING_BY_PNR_QUERY} from '@/sanity/queries'
import {getEntitlements} from '@/lib/entitlements'
import type {FlightResult} from '@/lib/types'

type BookingLeg = {
  cabinClass: string
  seats: {seatNumber: string; passengerName: string; fee: number}[]
  flight: FlightResult
}

type Booking = {
  _id: string
  pnr: string
  clerkUserId: string
  contactName: string
  contactEmail: string
  tripType: string
  status: string
  fareBreakdown: {baseFare: number; seatFees: number; taxes: number; total: number; currency: string}
  proSeatFeesWaived: boolean
  payment: {method: string; last4: string; transactionId: string; paidAt: string}
  passengers: {fullName: string}[]
  bookedVia: string
  outbound: BookingLeg
  inbound: BookingLeg | null
}

function formatTime(iso: string, timezone: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  }).format(new Date(iso))
}

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{pnr: string}>
}) {
  const {pnr} = await params
  const {userId} = await getEntitlements()

  const booking = await client.fetch<Booking | null>(
    BOOKING_BY_PNR_QUERY,
    {pnr: pnr.toUpperCase()},
    {next: {revalidate: 0}},
  )

  if (!booking || booking.clerkUserId !== userId) {
    notFound()
  }

  const legs = [booking.outbound, booking.inbound].filter(Boolean) as BookingLeg[]

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Booking confirmed
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">{booking.pnr}</h1>
        <p className="mt-1 text-sm text-black/50 dark:text-white/50">
          Confirmation sent to {booking.contactEmail}
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-black/10 p-6 dark:border-white/10">
        {legs.map((leg, i) => (
          <div
            key={leg.flight._id}
            className={i > 0 ? 'border-t border-black/10 pt-4 dark:border-white/10' : ''}
          >
            <p className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
              {i === 0 && legs.length > 1 ? 'Outbound' : legs.length > 1 ? 'Return' : 'Flight'}
            </p>
            <div className="mt-1 flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">
                  {leg.flight.origin.code} → {leg.flight.destination.code}
                </p>
                <p className="text-sm text-black/60 dark:text-white/60">
                  {leg.flight.airline.name} {leg.flight.flightNumber} · {leg.cabinClass}
                </p>
              </div>
              <div className="text-right text-sm">
                <p>{formatTime(leg.flight.departureTime, leg.flight.origin.timezone)}</p>
                <p className="text-black/50 dark:text-white/50">
                  → {formatTime(leg.flight.arrivalTime, leg.flight.destination.timezone)}
                </p>
              </div>
            </div>
            <p className="mt-2 text-sm text-black/60 dark:text-white/60">
              Seats: {leg.seats.map((s) => `${s.seatNumber} (${s.passengerName})`).join(', ')}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-black/10 p-6 dark:border-white/10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">
          Passengers
        </h2>
        <p className="text-sm">{booking.passengers.map((p) => p.fullName).join(', ')}</p>

        <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">
          Payment
        </h2>
        <p className="text-sm">
          Card ending {booking.payment.last4} · {booking.fareBreakdown.currency} $
          {booking.fareBreakdown.total}
          {booking.proSeatFeesWaived && ' (seat fees waived, PRO)'}
        </p>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/bookings"
          className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90"
        >
          View my bookings
        </Link>
        <Link
          href="/"
          className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
        >
          Book another flight
        </Link>
      </div>
    </div>
  )
}
