import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {defineArrayMember, defineField, defineType} from 'sanity'

/** Customer-support content the AI concierge answers from. */
export const supportArticle = defineType({
  name: 'supportArticle',
  title: 'Support article',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'question',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'question', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          {title: 'Baggage', value: 'baggage'},
          {title: 'Check-in', value: 'checkin'},
          {title: 'Changes & cancellations', value: 'changes'},
          {title: 'Seats & cabin', value: 'seats'},
          {title: 'Payments & refunds', value: 'payments'},
          {title: 'PRO membership', value: 'pro'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'question', subtitle: 'category'},
  },
})
