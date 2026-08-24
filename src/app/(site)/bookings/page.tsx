import Link from 'next/link'
import {redirect} from 'next/navigation'

import {client} from '@/sanity/client'
import {MY_BOOKINGS_QUERY} from '@/sanity/queries'
import {CancelButton} from '@/components/bookings/CancelButton'
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

const STATUS_STYLES: Record<Booking['status'], string> = {
  confirmed: 'text-blue-600 dark:text-blue-400',
  pending: 'text-amber-600 dark:text-amber-400',
  cancelled: 'text-black/40 dark:text-white/40',
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
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">My bookings</h1>

      {bookings.length === 0 ? (
        <p className="rounded-xl border border-black/10 p-8 text-center text-black/60 dark:border-white/10 dark:text-white/60">
          No bookings yet.{' '}
          <Link href="/" className="underline">
            Search flights
          </Link>
          .
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="rounded-xl border border-black/10 p-5 dark:border-white/10"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{booking.pnr}</p>
                    <span className={`text-xs font-medium uppercase ${STATUS_STYLES[booking.status]}`}>
                      {booking.status}
                    </span>
                    {booking.bookedVia === 'concierge' && (
                      <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-black/50 dark:bg-white/10 dark:text-white/50">
                        via concierge
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                    {booking.outbound.flight.origin.code} → {booking.outbound.flight.destination.code}
                    {booking.inbound &&
                      ` · ${booking.inbound.flight.origin.code} → ${booking.inbound.flight.destination.code}`}
                  </p>
                  <p className="text-xs text-black/50 dark:text-white/50">
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
                  <p className="text-sm font-semibold">
                    {booking.fareBreakdown.currency} ${booking.fareBreakdown.total}
                  </p>
                  {booking.status !== 'cancelled' && <CancelButton pnr={booking.pnr} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
