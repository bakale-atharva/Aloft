import type {CabinClass} from './seat-map'

export type Fare = {
  cabinClass: CabinClass
  basePrice: number
  seatFee: number
  exitRowSeatFee: number
  currency: string
}

export type SelectedSeat = {
  seatId: string
  isExitRow: boolean
}

export type LegPricingInput = {
  fare: Fare
  passengerCount: number
  seats: SelectedSeat[]
}

export type FareBreakdown = {
  baseFare: number
  seatFees: number
  taxes: number
  total: number
  currency: string
}

const TAX_RATE = 0.12

/**
 * Server-authoritative fare calculation. Always recompute this at booking
 * time from the flight's own fares — never trust a client-submitted total.
 */
export function calculateFare(legs: LegPricingInput[], seatFeesWaived: boolean): FareBreakdown {
  if (legs.length === 0) {
    return {baseFare: 0, seatFees: 0, taxes: 0, total: 0, currency: 'USD'}
  }

  const currency = legs[0].fare.currency

  const baseFare = legs.reduce((sum, leg) => sum + leg.fare.basePrice * leg.passengerCount, 0)

  const seatFees = seatFeesWaived
    ? 0
    : legs.reduce(
        (sum, leg) =>
          sum +
          leg.seats.reduce(
            (seatSum, seat) => seatSum + (seat.isExitRow ? leg.fare.exitRowSeatFee : leg.fare.seatFee),
            0,
          ),
        0,
      )

  const taxes = Math.round((baseFare + seatFees) * TAX_RATE)
  const total = baseFare + seatFees + taxes

  return {baseFare, seatFees, taxes, total, currency}
}
