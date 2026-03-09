import { CollectionConfig } from 'payload'

export const TestSuitesCollection: CollectionConfig = {
  slug: 'test-suites',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'alias',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'authoritativeDocument',
      type: 'relationship',
      relationTo: 'authoritative-documents',
    },
    {
      name: 'testCases',
      type: 'join',
      collection: 'test-cases',
      on: 'suite',
    },
  ],
}
