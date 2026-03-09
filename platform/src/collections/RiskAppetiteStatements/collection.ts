import { CollectionConfig } from 'payload'

export const RiskAppetiteStatementsCollection: CollectionConfig = {
  slug: 'risk-appetite-statements',
  admin: {
    useAsTitle: 'statement',
    group: 'GRC',
  },
  fields: [
    {
      name: 'statementId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'statement',
      type: 'textarea',
      required: true,
    },
    {
      name: 'riskCategory',
      type: 'select',
      options: [
        { label: 'Strategic', value: 'strategic' },
        { label: 'Operational', value: 'operational' },
        { label: 'Financial', value: 'financial' },
        { label: 'Compliance', value: 'compliance' },
        { label: 'Technology', value: 'technology' },
        { label: 'Reputational', value: 'reputational' },
        { label: 'Cyber', value: 'cyber' },
      ],
    },
    {
      name: 'appetiteLevel',
      type: 'select',
      options: [
        { label: 'Averse', value: 'averse' },
        { label: 'Minimal', value: 'minimal' },
        { label: 'Cautious', value: 'cautious' },
        { label: 'Open', value: 'open' },
        { label: 'Hungry', value: 'hungry' },
      ],
    },
    {
      name: 'toleranceThreshold',
      type: 'text',
      admin: { description: 'Quantitative or qualitative tolerance boundary' },
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
      name: 'sourceSection',
      type: 'text',
    },
    {
      name: 'extractionConfidence',
      type: 'select',
      options: ['high', 'medium', 'low'],
    },
    {
      name: 'linkedGovernanceObjectives',
      type: 'relationship',
      relationTo: 'governance-objectives',
      hasMany: true,
    },
    {
      name: 'frameworkMappings',
      type: 'array',
      fields: [
        {
          name: 'framework',
          type: 'relationship',
          relationTo: 'frameworks',
        },
        {
          name: 'controlId',
          type: 'text',
        },
        {
          name: 'rationale',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'reviewStatus',
      type: 'select',
      options: [
        { label: 'Pending Review', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Modified', value: 'modified' },
      ],
      defaultValue: 'pending',
    },
    {
      name: 'reviewNotes',
      type: 'textarea',
    },
  ],
}
