import type {CabinClass} from './seat-map'

export type Fare = {
  cabinClass: CabinClass
  basePrice: number
  seatFee: number
  exitRowSeatFee: number
  currency: string
}

export type CabinSection = {
  cabinClass: CabinClass
  startRow: number
  endRow: number
  columnLayout: string
  exitRows?: number[]
}

export type FlightResult = {
  _id: string
  flightNumber: string
  departureTime: string
  arrivalTime: string
  durationMinutes: number
  fares: Fare[]
  status: 'scheduled' | 'cancelled'
  airline: {_id: string; name: string; code: string}
  aircraft: {_id: string; model: string; seatLayout: CabinSection[]}
  origin: {_id: string; code: string; name: string; city: string; timezone: string}
  destination: {_id: string; code: string; name: string; city: string; timezone: string}
}
