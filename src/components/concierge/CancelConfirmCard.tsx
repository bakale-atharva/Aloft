'use client'

import {useState} from 'react'

import {Button} from '@/components/ui/Button'
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
    <div className="rounded-card border border-danger-border bg-danger-soft p-6">
      <p className="mb-3 font-semibold text-ink">Cancel booking {pnr}?</p>

      {status === 'done' ? (
        <p className="text-sm text-success">Cancelled.</p>
      ) : status === 'error' ? (
        <p className="text-sm text-danger">
          Couldn&apos;t cancel that booking — it may not belong to you.
        </p>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={status === 'pending'}
            className="flex-1"
          >
            {status === 'pending' ? 'Cancelling…' : 'Confirm cancellation'}
          </Button>
          <Button variant="ghost" disabled={status === 'pending'} className="flex-1">
            Dismiss
          </Button>
        </div>
      )}
    </div>
  )
}
