'use server'

import {randomUUID} from 'crypto'

import {redirect} from 'next/navigation'
import {revalidatePath} from 'next/cache'

import {client} from '@/sanity/client'
import {writeClient} from '@/sanity/write-client'
import {FLIGHT_BY_ID_QUERY, OCCUPIED_SEATS_QUERY} from '@/sanity/queries'
import {getEntitlements} from '@/lib/entitlements'
import {calculateFare} from '@/lib/pricing'
import {generatePnr} from '@/lib/pnr'
import type {CabinClass} from '@/lib/seat-map'
import type {Fare, FlightResult} from '@/lib/types'

export type BookingActionState = {
  error?: 'MISSING_FIELDS' | 'FLIGHT_NOT_FOUND' | 'SEAT_TAKEN' | 'CARD_DECLINED'
  conflictSeats?: string[]
}

export const INITIAL_BOOKING_STATE: BookingActionState = {}

type LegData = {
  flight: FlightResult
  fare: Fare
  seats: string[]
  exitRowSet: Set<string>
}

function seatFee(leg: LegData, seatId: string, seatFeesWaived: boolean) {
  if (seatFeesWaived) return 0
  const rowNumber = seatId.match(/^\d+/)?.[0] ?? ''
  return leg.exitRowSet.has(rowNumber) ? leg.fare.exitRowSeatFee : leg.fare.seatFee
}

/**
 * Booking creation shared by /checkout and the AI concierge's confirm-gated
 * createBooking tool — both paths recompute the fare and re-check seat
 * availability here rather than trusting client-submitted values.
 */
export async function processBooking(
  _prevState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const {userId, seatFeesWaived} = await getEntitlements()
  if (!userId) {
    redirect('/sign-in')
  }

  const tripType = String(formData.get('tripType') ?? 'oneway')
  const cabinClass = String(formData.get('cabinClass') ?? 'economy') as CabinClass
  const outboundFlightId = String(formData.get('outboundFlightId') ?? '')
  const inboundFlightId = formData.get('inboundFlightId')
    ? String(formData.get('inboundFlightId'))
    : undefined
  const outboundSeats = String(formData.get('outboundSeats') ?? '')
    .split(',')
    .filter(Boolean)
  const inboundSeats = inboundFlightId
    ? String(formData.get('inboundSeats') ?? '')
        .split(',')
        .filter(Boolean)
    : []
  const contactName = String(formData.get('contactName') ?? '').trim()
  const contactEmail = String(formData.get('contactEmail') ?? '').trim()
  const cardNumber = String(formData.get('cardNumber') ?? '').replace(/\s+/g, '')
  const passengerNames = formData
    .getAll('passengerName')
    .map((v) => String(v).trim())
    .filter(Boolean)

  if (
    !outboundFlightId ||
    outboundSeats.length === 0 ||
    !contactName ||
    !contactEmail ||
    passengerNames.length === 0 ||
    outboundSeats.length !== passengerNames.length ||
    (inboundFlightId && inboundSeats.length !== passengerNames.length)
  ) {
    return {error: 'MISSING_FIELDS'}
  }

  const flightIds = [outboundFlightId, ...(inboundFlightId ? [inboundFlightId] : [])]
  const flights = await Promise.all(
    flightIds.map((id) =>
      client.fetch<FlightResult | null>(FLIGHT_BY_ID_QUERY, {id}, {cache: 'no-store'}),
    ),
  )
  if (flights.some((f) => !f)) {
    return {error: 'FLIGHT_NOT_FOUND'}
  }

  const occupiedByFlight = await Promise.all(
    flightIds.map((id) =>
      client.fetch<string[]>(OCCUPIED_SEATS_QUERY, {flightId: id}, {cache: 'no-store'}),
    ),
  )
  const legSeats = [outboundSeats, ...(inboundFlightId ? [inboundSeats] : [])]

  const conflictSeats: string[] = []
  legSeats.forEach((seats, i) => {
    const occupied = new Set(occupiedByFlight[i])
    seats.forEach((seatId) => {
      if (occupied.has(seatId)) conflictSeats.push(seatId)
    })
  })
  if (conflictSeats.length > 0) {
    return {error: 'SEAT_TAKEN', conflictSeats}
  }

  const legData: LegData[] = flights.map((flight, i) => {
    const f = flight as FlightResult
    const fare = f.fares.find((fr) => fr.cabinClass === cabinClass)!
    const exitRows = f.aircraft.seatLayout.find((s) => s.cabinClass === cabinClass)?.exitRows ?? []
    return {flight: f, fare, seats: legSeats[i], exitRowSet: new Set(exitRows.map(String))}
  })

  const fareBreakdown = calculateFare(
    legData.map((leg) => ({
      fare: leg.fare,
      passengerCount: passengerNames.length,
      seats: leg.seats.map((seatId) => ({
        seatId,
        isExitRow: leg.exitRowSet.has(seatId.match(/^\d+/)?.[0] ?? ''),
      })),
    })),
    seatFeesWaived,
  )

  // Simulate payment processing latency.
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const last4 = cardNumber.slice(-4)
  if (last4 === '0000') {
    return {error: 'CARD_DECLINED'}
  }

  let pnr = generatePnr()
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const existingId = await client.fetch<string | null>(
      `*[_type == "booking" && pnr == $pnr][0]._id`,
      {pnr},
      {cache: 'no-store'},
    )
    if (!existingId) break
    pnr = generatePnr()
  }

  function buildLeg(leg: LegData) {
    return {
      flight: {_type: 'reference', _ref: leg.flight._id},
      cabinClass,
      seats: leg.seats.map((seatId, i) => ({
        _type: 'bookedSeat',
        _key: seatId,
        seatNumber: seatId,
        passengerName: passengerNames[i] ?? passengerNames[0],
        fee: seatFee(leg, seatId, seatFeesWaived),
      })),
    }
  }

  await writeClient.create({
    _type: 'booking',
    pnr,
    clerkUserId: userId,
    contactName,
    contactEmail,
    tripType,
    outbound: buildLeg(legData[0]),
    ...(legData[1] ? {inbound: buildLeg(legData[1])} : {}),
    passengers: passengerNames.map((fullName) => ({
      _type: 'passenger',
      _key: randomUUID(),
      fullName,
    })),
    fareBreakdown,
    proSeatFeesWaived: seatFeesWaived,
    status: 'confirmed',
    payment: {
      method: 'dummy-card',
      last4,
      transactionId: randomUUID(),
      paidAt: new Date().toISOString(),
    },
    bookedVia: 'checkout',
  })

  revalidatePath('/bookings')
  redirect(`/confirmation/${pnr}`)
}

export async function cancelBooking(pnr: string) {
  const {userId} = await getEntitlements()
  if (!userId) {
    redirect('/sign-in')
  }

  const booking = await client.fetch<{_id: string; clerkUserId: string} | null>(
    `*[_type == "booking" && pnr == $pnr][0]{_id, clerkUserId}`,
    {pnr},
    {cache: 'no-store'},
  )
  if (!booking || booking.clerkUserId !== userId) {
    throw new Error('Booking not found')
  }

  await writeClient.patch(booking._id).set({status: 'cancelled'}).commit()
  revalidatePath('/bookings')
}
