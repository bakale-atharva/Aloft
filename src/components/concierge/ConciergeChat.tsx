'use client'

import {useChat} from '@ai-sdk/react'
import {DefaultChatTransport} from 'ai'
import {useState} from 'react'

import {BookingConfirmCard} from './BookingConfirmCard'
import {CancelConfirmCard} from './CancelConfirmCard'

const SUGGESTIONS = [
  'Find me a flight from DEL to BOM tomorrow',
  'What seats are free on that flight?',
  'What is your baggage policy?',
  'Show me my bookings',
]

export function ConciergeChat() {
  const [input, setInput] = useState('')
  const {messages, sendMessage, status, error} = useChat({
    transport: new DefaultChatTransport({api: '/api/concierge/chat'}),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage({text: input})
    setInput('')
  }

  const isBusy = status === 'submitted' || status === 'streaming'

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-8">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Aloft Concierge</h1>
      <p className="mb-6 text-sm text-black/50 dark:text-white/50">
        Ask about flights, seats, or your bookings. I&apos;ll always ask before actually booking or
        cancelling anything.
      </p>

      <div className="flex-1 overflow-y-auto rounded-2xl border border-black/10 p-4 dark:border-white/10">
        {messages.length === 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-black/50 dark:text-white/50">Try asking:</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => sendMessage({text: s})}
                className="w-fit rounded-full border border-black/10 px-3 py-1.5 text-left text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col gap-2 ${message.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {message.parts.map((part, i) => {
                if (part.type === 'text') {
                  return (
                    <p
                      key={i}
                      className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                        message.role === 'user'
                          ? 'bg-foreground text-background'
                          : 'bg-black/5 dark:bg-white/10'
                      }`}
                    >
                      {part.text}
                    </p>
                  )
                }

                if (part.type === 'tool-createBooking' && part.state === 'input-available') {
                  return <BookingConfirmCard key={i} input={part.input as never} />
                }

                if (part.type === 'tool-cancelBooking' && part.state === 'input-available') {
                  const input = part.input as {pnr: string}
                  return <CancelConfirmCard key={i} pnr={input.pnr} />
                }

                if (
                  part.type === 'tool-searchFlights' &&
                  part.state === 'output-available' &&
                  isSearchFlightsOutput(part.output)
                ) {
                  return (
                    <div key={i} className="flex flex-col gap-1.5 text-xs">
                      {part.output.flights.length === 0 && (
                        <p className="text-black/50 dark:text-white/50">No flights found.</p>
                      )}
                      {part.output.flights.map((f) => (
                        <div
                          key={f.flightId}
                          className="rounded-lg border border-black/10 px-3 py-2 dark:border-white/10"
                        >
                          {f.airline} {f.flightNumber} · {f.origin} → {f.destination} ·{' '}
                          {new Date(f.departureTime).toLocaleString()}
                        </div>
                      ))}
                    </div>
                  )
                }

                return null
              })}
            </div>
          ))}

          {isBusy && (
            <p className="text-xs text-black/40 dark:text-white/40">Thinking…</p>
          )}
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error.message}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the concierge…"
          className="flex-1 rounded-full border border-black/10 bg-transparent px-4 py-2.5 text-sm focus:outline-2 focus:outline-offset-1 focus:outline-current dark:border-white/15"
        />
        <button
          type="submit"
          disabled={isBusy || !input.trim()}
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </div>
  )
}

type SearchFlightsOutput = {
  flights: {
    flightId: string
    flightNumber: string
    airline: string
    origin: string
    destination: string
    departureTime: string
  }[]
}

function isSearchFlightsOutput(value: unknown): value is SearchFlightsOutput {
  return !!value && typeof value === 'object' && Array.isArray((value as {flights?: unknown}).flights)
}
