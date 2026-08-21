import {PinIcon} from '@sanity/icons/Pin'
import {defineField, defineType} from 'sanity'

export const airport = defineType({
  name: 'airport',
  title: 'Airport',
  type: 'document',
  icon: PinIcon,
  fields: [
    defineField({
      name: 'code',
      title: 'IATA code',
      type: 'string',
      description: 'Three-letter IATA code, e.g. DEL',
      validation: (Rule) =>
        Rule.required()
          .uppercase()
          .length(3)
          .regex(/^[A-Z]{3}$/, {name: 'IATA code'}),
    }),
    defineField({
      name: 'name',
      title: 'Airport name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'city',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'country',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'timezone',
      title: 'IANA timezone',
      type: 'string',
      description: 'e.g. Asia/Kolkata',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'code', subtitle: 'city', name: 'name'},
    prepare({title, subtitle, name}) {
      return {title: `${title} — ${name}`, subtitle}
    },
  },
})
