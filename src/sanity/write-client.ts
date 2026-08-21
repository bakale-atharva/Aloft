import 'server-only'

import {createClient} from 'next-sanity'

import {apiVersion, dataset, projectId} from './env'

/**
 * Server-only client with write access. Used by the booking server actions and
 * the seed script. Never import this from a client component — the `server-only`
 * guard above turns that into a build error.
 */
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})
