import {defineField, defineType} from 'sanity'

/** A single seat assignment on one leg of a booking. */
export const bookedSeat = defineType({
  name: 'bookedSeat',
  title: 'Booked seat',
  type: 'object',
  fields: [
    defineField({
      name: 'seatNumber',
      type: 'string',
      description: 'e.g. 12A',
      validation: (Rule) =>
        Rule.required().uppercase().regex(/^\d{1,2}[A-Z]$/, {name: 'seat number'}),
    }),
    defineField({
      name: 'passengerName',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'fee',
      title: 'Seat fee charged',
      type: 'number',
      description: 'Zero when waived by a PRO membership.',
      initialValue: 0,
      validation: (Rule) => Rule.required().min(0),
    }),
  ],
  preview: {
    select: {title: 'seatNumber', subtitle: 'passengerName'},
  },
})
