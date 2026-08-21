import {RocketIcon} from '@sanity/icons/Rocket'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const aircraft = defineType({
  name: 'aircraft',
  title: 'Aircraft',
  type: 'document',
  icon: RocketIcon,
  fields: [
    defineField({
      name: 'model',
      type: 'string',
      description: 'e.g. Boeing 787-9',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'registration',
      type: 'string',
      description: 'Tail number, e.g. VT-ANU',
    }),
    defineField({
      name: 'seatLayout',
      title: 'Seat layout',
      type: 'array',
      of: [defineArrayMember({type: 'cabinSection'})],
      description: 'Cabin sections from nose to tail. Rows must not overlap.',
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {title: 'model', subtitle: 'registration'},
  },
})
