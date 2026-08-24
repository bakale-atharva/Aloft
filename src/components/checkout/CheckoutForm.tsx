'use client'

import {useActionState} from 'react'

import {INITIAL_BOOKING_STATE, processBooking} from '@/app/actions/booking'
import type {FareBreakdown} from '@/lib/pricing'

const inputClass =
  'w-full rounded-xl border border-black/10 bg-transparent px-3 py-2.5 text-sm focus:outline-2 focus:outline-offset-1 focus:outline-current dark:border-white/15'

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

      <section>
        <h2 className="mb-4 text-lg font-semibold">Contact details</h2>
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
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Passengers</h2>
        <div className="flex flex-col gap-3">
          {Array.from({length: passengers}).map((_, i) => (
            <Field key={i} label={`Passenger ${i + 1} full name`}>
              <input name="passengerName" required className={inputClass} autoComplete="off" />
            </Field>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Payment</h2>
        <p className="mb-4 text-xs text-black/50 dark:text-white/50">
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
      </section>

      {state.error && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
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

      <div className="rounded-xl border border-black/10 p-5 dark:border-white/10">
        <Row label="Base fare" value={fareBreakdown.baseFare} currency={fareBreakdown.currency} />
        <Row
          label={seatFeesWaived ? 'Seat fees (waived, PRO)' : 'Seat fees'}
          value={fareBreakdown.seatFees}
          currency={fareBreakdown.currency}
        />
        <Row label="Taxes" value={fareBreakdown.taxes} currency={fareBreakdown.currency} />
        <div className="mt-2 flex items-center justify-between border-t border-black/10 pt-2 text-base font-semibold dark:border-white/10">
          <span>Total</span>
          <span>
            {fareBreakdown.currency} ${fareBreakdown.total}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Processing payment…' : `Pay $${fareBreakdown.total} and book`}
      </button>
    </form>
  )
}

function Row({label, value, currency}: {label: string; value: number; currency: string}) {
  return (
    <div className="flex items-center justify-between py-1 text-sm text-black/70 dark:text-white/70">
      <span>{label}</span>
      <span>
        {currency} ${value}
      </span>
    </div>
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
