import {cn} from './cn'

interface PillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  as?: 'button' | 'span'
  children: React.ReactNode
}

const BASE = 'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition'
const ACTIVE = 'border-border-accent bg-accent-50 text-accent-700'
const INACTIVE = 'border-border text-ink-muted hover:border-border-strong hover:text-ink'

export function Pill({active = false, as = 'button', className, children, ...props}: PillProps) {
  const classes = cn(BASE, active ? ACTIVE : INACTIVE, className)

  if (as === 'span') {
    return <span className={classes}>{children}</span>
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  )
}

type BadgeTone = 'accent' | 'success' | 'warning' | 'neutral' | 'danger'

const BADGE_TONES: Record<BadgeTone, string> = {
  accent: 'bg-accent-100 text-accent-700',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  neutral: 'bg-surface-sunken text-ink-muted',
  danger: 'bg-danger-soft text-danger'
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  children: React.ReactNode
}

export function Badge({tone = 'neutral', className, children, ...props}: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', BADGE_TONES[tone], className)} {...props}>
      {children}
    </span>
  )
}
