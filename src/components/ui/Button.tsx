import {cn} from './cn'

export type Variant = 'primary' | 'solid' | 'outline' | 'ghost' | 'danger'
export type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-gradient-brand text-on-accent shadow-cta hover:brightness-110 active:brightness-95',
  solid: 'bg-ink text-surface hover:opacity-90',
  outline: 'border border-border-strong text-ink hover:bg-surface-sunken',
  ghost: 'text-ink-muted hover:text-ink hover:bg-surface-sunken',
  danger: 'border border-danger-border text-danger hover:bg-danger-soft'
}

const SIZES: Record<Size, string> = {
  sm: 'px-4 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-sm'
}

const BASE = 'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

export function buttonClass({variant = 'primary', size = 'md', className}: {variant?: Variant; size?: Size; className?: string} = {}) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className)
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({variant = 'primary', size = 'md', className, type = 'button', ...props}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass({variant, size, className})}
      {...props}
    />
  )
}
