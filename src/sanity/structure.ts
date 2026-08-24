import {CONTEXT_SCHEMA_TYPE_NAME} from '@sanity/context/studio'
import type {StructureResolver} from 'sanity/structure'

/**
 * Bookings are grouped by status so operations can find pending ones fast;
 * everything else is a plain document list.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Aloft')
    .items([
      S.listItem()
        .title('Flights')
        .child(S.documentTypeList('flight').title('Flights')),
      S.listItem()
        .title('Bookings')
        .child(
          S.list()
            .title('Bookings')
            .items([
              S.listItem()
                .title('Confirmed')
                .child(
                  S.documentList()
                    .title('Confirmed bookings')
                    .filter('_type == "booking" && status == "confirmed"')
                    .defaultOrdering([{field: '_createdAt', direction: 'desc'}]),
                ),
              S.listItem()
                .title('Pending')
                .child(
                  S.documentList()
                    .title('Pending bookings')
                    .filter('_type == "booking" && status == "pending"')
                    .defaultOrdering([{field: '_createdAt', direction: 'desc'}]),
                ),
              S.listItem()
                .title('Cancelled')
                .child(
                  S.documentList()
                    .title('Cancelled bookings')
                    .filter('_type == "booking" && status == "cancelled"')
                    .defaultOrdering([{field: '_createdAt', direction: 'desc'}]),
                ),
              S.divider(),
              S.listItem()
                .title('All bookings')
                .child(S.documentTypeList('booking').title('All bookings')),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title('Airports')
        .child(S.documentTypeList('airport').title('Airports')),
      S.listItem()
        .title('Airlines')
        .child(S.documentTypeList('airline').title('Airlines')),
      S.listItem()
        .title('Aircraft')
        .child(S.documentTypeList('aircraft').title('Aircraft')),
      S.divider(),
      S.listItem()
        .title('Support articles')
        .child(S.documentTypeList('supportArticle').title('Support articles')),
      S.divider(),
      // The Sanity Context document that scopes what the AI concierge can read.
      ...S.documentTypeListItems().filter(
        (item) => item.getId() === CONTEXT_SCHEMA_TYPE_NAME,
      ),
    ])
