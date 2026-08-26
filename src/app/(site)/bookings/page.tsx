import Link from 'next/link'
import {redirect} from 'next/navigation'
import {Plane, Sparkles} from 'lucide-react'

import {client} from '@/sanity/client'
import {MY_BOOKINGS_QUERY} from '@/sanity/queries'
import {CancelButton} from '@/components/bookings/CancelButton'
import {Badge} from '@/components/ui/Pill'
import {Card} from '@/components/ui/Card'
import {getEntitlements} from '@/lib/entitlements'
import type {FlightResult} from '@/lib/types'

type BookingLeg = {
  cabinClass: string
  seats: {seatNumber: string}[]
  flight: FlightResult
}

type Booking = {
  _id: string
  pnr: string
  tripType: string
  status: 'pending' | 'confirmed' | 'cancelled'
  fareBreakdown: {total: number; currency: string}
  bookedVia: string
  _createdAt: string
  outbound: BookingLeg
  inbound: BookingLeg | null
}

function formatDate(iso: string, timezone: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: timezone,
  }).format(new Date(iso))
}

const STATUS_TONES: Record<Booking['status'], 'success' | 'warning' | 'neutral'> = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'neutral',
}

export default async function BookingsPage() {
  const {userId} = await getEntitlements()
  if (!userId) {
    redirect('/sign-in')
  }

  const bookings = await client.fetch<Booking[]>(
    MY_BOOKINGS_QUERY,
    {clerkUserId: userId},
    {next: {revalidate: 0}},
  )

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="mb-6 font-display text-ink">My bookings</h1>

      {bookings.length === 0 ? (
        <Card tone="plain" padding="lg" className="text-center">
          <Plane className="mx-auto mb-4 size-8 text-ink-faint" />
          <p className="text-ink-muted">
            No bookings yet.{' '}
            <Link href="/" className="underline">
              Search flights
            </Link>
            .
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <Card key={booking._id} tone="raised" padding="md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-ink">{booking.pnr}</p>
                    <Badge tone={STATUS_TONES[booking.status]}>
                      {booking.status}
                    </Badge>
                    {booking.bookedVia === 'concierge' && (
                      <Badge tone="accent">
                        <Sparkles className="size-3" />
                        via concierge
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">
                    {booking.outbound.flight.origin.code} → {booking.outbound.flight.destination.code}
                    {booking.inbound &&
                      ` · ${booking.inbound.flight.origin.code} → ${booking.inbound.flight.destination.code}`}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {formatDate(
                      booking.outbound.flight.departureTime,
                      booking.outbound.flight.origin.timezone,
                    )}{' '}
                    · Seats {booking.outbound.seats.map((s) => s.seatNumber).join(', ')}
                    {booking.inbound &&
                      ` / ${booking.inbound.seats.map((s) => s.seatNumber).join(', ')}`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="font-display text-ink">
                    {booking.fareBreakdown.currency} ${booking.fareBreakdown.total}
                  </p>
                  {booking.status !== 'cancelled' && <CancelButton pnr={booking.pnr} />}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
