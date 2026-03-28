import { CollectionConfig } from 'payload'

export const PolicyGapAnalysesCollection: CollectionConfig = {
  slug: 'policy-gap-analyses',
  admin: {
    useAsTitle: 'policyName',
    group: 'GRC',
  },
  fields: [
    {
      name: 'gapId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'policyName',
      type: 'text',
      required: true,
      admin: {
        description:
          'Name of the affected policy or "Missing: <name>" for absent policies',
      },
    },
    {
      name: 'gapDescription',
      type: 'textarea',
      required: true,
    },
    {
      name: 'frameworksAffected',
      type: 'array',
      fields: [
        {
          name: 'frameworkName',
          type: 'text',
          required: true,
        },
        {
          name: 'sectionRef',
          type: 'text',
          required: true,
          admin: {
            description: 'Specific section or control reference (e.g. "AC-2", "§4.1")',
          },
        },
      ],
    },
    {
      name: 'priority',
      type: 'select',
      required: true,
      options: [
        { label: 'High', value: 'High' },
        { label: 'Medium', value: 'Medium' },
        { label: 'Low', value: 'Low' },
      ],
    },
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        { label: 'Draft Revision', value: 'Draft Revision' },
        { label: 'Draft New', value: 'Draft New' },
      ],
    },
    {
      name: 'confidence',
      type: 'number',
      min: 0,
      max: 1,
      admin: { description: 'Confidence score (0-1) in this gap identification' },
    },
    {
      name: 'reasoning',
      type: 'textarea',
      admin: { description: 'Agent rationale for why this gap was identified' },
    },
    {
      name: 'sourceRun',
      type: 'text',
      index: true,
      admin: {
        description: 'Trace ID of the pipeline run that produced this gap',
        readOnly: true,
      },
    },
    {
      name: 'sourceDocumentType',
      type: 'select',
      options: [
        { label: 'Board Circular', value: 'board-circulars' },
        { label: 'Annual Report', value: 'annual-reports' },
      ],
    },
    {
      name: 'sourceDocument',
      type: 'relationship',
      relationTo: ['board-circulars', 'annual-reports'],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'identified',
      options: [
        { label: 'Identified', value: 'identified' },
        { label: 'In Review', value: 'in-review' },
        { label: 'Resolved', value: 'resolved' },
      ],
    },
  ],
}
