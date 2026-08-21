import {defineArrayMember, defineField, defineType} from 'sanity'

import {CABIN_CLASSES} from './constants'

/** One flown leg — outbound or inbound — of a booking. */
export const bookingLeg = defineType({
  name: 'bookingLeg',
  title: 'Booking leg',
  type: 'object',
  fields: [
    defineField({
      name: 'flight',
      type: 'reference',
      to: [{type: 'flight'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'cabinClass',
      type: 'string',
      options: {list: [...CABIN_CLASSES], layout: 'radio'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'seats',
      type: 'array',
      of: [defineArrayMember({type: 'bookedSeat'})],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      flightNumber: 'flight.flightNumber',
      cabinClass: 'cabinClass',
      seats: 'seats',
    },
    prepare({flightNumber, cabinClass, seats}) {
      const seatNumbers = (seats as {seatNumber?: string}[] | undefined)
        ?.map((seat) => seat.seatNumber)
        .join(', ')
      return {
        title: `${flightNumber ?? 'Flight'} · ${cabinClass ?? ''}`,
        subtitle: seatNumbers,
      }
    },
  },
})
