import {defineQuery} from 'next-sanity'

export const AIRPORTS_QUERY = defineQuery(
  `*[_type == "airport"] | order(code asc) {_id, code, name, city, country}`,
)

const FLIGHT_PROJECTION = `{
  _id,
  flightNumber,
  departureTime,
  arrivalTime,
  durationMinutes,
  fares,
  status,
  airline->{_id, name, code},
  aircraft->{_id, model, seatLayout},
  origin->{_id, code, name, city, timezone},
  destination->{_id, code, name, city, timezone},
}`

export const SEARCH_FLIGHTS_QUERY = defineQuery(
  `*[
    _type == "flight" &&
    status == "scheduled" &&
    origin->code == $originCode &&
    destination->code == $destinationCode &&
    departureTime >= $dayStart &&
    departureTime < $dayEnd &&
    count(fares[cabinClass == $cabinClass]) > 0
  ] | order(departureTime asc) ${FLIGHT_PROJECTION}`,
)

export const FLIGHT_BY_ID_QUERY = defineQuery(
  `*[_type == "flight" && _id == $id][0] ${FLIGHT_PROJECTION}`,
)

export const OCCUPIED_SEATS_QUERY = defineQuery(
  `*[
    _type == "booking" &&
    status != "cancelled" &&
    (outbound.flight._ref == $flightId || inbound.flight._ref == $flightId)
  ]{
    "seats": select(
      outbound.flight._ref == $flightId => outbound.seats[].seatNumber,
      inbound.flight._ref == $flightId => inbound.seats[].seatNumber,
    )
  }.seats[]`,
)

export const MY_BOOKINGS_QUERY = defineQuery(
  `*[_type == "booking" && clerkUserId == $clerkUserId] | order(_createdAt desc) {
    _id,
    pnr,
    tripType,
    status,
    fareBreakdown,
    bookedVia,
    _createdAt,
    outbound{
      cabinClass,
      seats,
      flight->${FLIGHT_PROJECTION}
    },
    inbound{
      cabinClass,
      seats,
      flight->${FLIGHT_PROJECTION}
    }
  }`,
)

export const BOOKING_BY_PNR_QUERY = defineQuery(
  `*[_type == "booking" && pnr == $pnr][0]{
    _id,
    pnr,
    clerkUserId,
    contactName,
    contactEmail,
    tripType,
    status,
    fareBreakdown,
    proSeatFeesWaived,
    payment,
    passengers,
    bookedVia,
    outbound{
      cabinClass,
      seats,
      flight->${FLIGHT_PROJECTION}
    },
    inbound{
      cabinClass,
      seats,
      flight->${FLIGHT_PROJECTION}
    }
  }`,
)

/**
 * Cheapest upcoming economy fare per route, for the landing page's grid.
 * `departureTime` comes back so each card can link at a date that actually
 * has a flight rather than an arbitrary offset from today.
 */
export const POPULAR_ROUTES_QUERY = defineQuery(
  `*[_type == "flight" && status == "scheduled" && departureTime > now()]{
    "originCode": origin->code,
    "originCity": origin->city,
    "destinationCode": destination->code,
    "destinationCity": destination->city,
    "fromPrice": fares[cabinClass == "economy"][0].basePrice,
    "currency": fares[cabinClass == "economy"][0].currency,
    durationMinutes,
    departureTime,
  }[defined(fromPrice)] | order(fromPrice asc)`,
)

export const LANDING_STATS_QUERY = defineQuery(
  `{
    "airports": count(*[_type == "airport"]),
    "airlines": count(*[_type == "airline"]),
    "flights": count(*[_type == "flight" && status == "scheduled"]),
  }`,
)

export const FAQ_PREVIEW_QUERY = defineQuery(
  `*[_type == "supportArticle" && category in ["seats", "baggage", "pro", "payments"]]
    | order(category asc)[0...6]{_id, question, category}`,
)

export const SUPPORT_ARTICLES_QUERY = defineQuery(
  `*[_type == "supportArticle"] | order(category asc) {_id, question, category, answer}`,
)
