import type {ReactNode} from 'react'

import {SiteFooter} from '@/components/nav/SiteFooter'
import {SiteNav} from '@/components/nav/SiteNav'

/**
 * Wraps every route except /studio, which needs a bare shell — Sanity
 * Studio renders its own full-screen chrome and shouldn't inherit the
 * site nav.
 */
export default function SiteLayout({children}: {children: ReactNode}) {
  return (
    <div className="min-h-full bg-canvas p-0 sm:p-4 lg:p-6">
      {/* Never add transform / filter / backdrop-filter / perspective / will-change /
          contain to this div. Any of them would make it the containing block for
          position:fixed descendants and break fixed overlays inside the app. */}
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-[1440px] flex-col overflow-hidden bg-surface shadow-shell sm:rounded-shell">
        <SiteNav />
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter />
      </div>
    </div>
  )
}
