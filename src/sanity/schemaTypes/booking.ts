import {DocumentsIcon} from '@sanity/icons/Documents'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {BOOKING_STATUSES} from './constants'

/**
 * Written by the app, not by editors. The checkout server action and the
 * concierge agent both create these through the same code path.
 */
export const booking = defineType({
  name: 'booking',
  title: 'Booking',
  type: 'document',
  icon: DocumentsIcon,
  fields: [
    defineField({
      name: 'pnr',
      title: 'PNR',
      type: 'string',
      description: 'Six-character record locator.',
      readOnly: true,
      validation: (Rule) =>
        Rule.required().uppercase().regex(/^[A-Z0-9]{6}$/, {name: 'PNR'}),
    }),
    defineField({
      name: 'clerkUserId',
      title: 'Clerk user ID',
      type: 'string',
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'contactName',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'contactEmail',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'tripType',
      type: 'string',
      options: {
        list: [
          {title: 'One way', value: 'oneway'},
          {title: 'Round trip', value: 'roundtrip'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'outbound',
      type: 'bookingLeg',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'inbound',
      title: 'Return',
      type: 'bookingLeg',
      description: 'Only set for round trips.',
      hidden: ({document}) => document?.tripType !== 'roundtrip',
      validation: (Rule) =>
        Rule.custom((inbound, context) => {
          const tripType = (context.document as {tripType?: string})?.tripType
          if (tripType === 'roundtrip' && !inbound) {
            return 'Round trips need a return leg'
          }
          return true
        }),
    }),
    defineField({
      name: 'passengers',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'passenger',
          fields: [
            defineField({
              name: 'fullName',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({name: 'dateOfBirth', type: 'date'}),
          ],
          preview: {select: {title: 'fullName', subtitle: 'dateOfBirth'}},
        }),
      ],
      validation: (Rule) => Rule.required().min(1).max(9),
    }),
    defineField({
      name: 'fareBreakdown',
      title: 'Fare breakdown',
      type: 'object',
      options: {columns: 2},
      fields: [
        defineField({
          name: 'baseFare',
          type: 'number',
          validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
          name: 'seatFees',
          type: 'number',
          validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
          name: 'taxes',
          type: 'number',
          validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
          name: 'total',
          type: 'number',
          validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
          name: 'currency',
          type: 'string',
          initialValue: 'USD',
          validation: (Rule) => Rule.required().uppercase().length(3),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'proSeatFeesWaived',
      title: 'PRO seat fees waived',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'status',
      type: 'string',
      options: {list: [...BOOKING_STATUSES], layout: 'radio'},
      initialValue: 'pending',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'payment',
      type: 'object',
      description: 'Simulated payment. Only the last four digits are ever stored.',
      options: {columns: 2},
      fields: [
        defineField({
          name: 'method',
          type: 'string',
          initialValue: 'dummy-card',
          readOnly: true,
        }),
        defineField({
          name: 'last4',
          type: 'string',
          validation: (Rule) => Rule.length(4),
        }),
        defineField({name: 'transactionId', type: 'string'}),
        defineField({name: 'paidAt', type: 'datetime'}),
      ],
    }),
    defineField({
      name: 'bookedVia',
      title: 'Booked via',
      type: 'string',
      options: {
        list: [
          {title: 'Checkout', value: 'checkout'},
          {title: 'AI concierge', value: 'concierge'},
        ],
      },
      initialValue: 'checkout',
    }),
  ],
  preview: {
    select: {
      pnr: 'pnr',
      status: 'status',
      contactName: 'contactName',
      origin: 'outbound.flight.origin.code',
      destination: 'outbound.flight.destination.code',
    },
    prepare({pnr, status, contactName, origin, destination}) {
      return {
        title: `${pnr} · ${origin ?? '???'} → ${destination ?? '???'}`,
        subtitle: `${status} · ${contactName ?? ''}`,
      }
    },
  },
  orderings: [
    {
      title: 'Newest first',
      name: 'createdDesc',
      by: [{field: '_createdAt', direction: 'desc'}],
    },
  ],
})
