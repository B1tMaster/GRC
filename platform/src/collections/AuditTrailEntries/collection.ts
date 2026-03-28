import { CollectionConfig } from 'payload'

export const AuditTrailEntriesCollection: CollectionConfig = {
  slug: 'audit-trail-entries',
  admin: {
    useAsTitle: 'eventType',
    group: 'GRC',
  },
  fields: [
    {
      name: 'traceId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'eventType',
      type: 'select',
      options: [
        { label: 'Document Uploaded', value: 'document_uploaded' },
        { label: 'Document Parsed', value: 'document_parsed' },
        { label: 'Objectives Extracted', value: 'objectives_extracted' },
        { label: 'Controls Derived', value: 'controls_derived' },
        { label: 'Risk Appetite Extracted', value: 'risk_appetite_extracted' },
        { label: 'Framework Mapped', value: 'framework_mapped' },
        { label: 'Human Approved', value: 'human_approved' },
        { label: 'Human Rejected', value: 'human_rejected' },
        { label: 'Human Modified', value: 'human_modified' },
        { label: 'Extraction Workflow Started', value: 'extraction_workflow_started' },
        { label: 'Extraction Workflow Completed', value: 'extraction_workflow_completed' },
        { label: 'Extraction Workflow Failed', value: 'extraction_workflow_failed' },
        { label: 'Gap Identified', value: 'gap_identified' },
        { label: 'Policy Draft Created', value: 'policy_draft_created' },
        { label: 'Policy Approved', value: 'policy_approved' },
        { label: 'Policy Challenge Raised', value: 'policy_challenge_raised' },
        { label: 'Policy Published', value: 'policy_published' },
        { label: 'Pipeline Run Started', value: 'pipeline_run_started' },
        { label: 'Pipeline Run Completed', value: 'pipeline_run_completed' },
        { label: 'Pipeline Run Failed', value: 'pipeline_run_failed' },
      ],
      required: true,
    },
    {
      name: 'entityType',
      type: 'text',
      required: true,
    },
    {
      name: 'entityId',
      type: 'text',
      required: true,
    },
    {
      name: 'actor',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'System', value: 'system' },
            { label: 'User', value: 'user' },
            { label: 'AI Agent', value: 'ai_agent' },
          ],
        },
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'user',
          },
        },
        {
          name: 'agentName',
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'ai_agent',
          },
        },
      ],
    },
    {
      name: 'details',
      type: 'json',
      admin: { description: 'Event-specific payload' },
    },
    {
      name: 'sourceTrace',
      type: 'group',
      admin: { description: 'Explainability chain back to source' },
      fields: [
        {
          name: 'sourceDocumentCollection',
          type: 'text',
        },
        {
          name: 'sourceDocumentId',
          type: 'text',
        },
        {
          name: 'sourceSection',
          type: 'text',
        },
        {
          name: 'sourceText',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'timestamp',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      admin: { readOnly: true },
      index: true,
    },
  ],
}
