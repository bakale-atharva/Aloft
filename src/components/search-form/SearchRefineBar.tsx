'use client'

import {useRouter, useSearchParams} from 'next/navigation'
import {useState} from 'react'

import {PassengerStepper} from './PassengerStepper'
import type {CabinClass} from '@/lib/seat-map'

const CABIN_CLASSES: {value: CabinClass; label: string}[] = [
  {value: 'economy', label: 'Economy'},
  {value: 'business', label: 'Business'},
  {value: 'first', label: 'First'},
]

/**
 * Lets travelers change passenger count and cabin class without going back to
 * the home page. Both live in the URL, so applying just re-navigates.
 */
export function SearchRefineBar({
  passengers: initialPassengers,
  cabinClass: initialCabinClass,
}: {
  passengers: number
  cabinClass: CabinClass
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [passengers, setPassengers] = useState(initialPassengers)
  const [cabinClass, setCabinClass] = useState<CabinClass>(initialCabinClass)

  const isDirty = passengers !== initialPassengers || cabinClass !== initialCabinClass

  function apply() {
    const next = new URLSearchParams(searchParams.toString())
    next.set('passengers', String(passengers))
    next.set('cabinClass', cabinClass)
    // Cabin class changes invalidate an already-picked outbound leg's fare.
    if (cabinClass !== initialCabinClass) next.delete('outboundFlightId')
    router.push(`/search?${next.toString()}`)
  }

  return (
    <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-black/10 p-4 dark:border-white/10">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50">
          Passengers
        </span>
        <PassengerStepper value={passengers} onChange={setPassengers} idPrefix="refine-passengers" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50">
          Class
        </span>
        <select
          value={cabinClass}
          onChange={(e) => setCabinClass(e.target.value as CabinClass)}
          className="rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm focus:outline-2 focus:outline-offset-1 focus:outline-current dark:border-white/15"
        >
          {CABIN_CLASSES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={apply}
        disabled={!isDirty}
        className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Update search
      </button>
    </div>
  )
}
