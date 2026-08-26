'use client'

import {useRouter, useSearchParams} from 'next/navigation'
import {useState} from 'react'

import {Button} from '@/components/ui/Button'
import {selectClass} from '@/components/ui/Field'
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
    <div className="rounded-card border border-border bg-surface-2 p-4 shadow-card">
      <div className="flex flex-wrap items-end gap-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-faint">
            Passengers
          </span>
          <PassengerStepper value={passengers} onChange={setPassengers} idPrefix="refine-passengers" variant="boxed" />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-faint">
            Class
          </span>
          <select
            value={cabinClass}
            onChange={(e) => setCabinClass(e.target.value as CabinClass)}
            className={selectClass}
          >
            {CABIN_CLASSES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <Button
          type="button"
          onClick={apply}
          disabled={!isDirty}
          variant="solid"
        >
          Update search
        </Button>
      </div>
    </div>
  )
}
