import type {SchemaTypeDefinition} from 'sanity'

import {aircraft} from './aircraft'
import {airline} from './airline'
import {airport} from './airport'
import {bookedSeat} from './bookedSeat'
import {booking} from './booking'
import {bookingLeg} from './bookingLeg'
import {cabinSection} from './cabinSection'
import {fare} from './fare'
import {flight} from './flight'
import {supportArticle} from './supportArticle'

export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents
  airport,
  airline,
  aircraft,
  flight,
  booking,
  supportArticle,
  // Objects
  cabinSection,
  fare,
  bookingLeg,
  bookedSeat,
]
