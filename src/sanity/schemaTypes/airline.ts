import {UsersIcon} from '@sanity/icons/Users'
import {defineField, defineType} from 'sanity'

export const airline = defineType({
  name: 'airline',
  title: 'Airline',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'code',
      title: 'IATA code',
      type: 'string',
      description: 'Two-character airline code, e.g. AI',
      validation: (Rule) => Rule.required().uppercase().length(2),
    }),
    defineField({
      name: 'logo',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', type: 'string', title: 'Alt text'})],
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'code', media: 'logo'},
  },
})
