'use client'

import {useState} from 'react'
import {usePathname} from 'next/navigation'
import Link from 'next/link'
import {Menu, X} from 'lucide-react'
import {Show, SignInButton, SignUpButton, UserButton} from '@clerk/nextjs'

import {Wordmark} from '@/components/ui/GradientText'
import {ThemeToggle} from './ThemeToggle'
import {buttonClass} from '@/components/ui/Button'

const NAV_LINKS = [
  {href: '/bookings', label: 'My bookings'},
  {href: '/concierge', label: 'Concierge'},
  {href: '/pricing', label: 'Pricing'},
]

export function SiteNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (href: string) => pathname === href

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/">
          <Wordmark />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`relative text-sm font-medium transition-colors ${
                  active ? 'text-ink' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-gradient-brand" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Show when="signed-out">
            <div className="hidden items-center gap-3 md:flex">
              <SignInButton mode="modal">
                <button className={buttonClass({variant: 'ghost', size: 'sm'})}>
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className={buttonClass({variant: 'primary', size: 'sm'})}>
                  Sign up
                </button>
              </SignUpButton>
            </div>
          </Show>

          <Show when="signed-in">
            <UserButton />
          </Show>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
            className="md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-surface px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <Show when="signed-out">
              <div className="mt-2 flex flex-col gap-3 border-t border-border pt-3">
                <SignInButton mode="modal">
                  <button className={buttonClass({variant: 'ghost', size: 'sm'})}>
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className={buttonClass({variant: 'primary', size: 'sm'})}>
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            </Show>
          </nav>
        </div>
      )}
    </header>
  )
}
