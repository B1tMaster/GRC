import { CollectionConfig } from 'payload'

export const PolicyDraftsCollection: CollectionConfig = {
  slug: 'policy-drafts',
  admin: {
    useAsTitle: 'policyName',
    group: 'GRC',
  },
  fields: [
    {
      name: 'draftId',
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
    },
    {
      name: 'version',
      type: 'text',
      required: true,
    },
    {
      name: 'sections',
      type: 'array',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Added', value: 'added' },
            { label: 'Modified', value: 'modified' },
            { label: 'Removed', value: 'removed' },
          ],
        },
        { name: 'sectionNumber', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'textarea', required: true },
        { name: 'previousContent', type: 'textarea' },
        {
          name: 'citations',
          type: 'array',
          fields: [
            { name: 'frameworkName', type: 'text', required: true },
            { name: 'sectionRef', type: 'text', required: true },
            { name: 'description', type: 'text' },
          ],
        },
        {
          name: 'confidence',
          type: 'number',
          min: 0,
          max: 1,
        },
      ],
    },
    {
      name: 'overallConfidence',
      type: 'number',
      min: 0,
      max: 1,
      admin: { description: 'Overall draft confidence (0-1). Below 0.7 requires human review.' },
    },
    {
      name: 'humanDraftRequired',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'True if confidence < 70% — blocked from approval' },
    },
    {
      name: 'humanDraftReason',
      type: 'textarea',
    },
    {
      name: 'rationale',
      type: 'group',
      fields: [
        { name: 'whyNeeded', type: 'json' },
        { name: 'frameworksMandating', type: 'json' },
        { name: 'relatedArtifactImpact', type: 'json' },
      ],
    },
    {
      name: 'sourceGap',
      type: 'relationship',
      relationTo: 'policy-gap-analyses',
      admin: { description: 'The gap this draft addresses' },
    },
    {
      name: 'sourceRun',
      type: 'text',
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Human Draft Required', value: 'human-draft-required' },
        { label: 'In Review', value: 'in-review' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Published', value: 'published' },
      ],
    },
    {
      name: 'approvedBy',
      type: 'text',
    },
    {
      name: 'approvedAt',
      type: 'date',
    },
  ],
}
