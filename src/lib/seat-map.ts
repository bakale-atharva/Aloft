export type CabinClass = 'economy' | 'business' | 'first'

export type CabinSection = {
  cabinClass: CabinClass
  startRow: number
  endRow: number
  columnLayout: string
  exitRows?: number[]
}

export type Seat = {
  id: string
  row: number
  column: string
  cabinClass: CabinClass
  isAisle: boolean
  isWindow: boolean
  isExitRow: boolean
}

/**
 * Parses a columnLayout like "ABC|DEF" into seat columns grouped by aisle,
 * e.g. [["A","B","C"], ["D","E","F"]]. A "|" marks an aisle gap.
 */
export function parseColumnGroups(columnLayout: string): string[][] {
  return columnLayout.split('|').map((group) => group.split(''))
}

/**
 * Expands one cabin section into individual seats. Window seats are the
 * first and last column of the whole row; aisle seats sit next to a "|"
 * gap in the layout.
 */
export function generateSeatsForSection(section: CabinSection): Seat[] {
  const groups = parseColumnGroups(section.columnLayout)
  const allColumns = groups.flat()
  const exitRows = new Set(section.exitRows ?? [])
  const seats: Seat[] = []

  for (let row = section.startRow; row <= section.endRow; row += 1) {
    let columnIndex = 0
    groups.forEach((group, groupIndex) => {
      group.forEach((column, indexInGroup) => {
        const isWindow = columnIndex === 0 || columnIndex === allColumns.length - 1
        const isAisle = indexInGroup === group.length - 1 && groupIndex < groups.length - 1
          ? true
          : indexInGroup === 0 && groupIndex > 0

        seats.push({
          id: `${row}${column}`,
          row,
          column,
          cabinClass: section.cabinClass,
          isAisle,
          isWindow,
          isExitRow: exitRows.has(row),
        })
        columnIndex += 1
      })
    })
  }

  return seats
}

/** Expands a full aircraft seat layout, optionally filtered to one cabin class. */
export function generateSeats(seatLayout: CabinSection[], cabinClass?: CabinClass): Seat[] {
  return seatLayout
    .filter((section) => !cabinClass || section.cabinClass === cabinClass)
    .flatMap(generateSeatsForSection)
}

export function isSeatSelectable(
  seat: Seat,
  occupied: ReadonlySet<string>,
  selected: ReadonlySet<string>,
  maxSeats: number,
): boolean {
  if (occupied.has(seat.id)) return false
  if (selected.has(seat.id)) return true
  return selected.size < maxSeats
}
