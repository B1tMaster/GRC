import { CollectionConfig } from 'payload'

export const AnnualReportsCollection: CollectionConfig = {
  slug: 'annual-reports',
  admin: {
    useAsTitle: 'title',
    group: 'GRC',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'organization',
      type: 'text',
    },
    {
      name: 'reportingYear',
      type: 'number',
    },
    {
      name: 'publishDate',
      type: 'date',
    },
    {
      name: 's3Key',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 's3Url',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'parsedText',
      type: 'textarea',
      admin: { readOnly: true },
    },
    {
      name: 'extractionStatus',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Parsing', value: 'parsing' },
        { label: 'Parsed', value: 'parsed' },
        { label: 'Extracting', value: 'extracting' },
        { label: 'Complete', value: 'complete' },
        { label: 'Error', value: 'error' },
      ],
      defaultValue: 'pending',
    },
    {
      name: 'errorMessage',
      type: 'text',
      admin: {
        condition: (data) => data.extractionStatus === 'error',
      },
    },
    {
      name: 'governanceObjectives',
      type: 'join',
      collection: 'governance-objectives',
      on: 'sourceDocument',
    },
    {
      name: 'riskAppetiteStatements',
      type: 'join',
      collection: 'risk-appetite-statements',
      on: 'sourceDocument',
    },
  ],
}
