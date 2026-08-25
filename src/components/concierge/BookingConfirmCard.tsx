'use client'

import {useState} from 'react'

import {INITIAL_BOOKING_STATE, processBooking} from '@/app/actions/booking'

type CreateBookingInput = {
  tripType: 'oneway' | 'roundtrip'
  cabinClass: 'economy' | 'business' | 'first'
  outboundFlightId: string
  outboundSeats: string[]
  inboundFlightId?: string
  inboundSeats?: string[]
  contactName: string
  contactEmail: string
  passengerNames: string[]
  cardNumber: string
}

export function BookingConfirmCard({input}: {input: CreateBookingInput}) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setStatus('pending')
    setError(null)

    const formData = new FormData()
    formData.set('tripType', input.tripType)
    formData.set('cabinClass', input.cabinClass)
    formData.set('outboundFlightId', input.outboundFlightId)
    formData.set('outboundSeats', input.outboundSeats.join(','))
    if (input.inboundFlightId) {
      formData.set('inboundFlightId', input.inboundFlightId)
      formData.set('inboundSeats', (input.inboundSeats ?? []).join(','))
    }
    formData.set('contactName', input.contactName)
    formData.set('contactEmail', input.contactEmail)
    formData.set('cardNumber', input.cardNumber)
    input.passengerNames.forEach((name) => formData.append('passengerName', name))

    try {
      const result = await processBooking(INITIAL_BOOKING_STATE, formData)
      if (result.error) {
        setStatus('error')
        setError(
          result.error === 'SEAT_TAKEN'
            ? `Seat(s) no longer available: ${result.conflictSeats?.join(', ')}`
            : result.error === 'CARD_DECLINED'
              ? 'That card was declined.'
              : 'Could not complete the booking. Please try again.',
        )
      }
      // On success processBooking redirects — nothing else to do here.
    } catch (err) {
      // A successful booking redirects, which throws a special Next.js
      // control-flow error (digest starts with NEXT_REDIRECT) — let it
      // propagate so the navigation actually happens.
      const digest = (err as {digest?: string} | undefined)?.digest
      if (typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) throw err
      setStatus('error')
      setError('Could not complete the booking. Please try again.')
    }
  }

  return (
    <div className="max-w-sm rounded-xl border border-black/10 p-4 text-sm dark:border-white/10">
      <p className="mb-2 font-semibold">Confirm booking</p>
      <dl className="mb-3 flex flex-col gap-1 text-black/70 dark:text-white/70">
        <Row label="Cabin" value={input.cabinClass} />
        <Row label="Outbound seats" value={input.outboundSeats.join(', ')} />
        {input.inboundSeats && input.inboundSeats.length > 0 && (
          <Row label="Return seats" value={input.inboundSeats.join(', ')} />
        )}
        <Row label="Passengers" value={input.passengerNames.join(', ')} />
        <Row label="Contact" value={`${input.contactName} · ${input.contactEmail}`} />
        <Row label="Card" value={`•••• ${input.cardNumber.replace(/\s+/g, '').slice(-4)}`} />
      </dl>

      {error && (
        <p className="mb-3 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="button"
        onClick={handleConfirm}
        disabled={status === 'pending'}
        className="w-full rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'pending' ? 'Booking…' : 'Confirm and book'}
      </button>
    </div>
  )
}

function Row({label, value}: {label: string; value: string}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-black/50 dark:text-white/50">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  )
}
