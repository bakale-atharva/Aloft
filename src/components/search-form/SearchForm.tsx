'use client'

import {useRouter} from 'next/navigation'
import {useState} from 'react'
import {ArrowLeftRight, Calendar, CalendarCheck, PlaneLanding, PlaneTakeoff, Search, Users, Armchair, Check} from 'lucide-react'

import {cn} from '@/components/ui/cn'
import {buttonClass} from '@/components/ui/Button'
import {Segment} from '@/components/ui/Field'
import {PassengerStepper} from './PassengerStepper'

type Airport = {_id: string; code: string; name: string; city: string; country: string}

const CABIN_CLASSES = [
  {value: 'economy', label: 'Economy'},
  {value: 'business', label: 'Business'},
  {value: 'first', label: 'First'},
] as const

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

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
    <form onSubmit={handleSubmit} className="rounded-card bg-surface p-3 shadow-float ring-1 ring-border sm:rounded-[2rem] sm:p-4">
      <div role="radiogroup" aria-label="Trip type" className="flex flex-wrap gap-2 px-2 pb-3 pt-1">
        <TripTypeOption value="roundtrip" label="Round trip" checked={tripType === 'roundtrip'} onSelect={setTripType} />
        <TripTypeOption value="oneway" label="One way" checked={tripType === 'oneway'} onSelect={setTripType} />
      </div>

      <div className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-[1.25rem] bg-surface-sunken lg:grid-cols-[1fr_auto_1fr_1fr_1fr_1fr_auto] lg:divide-x lg:divide-y-0">
        <Segment icon={PlaneTakeoff} label="From">
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="mt-0.5 w-full min-w-0 cursor-pointer appearance-none truncate bg-transparent text-base font-semibold text-ink outline-none"
          >
            {airports.map((a) => (
              <option key={a._id} value={a.code}>
                {a.code} — {a.city}
              </option>
            ))}
          </select>
        </Segment>

        <button
          type="button"
          onClick={handleSwap}
          aria-label="Swap origin and destination"
          className="grid place-items-center bg-surface px-3 text-ink-muted transition hover:text-accent-600"
        >
          <ArrowLeftRight className="size-4" />
        </button>

        <Segment icon={PlaneLanding} label="To">
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="mt-0.5 w-full min-w-0 cursor-pointer appearance-none truncate bg-transparent text-base font-semibold text-ink outline-none"
          >
            {airports.map((a) => (
              <option key={a._id} value={a.code}>
                {a.code} — {a.city}
              </option>
            ))}
          </select>
        </Segment>

        <Segment icon={Calendar} label="Depart">
          <input
            type="date"
            value={departureDate}
            min={todayIso()}
            onChange={(e) => setDepartureDate(e.target.value)}
            className="mt-0.5 w-full min-w-0 cursor-pointer appearance-none truncate bg-transparent text-base font-semibold text-ink outline-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
            required
          />
        </Segment>

        <Segment icon={CalendarCheck} label="Return">
          <input
            type="date"
            value={returnDate}
            min={departureDate}
            onChange={(e) => setReturnDate(e.target.value)}
            disabled={tripType === 'oneway'}
            className="mt-0.5 w-full min-w-0 cursor-pointer appearance-none truncate bg-transparent text-base font-semibold text-ink outline-none disabled:opacity-50 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
            required={tripType === 'roundtrip'}
          />
        </Segment>

        <Segment icon={Users} label="Travellers">
          <PassengerStepper value={passengers} onChange={setPassengers} variant="bare" />
        </Segment>

        <Segment icon={Armchair} label="Cabin">
          <select
            value={cabinClass}
            onChange={(e) => setCabinClass(e.target.value as typeof cabinClass)}
            className="mt-0.5 w-full min-w-0 cursor-pointer appearance-none truncate bg-transparent text-base font-semibold text-ink outline-none"
          >
            {CABIN_CLASSES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Segment>

        <div className="bg-surface p-2 lg:pl-3">
          <button type="submit" className={buttonClass({variant: 'primary', size: 'lg', className: 'w-full lg:w-auto'})}>
            <Search className="size-4" />
            Search
          </button>
        </div>
      </div>

      {error && <p role="alert" className="mt-3 px-2 text-sm text-danger">{error}</p>}
    </form>
  )
}

function TripTypeOption({value, label, checked, onSelect}: {value: 'oneway' | 'roundtrip'; label: string; checked: boolean; onSelect: (v: 'oneway' | 'roundtrip') => void}) {
  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition', checked ? 'border-border-accent bg-accent-50 text-accent-700' : 'border-border text-ink-muted hover:border-border-strong')}>
      <input type="radio" name="tripType" value={value} checked={checked} onChange={() => onSelect(value)} className="sr-only" />
      <span aria-hidden className={cn('grid size-4 place-items-center rounded-[5px] border transition', checked ? 'border-transparent bg-gradient-brand text-on-accent' : 'border-border-strong')}>
        {checked && <Check className="size-3" strokeWidth={3} />}
      </span>
      {label}
    </label>
  )
}
