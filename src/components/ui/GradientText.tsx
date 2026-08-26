import {cn} from './cn'

interface GradientTextProps {
  className?: string
  children: React.ReactNode
}

export function GradientText({className, children}: GradientTextProps) {
  return <span className={cn('text-gradient', className)}>{children}</span>
}

interface WordmarkProps {
  size?: 'sm' | 'lg'
  className?: string
}

export function Wordmark({size = 'sm', className}: WordmarkProps) {
  return (
    <span className={cn('font-display font-semibold tracking-tight text-ink', size === 'lg' ? 'text-2xl' : 'text-xl', className)}>
      Al<GradientText>oft</GradientText>
    </span>
  )
}
