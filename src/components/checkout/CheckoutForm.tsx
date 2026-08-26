'use client'

import {useActionState} from 'react'
import {Users, CreditCard} from 'lucide-react'

import {INITIAL_BOOKING_STATE, processBooking} from '@/app/actions/booking'
import {Button} from '@/components/ui/Button'
import {Card} from '@/components/ui/Card'
import {Field, inputClass} from '@/components/ui/Field'
import type {FareBreakdown} from '@/lib/pricing'

const ERROR_MESSAGES: Record<string, string> = {
  MISSING_FIELDS: 'Please fill in every passenger and payment field.',
  FLIGHT_NOT_FOUND: 'One of the selected flights is no longer available.',
  SEAT_TAKEN: 'One or more of your seats were just taken by another passenger. Please pick again.',
  CARD_DECLINED: 'That card was declined. Try a different card number.',
}

export function CheckoutForm({
  hidden,
  passengers,
  seatFeesWaived,
  fareBreakdown,
  seatsHref,
}: {
  hidden: Record<string, string>
  passengers: number
  seatFeesWaived: boolean
  fareBreakdown: FareBreakdown
  seatsHref: string
}) {
  const [state, formAction, isPending] = useActionState(processBooking, INITIAL_BOOKING_STATE)

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <Card tone="raised">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-100 text-accent-600">
            <Users className="size-4" strokeWidth={2} aria-hidden />
          </span>
          <h2 className="font-display text-ink">Contact details</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input name="contactName" required className={inputClass} autoComplete="name" />
          </Field>
          <Field label="Email">
            <input
              type="email"
              name="contactEmail"
              required
              className={inputClass}
              autoComplete="email"
            />
          </Field>
        </div>
      </Card>

      <Card tone="raised">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-100 text-accent-600">
            <Users className="size-4" strokeWidth={2} aria-hidden />
          </span>
          <h2 className="font-display text-ink">Passengers</h2>
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({length: passengers}).map((_, i) => (
            <Field key={i} label={`Passenger ${i + 1} full name`}>
              <input name="passengerName" required className={inputClass} autoComplete="off" />
            </Field>
          ))}
        </div>
      </Card>

      <Card tone="raised">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-100 text-accent-600">
            <CreditCard className="size-4" strokeWidth={2} aria-hidden />
          </span>
          <h2 className="font-display text-ink">Payment</h2>
        </div>
        <p className="mb-4 text-xs text-ink-muted">
          This is a simulated charge — no real card is processed. Use any number; a card ending in{' '}
          <span className="font-mono">0000</span> will be declined.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Card number">
            <input
              name="cardNumber"
              inputMode="numeric"
              required
              minLength={4}
              placeholder="4242 4242 4242 4242"
              className={inputClass}
              autoComplete="cc-number"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Expiry">
              <input
                name="cardExpiry"
                required
                placeholder="MM/YY"
                className={inputClass}
                autoComplete="cc-exp"
              />
            </Field>
            <Field label="CVC">
              <input
                name="cardCvc"
                required
                placeholder="123"
                className={inputClass}
                autoComplete="cc-csc"
              />
            </Field>
          </div>
        </div>
      </Card>

      {state.error && (
        <div className="rounded-field border border-danger-border bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
          {ERROR_MESSAGES[state.error] ?? 'Something went wrong. Please try again.'}
          {state.error === 'SEAT_TAKEN' && state.conflictSeats && (
            <>
              {' '}
              Taken: {state.conflictSeats.join(', ')}.{' '}
              <a href={seatsHref} className="underline">
                Choose different seats
              </a>
              .
            </>
          )}
        </div>
      )}

      <Card tone="plain">
        <Row label="Base fare" value={fareBreakdown.baseFare} currency={fareBreakdown.currency} />
        <Row
          label={seatFeesWaived ? 'Seat fees (waived, PRO)' : 'Seat fees'}
          value={fareBreakdown.seatFees}
          currency={fareBreakdown.currency}
        />
        <Row label="Taxes" value={fareBreakdown.taxes} currency={fareBreakdown.currency} />
        <div className="mt-2 flex items-center justify-between border-t border-border pt-2 font-display text-2xl text-ink">
          <span>Total</span>
          <span>
            {fareBreakdown.currency} ${fareBreakdown.total}
          </span>
        </div>
      </Card>

      <Button variant="primary" size="lg" type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Processing payment…' : `Pay $${fareBreakdown.total} and book`}
      </Button>
    </form>
  )
}

function Row({label, value, currency}: {label: string; value: number; currency: string}) {
  return (
    <div className="flex items-center justify-between py-1 text-sm text-ink-muted">
      <span>{label}</span>
      <span>
        {currency} ${value}
      </span>
    </div>
  )
}
