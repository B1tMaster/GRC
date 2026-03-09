import { CollectionConfig } from 'payload'

export const ControlObjectivesCollection: CollectionConfig = {
  slug: 'control-objectives',
  admin: {
    useAsTitle: 'title',
    group: 'GRC',
  },
  fields: [
    {
      name: 'controlId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'governanceObjective',
      type: 'relationship',
      relationTo: 'governance-objectives',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Preventive', value: 'preventive' },
        { label: 'Detective', value: 'detective' },
        { label: 'Corrective', value: 'corrective' },
        { label: 'Directive', value: 'directive' },
      ],
    },
    {
      name: 'owner',
      type: 'text',
      admin: { description: 'Role or function responsible for this control' },
    },
    {
      name: 'frequency',
      type: 'select',
      options: [
        { label: 'Continuous', value: 'continuous' },
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
        { label: 'Quarterly', value: 'quarterly' },
        { label: 'Annual', value: 'annual' },
        { label: 'Event-driven', value: 'event_driven' },
      ],
    },
    {
      name: 'frameworkReferences',
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
          name: 'controlName',
          type: 'text',
        },
      ],
    },
    {
      name: 'extractionConfidence',
      type: 'select',
      options: ['high', 'medium', 'low'],
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
