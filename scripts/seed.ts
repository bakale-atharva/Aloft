/**
 * Seeds airports, airlines, aircraft, flights, and support articles into the
 * Aloft dataset. Idempotent: every document has a deterministic _id
 * and is written with createOrReplace, so re-running is safe.
 *
 * Requires SANITY_API_WRITE_TOKEN. Run with:
 *   node --env-file=.env.local scripts/seed.ts
 */
import {createClient} from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !dataset) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET')
}
if (!token) {
  throw new Error(
    'Missing SANITY_API_WRITE_TOKEN. Create one at https://sanity.io/manage -> API -> Tokens (Editor role) and add it to .env.local',
  )
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-08-21',
  token,
  useCdn: false,
})

type CabinClass = 'economy' | 'business' | 'first'

type Airport = {code: string; name: string; city: string; country: string; timezone: string}

const airports: Airport[] = [
  {code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', timezone: 'America/New_York'},
  {code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', timezone: 'America/Los_Angeles'},
  {code: 'ORD', name: "O'Hare International Airport", city: 'Chicago', country: 'United States', timezone: 'America/Chicago'},
  {code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', timezone: 'Europe/London'},
  {code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', timezone: 'Europe/Paris'},
  {code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', timezone: 'Asia/Dubai'},
  {code: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India', timezone: 'Asia/Kolkata'},
  {code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata'},
  {code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo'},
  {code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States', timezone: 'America/Los_Angeles'},
]

const airlines = [
  {slug: 'globalair', name: 'GlobalAir', code: 'GA'},
  {slug: 'skyward', name: 'Skyward Airlines', code: 'SW'},
  {slug: 'transcon', name: 'TransContinental', code: 'TC'},
  {slug: 'oceanic', name: 'Oceanic Airways', code: 'OA'},
] as const

const aircraft = [
  {
    slug: '787-9',
    model: 'Boeing 787-9',
    registration: 'N787GA',
    seatLayout: [
      {_type: 'cabinSection', _key: 'biz', cabinClass: 'business', startRow: 1, endRow: 6, columnLayout: 'AC|DG', exitRows: [1]},
      {_type: 'cabinSection', _key: 'eco', cabinClass: 'economy', startRow: 10, endRow: 35, columnLayout: 'ABC|DEFG|HJK', exitRows: [10, 25]},
    ],
  },
  {
    slug: 'a350',
    model: 'Airbus A350-900',
    registration: 'N350SW',
    seatLayout: [
      {_type: 'cabinSection', _key: 'first', cabinClass: 'first', startRow: 1, endRow: 2, columnLayout: 'A|D', exitRows: []},
      {_type: 'cabinSection', _key: 'biz', cabinClass: 'business', startRow: 4, endRow: 9, columnLayout: 'AC|DG', exitRows: [4]},
      {_type: 'cabinSection', _key: 'eco', cabinClass: 'economy', startRow: 12, endRow: 38, columnLayout: 'ABC|DEF|HJK', exitRows: [12, 28]},
    ],
  },
  {
    slug: '737max',
    model: 'Boeing 737 MAX 9',
    registration: 'N737TC',
    seatLayout: [
      {_type: 'cabinSection', _key: 'biz', cabinClass: 'business', startRow: 1, endRow: 4, columnLayout: 'AC|DF', exitRows: []},
      {_type: 'cabinSection', _key: 'eco', cabinClass: 'economy', startRow: 8, endRow: 30, columnLayout: 'ABC|DEF', exitRows: [14]},
    ],
  },
] as const

const routes: [string, string][] = [
  ['jfk', 'lax'], ['lax', 'jfk'],
  ['jfk', 'lhr'], ['lhr', 'jfk'],
  ['del', 'bom'], ['bom', 'del'],
  ['dxb', 'lhr'], ['lhr', 'dxb'],
  ['sfo', 'ord'], ['ord', 'sfo'],
]

const durationOverrides: Record<string, number> = {
  'jfk-lax': 360, 'lax-jfk': 330,
  'jfk-lhr': 420, 'lhr-jfk': 480,
  'del-bom': 130, 'bom-del': 130,
  'dxb-lhr': 440, 'lhr-dxb': 400,
  'sfo-ord': 240, 'ord-sfo': 260,
}

const airlineToAircraft: Record<(typeof airlines)[number]['slug'], (typeof aircraft)[number]['slug']> = {
  globalair: '787-9',
  skyward: 'a350',
  transcon: '737max',
  oceanic: '787-9',
}

function buildFares(duration: number, aircraftSlug: string) {
  const fares = [
    {_type: 'fare', _key: 'economy', cabinClass: 'economy' as CabinClass, basePrice: 150 + duration, seatFee: 15, exitRowSeatFee: 35, currency: 'USD'},
    {_type: 'fare', _key: 'business', cabinClass: 'business' as CabinClass, basePrice: 650 + duration * 2, seatFee: 40, exitRowSeatFee: 60, currency: 'USD'},
  ]
  if (aircraftSlug === 'a350') {
    fares.push({_type: 'fare', _key: 'first', cabinClass: 'first' as CabinClass, basePrice: 1400 + duration * 3, seatFee: 0, exitRowSeatFee: 0, currency: 'USD'})
  }
  return fares
}

function buildFlights(baseDate: Date) {
  const docs: Record<string, unknown>[] = []
  let flightSeq = 100
  let dayIndex = 0

  for (let day = 0; day < 12; day += 3, dayIndex += 1) {
    routes.forEach(([origin, destination], i) => {
      const airline = airlines[(dayIndex + i) % airlines.length]
      const aircraftSlug = airlineToAircraft[airline.slug]
      const duration = durationOverrides[`${origin}-${destination}`] ?? 300

      const depDate = new Date(baseDate)
      depDate.setUTCDate(depDate.getUTCDate() + day)
      depDate.setUTCHours(6 + (i % 6) * 2, 0, 0, 0)
      const arrDate = new Date(depDate.getTime() + duration * 60000)

      flightSeq += 1
      const flightNumber = `${airline.code}${flightSeq}`
      const id = `flight-${flightNumber.toLowerCase()}-${origin}-${destination}-${depDate.toISOString().slice(0, 10)}`

      docs.push({
        _id: id,
        _type: 'flight',
        flightNumber,
        airline: {_type: 'reference', _ref: `airline-${airline.slug}`},
        aircraft: {_type: 'reference', _ref: `aircraft-${aircraftSlug}`},
        origin: {_type: 'reference', _ref: `airport-${origin}`},
        destination: {_type: 'reference', _ref: `airport-${destination}`},
        departureTime: depDate.toISOString(),
        arrivalTime: arrDate.toISOString(),
        durationMinutes: duration,
        fares: buildFares(duration, aircraftSlug),
        status: 'scheduled',
      })
    })
  }

  return docs
}

const supportArticles: {question: string; slug: string; category: string; answer: string}[] = [
  {question: 'What is my baggage allowance?', slug: 'baggage-allowance', category: 'baggage', answer: 'Economy passengers get one carry-on (max 8kg) and one checked bag (max 23kg). Business and First passengers get two checked bags (max 32kg each). Extra bags can be added at checkout for a fee.'},
  {question: 'What happens if I exceed the baggage weight limit?', slug: 'baggage-overweight', category: 'baggage', answer: 'Bags between 23kg and 32kg incur a $75 overweight fee. Bags over 32kg must be split into two, or shipped separately as cargo.'},
  {question: 'When does online check-in open?', slug: 'checkin-window', category: 'checkin', answer: 'Online check-in opens 24 hours before departure and closes 90 minutes before departure for international flights, or 45 minutes for domestic flights.'},
  {question: 'Do I need to print my boarding pass?', slug: 'boarding-pass-print', category: 'checkin', answer: "No, a mobile boarding pass from your confirmation email works at every gate we operate. A printed copy is only required if your connecting itinerary includes a partner airline that doesn't yet support mobile passes."},
  {question: 'Can I change my flight after booking?', slug: 'flight-changes', category: 'changes', answer: 'Yes. Changes made more than 24 hours before departure carry no change fee, only the fare difference. Changes within 24 hours incur a $50 change fee plus any fare difference.'},
  {question: 'What is your cancellation policy?', slug: 'cancellation-policy', category: 'changes', answer: 'Bookings can be cancelled up to 2 hours before departure for a full refund to your original payment method, processed within 5-7 business days. Cancellations within 2 hours of departure are non-refundable.'},
  {question: 'How do I select my seat?', slug: 'seat-selection', category: 'seats', answer: "After choosing your flight, you'll see a visual seat map for your cabin class. Tap any available seat to select it. Exit-row and extra-legroom seats carry a small premium; standard seats have a smaller selection fee. PRO members have all seat fees waived."},
  {question: "What's the difference between economy, business, and first class?", slug: 'cabin-classes', category: 'seats', answer: 'Economy offers standard seating with our full in-flight service. Business adds extra legroom, priority boarding, and lounge access on eligible routes. First class offers the most space, priority everything, and premium dining. First class is only available on select long-haul aircraft.'},
  {question: 'What payment methods do you accept?', slug: 'payment-methods', category: 'payments', answer: 'We accept all major credit and debit cards at checkout. This is a demo booking flow, so no real charges are ever made — card numbers are validated for format only and never stored.'},
  {question: 'How long do refunds take?', slug: 'refund-timing', category: 'payments', answer: 'Refunds for eligible cancellations are issued to your original payment method within 5-7 business days.'},
  {question: 'What do I get with a PRO membership?', slug: 'pro-benefits', category: 'pro', answer: 'PRO members ($9.99/month) get every seat-selection fee waived on every booking, plus access to the AI concierge desk — a chat assistant that can search flights, answer support questions, and book or cancel flights for you.'},
  {question: 'How do I talk to the AI concierge?', slug: 'concierge-access', category: 'pro', answer: 'PRO members can open the Concierge page from the navigation bar at any time. You can ask it to find flights, check seat availability, review your bookings, or make a new booking on your behalf — it will always show you a confirmation before completing a booking or cancellation.'},
]

async function seed() {
  console.log('Seeding airports...')
  await Promise.all(
    airports.map((a) =>
      client.createOrReplace({
        _id: `airport-${a.code.toLowerCase()}`,
        _type: 'airport',
        ...a,
      }),
    ),
  )

  console.log('Seeding airlines...')
  await Promise.all(
    airlines.map((a) =>
      client.createOrReplace({
        _id: `airline-${a.slug}`,
        _type: 'airline',
        name: a.name,
        code: a.code,
      }),
    ),
  )

  console.log('Seeding aircraft...')
  await Promise.all(
    aircraft.map((a) =>
      client.createOrReplace({
        _id: `aircraft-${a.slug}`,
        _type: 'aircraft',
        model: a.model,
        registration: a.registration,
        seatLayout: a.seatLayout,
      }),
    ),
  )

  console.log('Seeding flights...')
  const flights = buildFlights(new Date('2026-08-23T00:00:00Z'))
  for (const batch of chunk(flights, 20)) {
    await Promise.all(batch.map((doc) => client.createOrReplace(doc as never)))
  }
  console.log(`  ${flights.length} flights`)

  console.log('Seeding support articles...')
  await Promise.all(
    supportArticles.map((a) =>
      client.createOrReplace({
        _id: `support-${a.slug}`,
        _type: 'supportArticle',
        question: a.question,
        slug: {_type: 'slug', current: a.slug},
        category: a.category,
        answer: [{_type: 'block', _key: 'b1', style: 'normal', children: [{_type: 'span', _key: 's1', text: a.answer}]}],
      }),
    ),
  )

  console.log('Done.')
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
