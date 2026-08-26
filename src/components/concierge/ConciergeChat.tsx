'use client'

import {useChat} from '@ai-sdk/react'
import {DefaultChatTransport, type UIMessage} from 'ai'
import {Plane, Send} from 'lucide-react'
import {useEffect, useMemo, useRef, useState} from 'react'


import {Pill} from '@/components/ui/Pill'
import {BookingConfirmCard} from './BookingConfirmCard'
import {CancelConfirmCard} from './CancelConfirmCard'

// Keeping the tail rather than the head: the recent turns are what the model
// needs to resolve "that flight", and an unbounded thread eventually trips the
// ~5MB localStorage quota.
const MAX_STORED_MESSAGES = 60

function storageKey(userId: string | null) {
  return `aloft-concierge-thread:${userId ?? 'anon'}`
}

function loadThread(key: string): UIMessage[] | null {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    // Anything hand-edited or written by an older shape is discarded rather
    // than fed to the API, which would reject it.
    return parsed.every(isStoredMessage) ? (parsed as UIMessage[]) : null
  } catch {
    return null
  }
}

function isStoredMessage(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const msg = value as {id?: unknown; role?: unknown; parts?: unknown}
  return typeof msg.id === 'string' && typeof msg.role === 'string' && Array.isArray(msg.parts)
}

const SUGGESTIONS = [
  'Find me a flight from DEL to BOM tomorrow',
  'What seats are free on that flight?',
  'What is your baggage policy?',
  'Show me my bookings',
]

export function ConciergeChat({userId}: {userId: string | null}) {
  const [input, setInput] = useState('')
  const key = storageKey(userId)

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/concierge/chat',
        // Resolved per request, in the browser — during SSR this would report
        // the server's zone, which is how "tomorrow" ends up off by a day.
        body: () => ({timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone}),
      }),
    [],
  )

  const {messages, sendMessage, setMessages, status, error} = useChat({transport})

  // Restore before the first save, so an empty initial render can't clobber a
  // stored thread.
  const restored = useRef(false)
  useEffect(() => {
    const stored = loadThread(key)
    if (stored && stored.length > 0) setMessages(stored)
    restored.current = true
  }, [key, setMessages])

  useEffect(() => {
    if (!restored.current) return
    // Mid-stream the last message is a partial; wait for the turn to settle
    // rather than writing on every token.
    if (status === 'streaming') return
    try {
      if (messages.length === 0) window.localStorage.removeItem(key)
      else window.localStorage.setItem(key, JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)))
    } catch {
      // Quota or a privacy-mode block — the in-memory thread still works.
    }
  }, [messages, status, key])

  function handleNewChat() {
    setMessages([])
    try {
      window.localStorage.removeItem(key)
    } catch {
      // Nothing to clean up if storage is unavailable.
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage({text: input})
    setInput('')
  }

  const isBusy = status === 'submitted' || status === 'streaming'

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-8">
      <div className="mb-1 flex items-baseline justify-between gap-4">
        <h1 className="font-display text-ink">Aloft Concierge</h1>
        {messages.length > 0 && (
          <Pill as="button" onClick={handleNewChat}>
            New chat
          </Pill>
        )}
      </div>
      <p className="mb-6 text-sm text-ink-muted">
        Ask about flights, seats, or your bookings — I can book them for you too. I&apos;ll always
        ask before actually booking or cancelling anything.
      </p>

      <div className="flex-1 overflow-y-auto rounded-card border border-border bg-surface-2 shadow-card p-4">
        {messages.length === 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-ink-muted">Try asking:</p>
            {SUGGESTIONS.map((s) => (
              <Pill key={s} as="button" onClick={() => sendMessage({text: s})}>
                {s}
              </Pill>
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
                      className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                        message.role === 'user'
                          ? 'rounded-br-md bg-gradient-brand text-on-accent ml-auto'
                          : 'rounded-bl-md bg-surface-sunken text-ink mr-auto'
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
                        <p className="text-ink-muted">No flights found.</p>
                      )}
                      {part.output.flights.map((f) => (
                        <div
                          key={f.flightId}
                          className="rounded-field border border-border bg-surface p-3 flex items-center gap-2"
                        >
                          <Plane className="size-4 text-accent-600" aria-hidden />
                          <div className="flex-1">
                            <div className="font-display text-ink">
                              {f.airline} {f.flightNumber} · {f.origin} → {f.destination}
                            </div>
                            <div className="text-ink-muted">
                              {new Date(f.departureTime).toLocaleString()}
                            </div>
                          </div>
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
            <span className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 animate-bounce rounded-full bg-accent-400"
                  style={{animationDelay: `${i * 120}ms`}}
                />
              ))}
            </span>
          )}
          {error && (
            <p className="text-sm text-danger" role="alert">{error.message}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2 rounded-full border border-border bg-surface px-2 py-2 shadow-card">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the concierge…"
          className="min-w-0 flex-1 bg-transparent px-3 text-sm text-ink placeholder:text-ink-faint outline-none"
        />
        <button
          type="submit"
          disabled={isBusy || !input.trim()}
          aria-label="Send message"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-brand text-on-accent transition hover:brightness-110 disabled:opacity-50"
        >
          <Send className="size-4" />
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
