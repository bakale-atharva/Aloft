import Link from 'next/link'
import {Show, SignInButton, SignUpButton, UserButton} from '@clerk/nextjs'

export function SiteNav() {
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Aloft
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/bookings" className="hover:underline">
            My bookings
          </Link>
          <Link href="/concierge" className="hover:underline">
            Concierge
          </Link>
          <Link href="/pricing" className="hover:underline">
            Pricing
          </Link>

          <Show when="signed-out">
            <div className="flex items-center gap-3">
              <SignInButton mode="modal">
                <button className="text-sm font-medium hover:underline">Sign in</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background hover:opacity-90">
                  Sign up
                </button>
              </SignUpButton>
            </div>
          </Show>

          <Show when="signed-in">
            <UserButton />
          </Show>
        </nav>
      </div>
    </header>
  )
}
