import {createClient} from 'next-sanity'

import {apiVersion, dataset, projectId} from './env'

/**
 * Public, read-only client for published content. Safe to use anywhere.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
})
