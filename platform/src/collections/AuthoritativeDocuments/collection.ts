import { CollectionConfig } from 'payload'
import uploadHandler from './api/upload/handler'
import ingestHandler from './api/ingest/handler'
export const AuthoritativeDocumentsCollection: CollectionConfig = {
  slug: 'authoritative-documents',
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
      name: 'docType',
      type: 'select',
      options: ['nist', 'pci-dss'],
      required: true,
    },
    {
      name: 'uploadDocBtn',
      type: 'ui',
      admin: {
        components: {
          Field: 'src/components/upload-authoritative-doc',
        },
      },
    },
    {
      name: 's3Url',
      type: 'text',
    },
    {
      name: 's3Key',
      type: 'text',
    },
    {
      name: 'ingestStatus',
      type: 'select',
      options: ['pending', 'success', 'error'],
    },
    {
      name: 'startIngestBtn',
      type: 'ui',
      admin: {
        components: {
          Field: 'src/components/start-ingest-btn',
        },
      },
    },
    {
      name: 'tableOfContents',
      type: 'textarea',
    },
    {
      name: 'testSuites',
      type: 'join',
      collection: 'test-suites',
      on: 'authoritativeDocument',
    },
  ],
  endpoints: [
    {
      path: '/:id/upload',
      method: 'post',
      handler: uploadHandler,
    },
    {
      path: '/:id/ingest',
      method: 'post',
      handler: ingestHandler,
    },
  ],
}
