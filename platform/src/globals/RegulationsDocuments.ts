import { GlobalConfig } from 'payload'

export const RegulationsDocuments: GlobalConfig = {
  slug: 'regulations-documents',
  fields: [
    {
      name: 'controls-selector',
      type: 'ui',
      admin: {
        components: {
          Field: 'src/components/nist-controls-selector',
        },
      },
    },
  ],
}
