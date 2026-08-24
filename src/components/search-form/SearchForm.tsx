'use client'

import {useRouter} from 'next/navigation'
import {useState} from 'react'

type Airport = {_id: string; code: string; name: string; city: string; country: string}

const CABIN_CLASSES = [
  {value: 'economy', label: 'Economy'},
  {value: 'business', label: 'Business'},
  {value: 'first', label: 'First'},
] as const

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

const inputClass =
  'w-full rounded-xl border border-black/10 bg-transparent px-3 py-2.5 text-sm focus:outline-2 focus:outline-offset-1 focus:outline-current dark:border-white/15'

export function SearchForm({airports}: {airports: Airport[]}) {
  const router = useRouter()
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('roundtrip')
  const [origin, setOrigin] = useState(airports[0]?.code ?? '')
  const [destination, setDestination] = useState(airports[1]?.code ?? '')
  const [departureDate, setDepartureDate] = useState(todayIso())
  const [returnDate, setReturnDate] = useState(todayIso())
  const [passengers, setPassengers] = useState(1)
  const [cabinClass, setCabinClass] = useState<(typeof CABIN_CLASSES)[number]['value']>('economy')
  const [error, setError] = useState<string | null>(null)

  function handleSwap() {
    setOrigin(destination)
    setDestination(origin)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (origin === destination) {
      setError('Origin and destination must be different.')
      return
    }
    if (tripType === 'roundtrip' && returnDate < departureDate) {
      setError('Return date must be on or after the departure date.')
      return
    }
    setError(null)

    const params = new URLSearchParams({
      tripType,
      origin,
      destination,
      departureDate,
      passengers: String(passengers),
      cabinClass,
    })
    if (tripType === 'roundtrip') {
      params.set('returnDate', returnDate)
    }
    router.push(`/search?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-black/40 sm:p-8"
    >
      <div className="mb-6 flex gap-1 rounded-full bg-black/5 p-1 text-sm font-medium dark:bg-white/10 w-fit">
        {(['roundtrip', 'oneway'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setTripType(type)}
            className={`rounded-full px-4 py-1.5 transition-colors ${
              tripType === type
                ? 'bg-foreground text-background'
                : 'text-black/60 hover:text-foreground dark:text-white/60'
            }`}
          >
            {type === 'roundtrip' ? 'Round trip' : 'One way'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 lg:col-span-4">
          <Field label="From">
            <select value={origin} onChange={(e) => setOrigin(e.target.value)} className={inputClass}>
              {airports.map((a) => (
                <option key={a._id} value={a.code}>
                  {a.code} — {a.city}
                </option>
              ))}
            </select>
          </Field>
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap origin and destination"
            className="mb-0.5 rounded-full border border-black/10 p-2 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            <SwapIcon />
          </button>
          <Field label="To">
            <select value={destination} onChange={(e) => setDestination(e.target.value)} className={inputClass}>
              {airports.map((a) => (
                <option key={a._id} value={a.code}>
                  {a.code} — {a.city}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:col-span-4">
          <Field label="Depart">
            <input
              type="date"
              value={departureDate}
              min={todayIso()}
              onChange={(e) => setDepartureDate(e.target.value)}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Return">
            <input
              type="date"
              value={returnDate}
              min={departureDate}
              onChange={(e) => setReturnDate(e.target.value)}
              disabled={tripType === 'oneway'}
              className={`${inputClass} disabled:opacity-40`}
              required={tripType === 'roundtrip'}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:col-span-4">
          <Field label="Passengers">
            <input
              type="number"
              min={1}
              max={9}
              value={passengers}
              onChange={(e) => setPassengers(Math.min(9, Math.max(1, Number(e.target.value))))}
              className={inputClass}
            />
          </Field>
          <Field label="Class">
            <select
              value={cabinClass}
              onChange={(e) => setCabinClass(e.target.value as typeof cabinClass)}
              className={inputClass}
            >
              {CABIN_CLASSES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        className="mt-6 w-full rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 sm:w-auto"
      >
        Search flights
      </button>
    </form>
  )
}

function Field({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50">
        {label}
      </span>
      {children}
    </label>
  )
}

function SwapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 16V4M7 4L3 8M7 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 8v12M17 20l4-4M17 20l-4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
