import { CollectionConfig } from 'payload'
import uploadHandler from './api/upload/handler'

export const InputFilesCollection: CollectionConfig = {
  slug: 'input-files',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'hash',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'uploadBtn',
      type: 'ui',
      admin: {
        components: {
          Field: 'src/components/upload-input-file',
        },
      },
    },
    {
      name: 's3Url',
      type: 'text',
    },
    {
      name: 'parsedText',
      type: 'textarea',
      maxLength: 1000000,
    },
  ],
  endpoints: [
    {
      path: '/:id/upload',
      method: 'post',
      handler: uploadHandler,
    },
  ],
}
