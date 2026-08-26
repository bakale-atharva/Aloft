import type {LucideIcon} from 'lucide-react'
import {cn} from './cn'

export const inputClass = 'w-full rounded-field border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-border-accent focus:outline-2 focus:outline-offset-1 focus:outline-accent disabled:bg-surface-sunken disabled:opacity-50'

export const selectClass = cn(inputClass, 'cursor-pointer appearance-none pr-9')

interface FieldProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}

export function Field({label, hint, error, className, children, ...props}: FieldProps) {
  return (
    <label className={className} {...props}>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
      {error && <span role="alert" className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  )
}

interface SegmentProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  icon: LucideIcon
  label: string
  children: React.ReactNode
}

export function Segment({icon: Icon, label, className, children, ...props}: SegmentProps) {
  return (
    <label className={cn('group relative flex items-center gap-3 bg-surface px-4 py-3 transition-colors focus-within:bg-accent-50 has-[:disabled]:opacity-45', className)} {...props}>
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-100 text-accent-600">
        <Icon className="size-4" strokeWidth={2} aria-hidden />
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="block text-[11px] font-medium uppercase tracking-[0.08em] text-ink-faint">{label}</span>
        {children}
      </span>
    </label>
  )
}
