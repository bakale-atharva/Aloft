import {defineField, defineType} from 'sanity'

import {CABIN_CLASSES} from './constants'

/**
 * One contiguous block of rows sharing a cabin class and seat arrangement.
 *
 * Seats are *generated* from this description rather than authored one by one —
 * a 787 is three cabinSection entries, not 250 seat documents. `columnLayout`
 * uses `|` for an aisle, so a 3-3 economy cabin is "ABC|DEF" and a 1-2-1
 * business cabin is "A|BC|D".
 */
export const cabinSection = defineType({
  name: 'cabinSection',
  title: 'Cabin section',
  type: 'object',
  fields: [
    defineField({
      name: 'cabinClass',
      title: 'Cabin class',
      type: 'string',
      options: {list: [...CABIN_CLASSES], layout: 'radio'},
      initialValue: 'economy',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'startRow',
      title: 'First row',
      type: 'number',
      validation: (Rule) => Rule.required().integer().min(1).max(99),
    }),
    defineField({
      name: 'endRow',
      title: 'Last row',
      type: 'number',
      validation: (Rule) =>
        Rule.required()
          .integer()
          .min(1)
          .max(99)
          .custom((endRow, context) => {
            const startRow = (context.parent as {startRow?: number})?.startRow
            if (typeof endRow !== 'number' || typeof startRow !== 'number') {
              return true
            }
            return endRow >= startRow || 'Last row must not be before the first row'
          }),
    }),
    defineField({
      name: 'columnLayout',
      title: 'Column layout',
      type: 'string',
      description:
        'Seat letters with "|" marking each aisle. Economy 3-3 is "ABC|DEF"; business 1-2-1 is "A|BC|D".',
      validation: (Rule) =>
        Rule.required()
          .uppercase()
          .regex(/^[A-Z]+(\|[A-Z]+)*$/, {name: 'column layout'}),
    }),
    defineField({
      name: 'exitRows',
      title: 'Exit rows',
      type: 'array',
      of: [{type: 'number'}],
      description: 'Rows with extra legroom, priced at a premium.',
      options: {sortable: false},
    }),
  ],
  preview: {
    select: {
      cabinClass: 'cabinClass',
      startRow: 'startRow',
      endRow: 'endRow',
      columnLayout: 'columnLayout',
    },
    prepare({cabinClass, startRow, endRow, columnLayout}) {
      return {
        title: `${cabinClass ?? 'cabin'} · rows ${startRow ?? '?'}–${endRow ?? '?'}`,
        subtitle: columnLayout,
      }
    },
  },
})
