'use client'

import {useCallback, useSyncExternalStore} from 'react'
import {Moon, Sun} from 'lucide-react'

/**
 * The `.dark` class on <html> is the source of truth — it is set before first
 * paint by the init script in the root layout. Subscribing to it rather than
 * mirroring it into state keeps the button in sync without a setState-in-effect
 * cascade, and getServerSnapshot keeps hydration stable.
 */
const listeners = new Set<() => void>()

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  return () => {
    listeners.delete(onChange)
  }
}

function getSnapshot() {
  return document.documentElement.classList.contains('dark')
}

function getServerSnapshot() {
  return false
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggle = useCallback(() => {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('aloft-theme', next ? 'dark' : 'light')
    } catch {
      // Private mode or blocked storage — the class still applies for this session.
    }
    listeners.forEach((listener) => listener())
  }, [])

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="grid size-9 place-items-center rounded-full text-ink-muted transition hover:bg-surface-sunken hover:text-ink"
    >
      {isDark ? (
        <Moon className="size-4" strokeWidth={2} />
      ) : (
        <Sun className="size-4" strokeWidth={2} />
      )}
    </button>
  )
}
