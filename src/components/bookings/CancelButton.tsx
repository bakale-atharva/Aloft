'use client'

import {useTransition} from 'react'

import {cancelBooking} from '@/app/actions/booking'

export function CancelButton({pnr}: {pnr: string}) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm(`Cancel booking ${pnr}?`)) return
        startTransition(() => {
          cancelBooking(pnr)
        })
      }}
      className="rounded-full border border-red-300 px-4 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
    >
      {isPending ? 'Cancelling…' : 'Cancel'}
    </button>
  )
}
