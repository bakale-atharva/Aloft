'use client'

import {useState} from 'react'

import {cancelBooking} from '@/app/actions/booking'

export function CancelConfirmCard({pnr}: {pnr: string}) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'done' | 'error'>('idle')

  async function handleConfirm() {
    setStatus('pending')
    try {
      await cancelBooking(pnr)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="max-w-sm rounded-xl border border-black/10 p-4 text-sm dark:border-white/10">
      <p className="mb-3 font-semibold">Cancel booking {pnr}?</p>

      {status === 'done' ? (
        <p className="text-xs text-blue-600 dark:text-blue-400">Cancelled.</p>
      ) : status === 'error' ? (
        <p className="text-xs text-red-600 dark:text-red-400">
          Couldn&apos;t cancel that booking — it may not belong to you.
        </p>
      ) : (
        <button
          type="button"
          onClick={handleConfirm}
          disabled={status === 'pending'}
          className="w-full rounded-full border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          {status === 'pending' ? 'Cancelling…' : 'Confirm cancellation'}
        </button>
      )}
    </div>
  )
}
