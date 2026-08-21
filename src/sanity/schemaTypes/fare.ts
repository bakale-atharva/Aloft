import {defineField, defineType} from 'sanity'

import {CABIN_CLASSES} from './constants'

/** Price of one seat in one cabin class on one flight. */
export const fare = defineType({
  name: 'fare',
  title: 'Fare',
  type: 'object',
  fields: [
    defineField({
      name: 'cabinClass',
      type: 'string',
      options: {list: [...CABIN_CLASSES], layout: 'radio'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'basePrice',
      title: 'Base price',
      type: 'number',
      description: 'Per passenger, before seat fees and taxes.',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'seatFee',
      title: 'Seat selection fee',
      type: 'number',
      description: 'Charged per seat. Waived for PRO members.',
      initialValue: 0,
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'exitRowSeatFee',
      title: 'Exit row seat fee',
      type: 'number',
      description: 'Extra-legroom seats. Also waived for PRO members.',
      initialValue: 0,
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'currency',
      type: 'string',
      initialValue: 'USD',
      validation: (Rule) => Rule.required().uppercase().length(3),
    }),
  ],
  preview: {
    select: {cabinClass: 'cabinClass', basePrice: 'basePrice', currency: 'currency'},
    prepare({cabinClass, basePrice, currency}) {
      return {title: cabinClass, subtitle: `${currency} ${basePrice}`}
    },
  },
})
