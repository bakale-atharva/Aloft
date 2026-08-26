import {tool} from 'ai'
import {z} from 'zod'

import {client} from '@/sanity/client'
import {
  FLIGHT_BY_ID_QUERY,
  MY_BOOKINGS_QUERY,
  OCCUPIED_SEATS_QUERY,
  SEARCH_FLIGHTS_QUERY,
} from '@/sanity/queries'
import {generateSeats} from '@/lib/seat-map'
import type {CabinClass} from '@/lib/seat-map'
import type {FlightResult} from '@/lib/types'

function dayRange(dateStr: string) {
  const dayStart = new Date(`${dateStr}T00:00:00.000Z`).toISOString()
  const dayEnd = new Date(`${dateStr}T23:59:59.999Z`).toISOString()
  return {dayStart, dayEnd}
}

function summarizeFlight(flight: FlightResult) {
  return {
    flightId: flight._id,
    flightNumber: flight.flightNumber,
    airline: flight.airline.name,
    origin: flight.origin.code,
    destination: flight.destination.code,
    departureTime: flight.departureTime,
    arrivalTime: flight.arrivalTime,
    durationMinutes: flight.durationMinutes,
    fares: flight.fares.map((f) => ({
      cabinClass: f.cabinClass,
      basePrice: f.basePrice,
      seatFee: f.seatFee,
      exitRowSeatFee: f.exitRowSeatFee,
      currency: f.currency,
    })),
  }
}

/**
 * Read-only search/lookup tools execute directly — they can't leak another
 * user's data. `createBooking` and `cancelBooking` deliberately have no
 * `execute`: the model proposes, the chat UI renders a confirm card, and the
 * write only happens when the user clicks through the same server actions
 * `/checkout` and `/bookings` use (which re-verify ownership and availability).
 */
export function createAgentTools({userId}: {userId: string | null}) {
  return {
    searchFlights: tool({
      description:
        'Search scheduled flights between two airports on a given date for a cabin class. Use IATA airport codes (e.g. DEL, BOM).',
      inputSchema: z.object({
        originCode: z.string().length(3).describe('Origin airport IATA code'),
        destinationCode: z.string().length(3).describe('Destination airport IATA code'),
        date: z.string().describe('Departure date, YYYY-MM-DD'),
        cabinClass: z.enum(['economy', 'business', 'first']).default('economy'),
      }),
      execute: async ({originCode, destinationCode, date, cabinClass}) => {
        const {dayStart, dayEnd} = dayRange(date)
        const flights = await client.fetch<FlightResult[]>(SEARCH_FLIGHTS_QUERY, {
          originCode: originCode.toUpperCase(),
          destinationCode: destinationCode.toUpperCase(),
          dayStart,
          dayEnd,
          cabinClass,
        })
        return {flights: flights.map(summarizeFlight)}
      },
    }),

    getSeatAvailability: tool({
      description:
        'Get the seat layout and which seats are already taken for a flight and cabin class. Use this before proposing seats to a passenger.',
      inputSchema: z.object({
        flightId: z.string().describe('The flight _id from searchFlights'),
        cabinClass: z.enum(['economy', 'business', 'first']),
      }),
      execute: async ({flightId, cabinClass}) => {
        // Seat occupancy changes as people book — never serve it from cache.
        const [flight, occupied] = await Promise.all([
          client.fetch<FlightResult | null>(FLIGHT_BY_ID_QUERY, {id: flightId}),
          client.fetch<string[]>(OCCUPIED_SEATS_QUERY, {flightId}, {cache: 'no-store'}),
        ])
        if (!flight) return {error: 'Flight not found'}

        const section = flight.aircraft.seatLayout.find((s) => s.cabinClass === cabinClass)
        if (!section) return {error: `This aircraft has no ${cabinClass} cabin`}

        const seats = generateSeats([section], cabinClass as CabinClass)
        const occupiedSet = new Set(occupied)
        const availableSeatIds = seats.filter((s) => !occupiedSet.has(s.id)).map((s) => s.id)

        return {
          cabinClass,
          totalSeats: seats.length,
          occupiedSeats: occupied,
          availableSeats: availableSeatIds,
          exitRowSeats: seats.filter((s) => s.isExitRow).map((s) => s.id),
        }
      },
    }),

    getMyBookings: tool({
      description: "Look up the signed-in user's own bookings. Never returns another user's data.",
      inputSchema: z.object({}),
      execute: async () => {
        if (!userId) return {error: 'Not signed in'}
        const bookings = await client.fetch(
          MY_BOOKINGS_QUERY,
          {clerkUserId: userId},
          {cache: 'no-store'},
        )
        return {bookings}
      },
    }),

    createBooking: tool({
      description:
        "Propose creating a booking once the passenger has confirmed a flight, seats, and their contact/passenger details. This does NOT book anything by itself — it renders a confirmation card the user must click to actually pay and book. Always gather contactName, contactEmail, one full name per passenger, and a card number from the user first; never invent them.",
      inputSchema: z.object({
        tripType: z.enum(['oneway', 'roundtrip']),
        cabinClass: z.enum(['economy', 'business', 'first']),
        outboundFlightId: z.string(),
        outboundSeats: z.array(z.string()).describe('Seat IDs, e.g. ["12A", "12B"]'),
        inboundFlightId: z.string().optional(),
        inboundSeats: z.array(z.string()).optional(),
        contactName: z.string(),
        contactEmail: z.string(),
        passengerNames: z.array(z.string()).min(1),
        cardNumber: z.string().describe('Digits only or with spaces; only last 4 are ever stored'),
      }),
      // No execute — the client renders a confirm card and calls the
      // processBooking server action itself when the user clicks Confirm.
    }),

    cancelBooking: tool({
      description:
        "Propose cancelling one of the user's own bookings by PNR. This does NOT cancel anything by itself — it renders a confirm card the user must click. Ownership is re-verified server-side.",
      inputSchema: z.object({
        pnr: z.string().length(6),
      }),
      // No execute — confirm-gated, same as createBooking.
    }),
  }
}
