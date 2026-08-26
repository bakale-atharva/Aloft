'use client'

export const MIN_PASSENGERS = 1
export const MAX_PASSENGERS = 9

export function PassengerStepper({
  value,
  onChange,
  idPrefix = 'passengers',
  variant = 'boxed',
}: {
  value: number
  onChange: (next: number) => void
  idPrefix?: string
  variant?: 'bare' | 'boxed'
}) {
  const clamp = (n: number) => Math.min(MAX_PASSENGERS, Math.max(MIN_PASSENGERS, n))

  const containerClass = variant === 'boxed'
    ? 'flex items-center gap-2 rounded-field border border-border bg-surface px-2 py-1.5'
    : 'flex items-center gap-2'

  return (
    <div className={containerClass}>
      <StepButton
        label="Remove a passenger"
        disabled={value <= MIN_PASSENGERS}
        onClick={() => onChange(clamp(value - 1))}
      >
        −
      </StepButton>

      <input
        id={idPrefix}
        type="number"
        inputMode="numeric"
        min={MIN_PASSENGERS}
        max={MAX_PASSENGERS}
        value={value}
        onChange={(e) => {
          const parsed = Number(e.target.value)
          if (Number.isNaN(parsed)) return
          onChange(clamp(parsed))
        }}
        aria-label="Number of passengers"
        className="w-full min-w-0 bg-transparent text-center text-base font-semibold text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />

      <StepButton
        label="Add a passenger"
        disabled={value >= MAX_PASSENGERS}
        onClick={() => onChange(clamp(value + 1))}
      >
        +
      </StepButton>
    </div>
  )
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-sunken text-ink-muted transition hover:bg-accent-100 hover:text-accent-600 disabled:opacity-40"
    >
      {children}
    </button>
  )
}
