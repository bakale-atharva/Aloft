import {contextPlugin} from '@sanity/context/studio'
import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {apiVersion, dataset, projectId, studioBasePath} from './src/sanity/env'
import {schemaTypes} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'

export default defineConfig({
  name: 'default',
  title: 'Aloft',
  basePath: studioBasePath,

  projectId,
  dataset,

  plugins: [
    structureTool({structure}),
    visionTool({defaultApiVersion: apiVersion}),
    contextPlugin(),
  ],

  schema: {
    types: schemaTypes,
  },
})
