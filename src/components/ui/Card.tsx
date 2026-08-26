import {cn} from './cn'

type Tone = 'plain' | 'raised' | 'accent'
type Padding = 'none' | 'sm' | 'md' | 'lg'

const TONES: Record<Tone, string> = {
  plain: 'border border-border bg-surface',
  raised: 'border border-border bg-surface-2 shadow-card',
  accent: 'border border-border-accent bg-accent-50'
}

const PADDINGS: Record<Padding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: Tone
  padding?: Padding
  children: React.ReactNode
}

export function Card({tone = 'plain', padding = 'md', className, children, ...props}: CardProps) {
  return (
    <div
      className={cn('rounded-card', TONES[tone], PADDINGS[padding], className)}
      {...props}
    >
      {children}
    </div>
  )
}
