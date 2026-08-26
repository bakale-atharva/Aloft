'use client'

import {useMemo} from 'react'

import {generateSeats, isSeatSelectable, parseColumnGroups} from '@/lib/seat-map'
import type {CabinClass} from '@/lib/seat-map'
import type {CabinSection} from '@/lib/types'

type SeatMapProps = {
  seatLayout: CabinSection[]
  cabinClass: CabinClass
  occupiedSeatIds: string[]
  selected: string[]
  maxSeats: number
  onChange: (seatIds: string[]) => void
  seatFee: number
  exitRowSeatFee: number
  seatFeesWaived: boolean
}

export function SeatMap({
  seatLayout,
  cabinClass,
  occupiedSeatIds,
  selected,
  maxSeats,
  onChange,
  seatFee,
  exitRowSeatFee,
  seatFeesWaived,
}: SeatMapProps) {
  const section = seatLayout.find((s) => s.cabinClass === cabinClass)
  const occupied = useMemo(() => new Set(occupiedSeatIds), [occupiedSeatIds])
  const selectedSet = useMemo(() => new Set(selected), [selected])

  const rows = useMemo(() => {
    if (!section) return []
    const seats = generateSeats([section], cabinClass)
    const byRow = new Map<number, ReturnType<typeof generateSeats>>()
    for (const seat of seats) {
      const list = byRow.get(seat.row) ?? []
      list.push(seat)
      byRow.set(seat.row, list)
    }
    return Array.from(byRow.entries()).sort(([a], [b]) => a - b)
  }, [section, cabinClass])

  if (!section) {
    return (
      <p className="rounded-field border border-border bg-surface-sunken p-6 text-sm text-ink-faint">
        This aircraft has no {cabinClass} cabin.
      </p>
    )
  }

  const columnGroups = parseColumnGroups(section.columnLayout)

  function toggleSeat(seatId: string, selectable: boolean) {
    if (!selectable) return
    if (selectedSet.has(seatId)) {
      onChange(selected.filter((id) => id !== seatId))
    } else {
      if (selectedSet.size >= maxSeats) return
      onChange([...selected, seatId])
    }
  }

  return (
    <div>
      <Legend seatFee={seatFee} exitRowSeatFee={exitRowSeatFee} seatFeesWaived={seatFeesWaived} />

      <div className="mx-auto max-w-md rounded-[3rem] border border-border bg-surface-sunken px-4 pb-8 pt-10">
        <div className="mb-4 flex items-center justify-center gap-2 text-xs text-ink-faint">
          <NoseIcon />
          <span className="uppercase tracking-wide">Front of aircraft</span>
        </div>

        <div className="flex flex-col gap-1.5" role="grid" aria-label={`${cabinClass} seat map`}>
          {rows.map(([rowNumber, seats]) => {
            const isExitRow = seats[0]?.isExitRow
            return (
              <div key={rowNumber} className="flex items-center gap-1.5" role="row">
                <span className="w-6 shrink-0 text-right text-[11px] text-ink-faint">
                  {rowNumber}
                </span>
                {columnGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="flex gap-1.5">
                    {group.map((column) => {
                      const seat = seats.find((s) => s.column === column)
                      if (!seat) return null
                      const isOccupied = occupied.has(seat.id)
                      const isSelected = selectedSet.has(seat.id)
                      const selectable = isSeatSelectable(seat, occupied, selectedSet, maxSeats)

                      return (
                        <button
                          key={seat.id}
                          type="button"
                          role="gridcell"
                          onClick={() => toggleSeat(seat.id, selectable)}
                          disabled={isOccupied || (!isSelected && selectedSet.size >= maxSeats)}
                          aria-selected={isSelected}
                          aria-label={`Seat ${seat.id}, ${seat.isWindow ? 'window' : seat.isAisle ? 'aisle' : 'middle'}${seat.isExitRow ? ', exit row' : ''}, ${isOccupied ? 'occupied' : isSelected ? 'selected' : 'available'}`}
                          title={seat.id}
                          className={seatClasses({isOccupied, isSelected, isExitRow: seat.isExitRow, selectable})}
                        >
                          {seat.column}
                        </button>
                      )
                    })}
                  </div>
                ))}
                {isExitRow && (
                  <span className="ml-1 text-[10px] uppercase tracking-wide text-warning">
                    exit
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function seatClasses({
  isOccupied,
  isSelected,
  isExitRow,
  selectable,
}: {
  isOccupied: boolean
  isSelected: boolean
  isExitRow: boolean
  selectable: boolean
}) {
  const base =
    'flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-medium transition sm:h-8 sm:w-8 sm:text-xs'

  if (isOccupied) {
    return `${base} bg-surface-sunken text-ink-faint border border-border cursor-not-allowed`
  }
  if (isSelected) {
    return `${base} bg-gradient-brand text-on-accent shadow-cta border border-transparent`
  }
  if (!selectable) {
    return `${base} cursor-not-allowed border border-border text-ink-faint`
  }
  if (isExitRow) {
    return `${base} border border-warning/50 text-warning hover:bg-warning-soft`
  }
  return `${base} border border-border-strong bg-surface text-ink transition hover:bg-accent-50 hover:border-border-accent`
}

function Legend({
  seatFee,
  exitRowSeatFee,
  seatFeesWaived,
}: {
  seatFee: number
  exitRowSeatFee: number
  seatFeesWaived: boolean
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-muted">
      <LegendItem swatch="border border-border-strong bg-surface" label="Available" />
      <LegendItem swatch="bg-gradient-brand" label="Selected" />
      <LegendItem swatch="bg-surface-sunken border border-border" label="Occupied" />
      <LegendItem swatch="border border-warning/50 bg-warning-soft" label={`Exit row${seatFeesWaived ? '' : ` +$${exitRowSeatFee}`}`} />
      {!seatFeesWaived && seatFee > 0 && <span>Standard seat +${seatFee}</span>}
      {seatFeesWaived && <span className="font-medium text-accent">Seat fees waived (PRO)</span>}
    </div>
  )
}

function LegendItem({swatch, label}: {swatch: string; label: string}) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3.5 w-3.5 rounded ${swatch}`} />
      {label}
    </span>
  )
}

function NoseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l7 8H5l7-8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
