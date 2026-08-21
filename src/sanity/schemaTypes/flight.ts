import {EarthGlobeIcon} from '@sanity/icons/EarthGlobe'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const flight = defineType({
  name: 'flight',
  title: 'Flight',
  type: 'document',
  icon: EarthGlobeIcon,
  fields: [
    defineField({
      name: 'flightNumber',
      title: 'Flight number',
      type: 'string',
      description: 'e.g. AI806',
      validation: (Rule) => Rule.required().uppercase(),
    }),
    defineField({
      name: 'airline',
      type: 'reference',
      to: [{type: 'airline'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'aircraft',
      type: 'reference',
      to: [{type: 'aircraft'}],
      description: 'Determines the seat map shown to travellers.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'origin',
      type: 'reference',
      to: [{type: 'airport'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'destination',
      type: 'reference',
      to: [{type: 'airport'}],
      validation: (Rule) =>
        Rule.required().custom((destination, context) => {
          const origin = (context.document as {origin?: {_ref?: string}})?.origin
          if (!destination || !origin) return true
          return (
            (destination as {_ref?: string})._ref !== origin._ref ||
            'Destination must differ from origin'
          )
        }),
    }),
    defineField({
      name: 'departureTime',
      title: 'Departure',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'arrivalTime',
      title: 'Arrival',
      type: 'datetime',
      validation: (Rule) =>
        Rule.required().min(Rule.valueOfField('departureTime')),
    }),
    defineField({
      name: 'durationMinutes',
      title: 'Duration (minutes)',
      type: 'number',
      validation: (Rule) => Rule.required().integer().min(1),
    }),
    defineField({
      name: 'fares',
      type: 'array',
      of: [defineArrayMember({type: 'fare'})],
      description: 'One entry per cabin class the flight sells.',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'status',
      type: 'string',
      options: {
        list: [
          {title: 'Scheduled', value: 'scheduled'},
          {title: 'Cancelled', value: 'cancelled'},
        ],
        layout: 'radio',
      },
      initialValue: 'scheduled',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      flightNumber: 'flightNumber',
      origin: 'origin.code',
      destination: 'destination.code',
      departureTime: 'departureTime',
      media: 'airline.logo',
    },
    prepare({flightNumber, origin, destination, departureTime, media}) {
      return {
        title: `${flightNumber} · ${origin ?? '???'} → ${destination ?? '???'}`,
        subtitle: departureTime
          ? new Date(departureTime).toUTCString()
          : 'No departure time',
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Departure, soonest first',
      name: 'departureAsc',
      by: [{field: 'departureTime', direction: 'asc'}],
    },
  ],
})
