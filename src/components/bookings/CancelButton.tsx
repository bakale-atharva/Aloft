'use client'

import {useTransition} from 'react'

import {Button} from '@/components/ui/Button'
import {cancelBooking} from '@/app/actions/booking'

export function CancelButton({pnr}: {pnr: string}) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      variant="danger"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (!confirm(`Cancel booking ${pnr}?`)) return
        startTransition(() => {
          cancelBooking(pnr)
        })
      }}
    >
      {isPending ? 'Cancelling…' : 'Cancel'}
    </Button>
  )
}
