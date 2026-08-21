import type {ReactNode} from 'react'

import {SiteNav} from '@/components/nav/SiteNav'

/**
 * Wraps every route except /studio, which needs a bare shell — Sanity
 * Studio renders its own full-screen chrome and shouldn't inherit the
 * site nav.
 */
export default function SiteLayout({children}: {children: ReactNode}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteNav />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}
