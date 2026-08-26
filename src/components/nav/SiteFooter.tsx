import Link from 'next/link'

import {Wordmark} from '@/components/ui/GradientText'

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-surface-sunken px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div>
            <Wordmark size="lg" />
            <p className="mt-3 max-w-xs text-sm text-ink-muted">
              Search, book, and manage flights with real seat maps and an AI concierge.
            </p>
          </div>

          {/* Book column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
              Book
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <Link href="/" className="text-sm text-ink-muted transition-colors hover:text-ink">
                  Search flights
                </Link>
              </li>
              <li>
                <Link href="/#popular-routes" className="text-sm text-ink-muted transition-colors hover:text-ink">
                  Popular routes
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-ink-muted transition-colors hover:text-ink">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Your trips column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
              Your trips
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <Link href="/bookings" className="text-sm text-ink-muted transition-colors hover:text-ink">
                  My bookings
                </Link>
              </li>
              <li>
                <Link href="/concierge" className="text-sm text-ink-muted transition-colors hover:text-ink">
                  AI concierge
                </Link>
              </li>
            </ul>
          </div>

          {/* Account column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
              Account
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <Link href="/sign-in" className="text-sm text-ink-muted transition-colors hover:text-ink">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="text-sm text-ink-muted transition-colors hover:text-ink">
                  Create account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-muted">© {currentYear} Aloft</p>
          <p className="text-sm text-ink-faint">Demo app. Flights and payments are simulated.</p>
        </div>
      </div>
    </footer>
  )
}
