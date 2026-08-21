export const CABIN_CLASSES = [
  {title: 'Economy', value: 'economy'},
  {title: 'Business', value: 'business'},
  {title: 'First', value: 'first'},
] as const

export type CabinClass = (typeof CABIN_CLASSES)[number]['value']

export const BOOKING_STATUSES = [
  {title: 'Pending', value: 'pending'},
  {title: 'Confirmed', value: 'confirmed'},
  {title: 'Cancelled', value: 'cancelled'},
] as const
