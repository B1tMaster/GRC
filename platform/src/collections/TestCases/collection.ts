import { CollectionConfig } from 'payload'
import * as api from './api'

export const TestCasesCollection: CollectionConfig = {
  slug: 'test-cases',
  admin: {
    useAsTitle: 'title',
  },
  endpoints: [
    {
      path: '/:id/generate/methodology',
      method: 'post',
      handler: api.generateMethodologyHandler,
    },
  ],
  fields: [
    {
      name: 'id',
      type: 'text',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'suite',
      type: 'relationship',
      relationTo: 'test-suites',
    },
    {
      name: 'generateMethodologyButton',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: 'src/components/generate-methodology-button',
        },
        condition: data => !data.methodology,
      },
    },
    {
      name: 'methodology',
      type: 'textarea',
    },
    {
      type: 'tabs',
      admin: {
        position: 'sidebar',
      },
      tabs: [
        {
          label: 'Metadata',
          fields: [
            {
              name: 'metadata',
              type: 'group',
              fields: [
                {
                  name: 'version',
                  type: 'text',
                  required: false,
                  admin: {
                    readOnly: true,
                    description: 'The version of the NIST control catalog',
                  },
                },
                {
                  name: 'pdfPagesRange',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'docPagesRange',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Links',
          fields: [
            {
              name: 'links',
              type: 'array',
              fields: [
                {
                  name: 'href',
                  type: 'text',
                  required: false,
                },
                {
                  name: 'relationType',
                  type: 'text',
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'content',
      type: 'textarea',
      required: false,
      maxLength: 360000, // Allowing for the combined content of statement, guidance, and enhancements
    },
  ],
}
