import Link from 'next/link'
import {notFound} from 'next/navigation'
import {Check} from 'lucide-react'

import {client} from '@/sanity/client'
import {BOOKING_BY_PNR_QUERY} from '@/sanity/queries'
import {buttonClass} from '@/components/ui/Button'
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
        <div className="mb-4 flex justify-center">
          <span className="grid size-12 place-items-center rounded-full bg-success-soft text-success">
            <Check className="size-6" strokeWidth={2.5} />
          </span>
        </div>
        <p className="text-sm font-medium uppercase tracking-wide text-success">
          Booking confirmed
        </p>
        <h1 className="mt-2 font-display text-6xl font-semibold tracking-tight text-ink">{booking.pnr}</h1>
        <p className="mt-1 text-xs uppercase tracking-[0.08em] text-ink-faint">
          Confirmation sent to {booking.contactEmail}
        </p>
      </div>

      <div className="relative rounded-card border border-border bg-surface-2 p-8 shadow-card before:absolute before:-left-3 before:top-1/2 before:size-6 before:-translate-y-1/2 before:rounded-full before:bg-canvas after:absolute after:-right-3 after:top-1/2 after:size-6 after:-translate-y-1/2 after:rounded-full after:bg-canvas">
        <div className="flex flex-col gap-4">
          {legs.map((leg, i) => (
            <div
              key={leg.flight._id}
              className={i > 0 ? 'border-t border-dashed border-border pt-4' : ''}
            >
              <p className="text-xs uppercase tracking-wide text-ink-faint">
                {i === 0 && legs.length > 1 ? 'Outbound' : legs.length > 1 ? 'Return' : 'Flight'}
              </p>
              <div className="mt-1 flex items-center justify-between">
                <div>
                  <p className="font-display text-ink">
                    {leg.flight.origin.code} → {leg.flight.destination.code}
                  </p>
                  <p className="text-sm text-ink-muted">
                    {leg.flight.airline.name} {leg.flight.flightNumber} · {leg.cabinClass}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-display text-ink">{formatTime(leg.flight.departureTime, leg.flight.origin.timezone)}</p>
                  <p className="text-ink-muted">
                    → {formatTime(leg.flight.arrivalTime, leg.flight.destination.timezone)}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-sm text-ink-muted">
                Seats: {leg.seats.map((s) => `${s.seatNumber} (${s.passengerName})`).join(', ')}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-dashed border-border pt-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Passengers
          </h2>
          <p className="text-sm text-ink">{booking.passengers.map((p) => p.fullName).join(', ')}</p>

          <h2 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Payment
          </h2>
          <p className="text-sm text-ink">
            Card ending {booking.payment.last4} · {booking.fareBreakdown.currency} $
            {booking.fareBreakdown.total}
            {booking.proSeatFeesWaived && ' (seat fees waived, PRO)'}
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/bookings"
          className={buttonClass({variant: 'primary'})}
        >
          View my bookings
        </Link>
        <Link
          href="/"
          className={buttonClass({variant: 'outline'})}
        >
          Book another flight
        </Link>
      </div>
    </div>
  )
}
