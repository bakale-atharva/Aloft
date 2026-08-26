'use client'

export const MIN_PASSENGERS = 1
export const MAX_PASSENGERS = 9

export function PassengerStepper({
  value,
  onChange,
  idPrefix = 'passengers',
}: {
  value: number
  onChange: (next: number) => void
  idPrefix?: string
}) {
  const clamp = (n: number) => Math.min(MAX_PASSENGERS, Math.max(MIN_PASSENGERS, n))

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-black/10 px-2 py-1.5 dark:border-white/15">
      <StepButton
        label="Remove a passenger"
        disabled={value <= MIN_PASSENGERS}
        onClick={() => onChange(clamp(value - 1))}
      >
        −
      </StepButton>

      <div className="flex items-baseline gap-1.5">
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
          className="w-8 bg-transparent text-center text-sm font-semibold tabular-nums focus:outline-2 focus:outline-offset-2 focus:outline-current [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="text-xs text-black/50 dark:text-white/50">
          {value === 1 ? 'adult' : 'adults'}
        </span>
      </div>

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
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/15 text-base leading-none transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/20 dark:hover:bg-white/10"
    >
      {children}
    </button>
  )
}
