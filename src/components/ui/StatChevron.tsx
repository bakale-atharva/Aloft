import {cn} from './cn'

interface StatChevronProps {
  value: string
  label: string
  className?: string
}

export function StatChevron({value, label, className}: StatChevronProps) {
  return (
    <div className={cn('clip-chevron-l bg-border-accent p-px', className)}>
      <div className="clip-chevron-l bg-surface py-3 pl-10 pr-6">
        <div className="font-display text-lg font-semibold leading-tight text-ink">{value}</div>
        <div className="text-xs text-ink-muted">{label}</div>
      </div>
    </div>
  )
}
