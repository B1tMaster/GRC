import { CollectionConfig } from 'payload'

export const DecisionLogsCollection: CollectionConfig = {
  slug: 'decision-logs',
  admin: {
    useAsTitle: 'action',
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
      name: 'action',
      type: 'text',
      required: true,
    },
    {
      name: 'entityType',
      type: 'select',
      options: [
        { label: 'Board Circular', value: 'board-circulars' },
        { label: 'Annual Report', value: 'annual-reports' },
        { label: 'Governance Objective', value: 'governance-objectives' },
        { label: 'Control Objective', value: 'control-objectives' },
        { label: 'Risk Appetite Statement', value: 'risk-appetite-statements' },
        { label: 'Framework Mapping', value: 'framework-mapping' },
      ],
      required: true,
    },
    {
      name: 'entityId',
      type: 'text',
      required: true,
    },
    {
      name: 'agentType',
      type: 'select',
      options: [
        { label: 'Document Parser', value: 'document_parser' },
        { label: 'Objective Extractor', value: 'objective_extractor' },
        { label: 'Control Deriver', value: 'control_deriver' },
        { label: 'Risk Extractor', value: 'risk_extractor' },
        { label: 'Framework Mapper', value: 'framework_mapper' },
        { label: 'Human Review', value: 'human_review' },
      ],
    },
    {
      name: 'input',
      type: 'json',
      admin: { description: 'Input provided to the agent/decision step' },
    },
    {
      name: 'output',
      type: 'json',
      admin: { description: 'Output produced by the agent/decision step' },
    },
    {
      name: 'reasoning',
      type: 'textarea',
      admin: { description: 'LLM reasoning or human justification' },
    },
    {
      name: 'confidence',
      type: 'number',
      min: 0,
      max: 1,
    },
    {
      name: 'modelUsed',
      type: 'text',
    },
    {
      name: 'tokenUsage',
      type: 'group',
      fields: [
        { name: 'input', type: 'number' },
        { name: 'output', type: 'number' },
        { name: 'total', type: 'number' },
      ],
    },
    {
      name: 'timestamp',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      admin: { readOnly: true },
    },
  ],
}
