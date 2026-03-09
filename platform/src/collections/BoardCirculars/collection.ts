import { CollectionConfig } from 'payload'

export const BoardCircularsCollection: CollectionConfig = {
  slug: 'board-circulars',
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
      name: 'publishDate',
      type: 'date',
    },
    {
      name: 'documentType',
      type: 'select',
      options: [
        { label: 'Board Minutes', value: 'board_minutes' },
        { label: 'Governance Framework', value: 'governance_framework' },
        { label: 'Strategy Document', value: 'strategy_document' },
        { label: 'Policy Document', value: 'policy_document' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'board_minutes',
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
      maxLength: 1000000,
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
  ],
}
