'use client'

import {NextStudio} from 'next-sanity/studio'

import config from '../../../../sanity.config'

/**
 * `config` is imported here, inside a Client Component, rather than passed in
 * as a prop from the server page. Sanity schemas are full of functions
 * (validation rules, `preview.prepare`, `hidden`) that can't cross the
 * server/client RSC boundary — importing it client-side keeps it entirely in
 * the browser bundle instead.
 */
export default function StudioClient() {
  return <NextStudio config={config} />
}
