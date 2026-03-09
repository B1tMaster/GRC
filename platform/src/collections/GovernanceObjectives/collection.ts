import { CollectionConfig } from 'payload'

export const GovernanceObjectivesCollection: CollectionConfig = {
  slug: 'governance-objectives',
  admin: {
    useAsTitle: 'text',
    group: 'GRC',
  },
  fields: [
    {
      name: 'objectiveId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'text',
      type: 'textarea',
      required: true,
    },
    {
      name: 'sourceDocumentType',
      type: 'select',
      options: [
        { label: 'Board Circular', value: 'board-circulars' },
        { label: 'Annual Report', value: 'annual-reports' },
      ],
      required: true,
    },
    {
      name: 'sourceDocument',
      type: 'relationship',
      relationTo: ['board-circulars', 'annual-reports'],
      required: true,
    },
    {
      name: 'sourceSection',
      type: 'text',
    },
    {
      name: 'sourceSectionType',
      type: 'select',
      options: [
        { label: 'Board Responsibilities', value: 'board_responsibilities' },
        { label: 'Risk Appetite', value: 'risk_appetite' },
        { label: 'Matters Reserved', value: 'matters_reserved' },
        { label: 'Agenda Item', value: 'agenda_item' },
        { label: 'Committee Update', value: 'committee_update' },
        { label: 'Strategic Objectives', value: 'strategic_objectives' },
        { label: 'Governance Principles', value: 'governance_principles' },
        { label: 'Risk Management', value: 'risk_management' },
        { label: 'Compliance', value: 'compliance' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'extractionConfidence',
      type: 'select',
      options: [
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' },
      ],
    },
    {
      name: 'keywords',
      type: 'json',
      admin: {
        description: 'Extracted governance keywords',
      },
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
    {
      name: 'controlObjectives',
      type: 'join',
      collection: 'control-objectives',
      on: 'governanceObjective',
    },
    {
      name: 'frameworkMappings',
      type: 'array',
      admin: { readOnly: true },
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
          name: 'controlName',
          type: 'text',
        },
        {
          name: 'similarityScore',
          type: 'number',
          min: 0,
          max: 1,
        },
        {
          name: 'confidence',
          type: 'select',
          options: ['high', 'medium', 'low'],
        },
        {
          name: 'matchedKeywords',
          type: 'json',
        },
        {
          name: 'rationale',
          type: 'textarea',
        },
      ],
    },
  ],
}
