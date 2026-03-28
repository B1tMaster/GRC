import { CollectionConfig } from 'payload'

export const PipelineRunsCollection: CollectionConfig = {
  slug: 'pipeline-runs',
  admin: {
    useAsTitle: 'runId',
    group: 'GRC',
  },
  fields: [
    {
      name: 'runId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'sourceDocument',
      type: 'relationship',
      relationTo: ['board-circulars', 'annual-reports'],
      required: true,
    },
    {
      name: 'collectionSlug',
      type: 'text',
      required: true,
    },
    {
      name: 'traceId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Running', value: 'running' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    {
      name: 'currentStep',
      type: 'text',
      admin: { description: 'Current pipeline step being executed' },
    },
    {
      name: 'steps',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Active', value: 'active' },
            { label: 'Complete', value: 'complete' },
            { label: 'Error', value: 'error' },
          ],
        },
        {
          name: 'startedAt',
          type: 'date',
        },
        {
          name: 'completedAt',
          type: 'date',
        },
        {
          name: 'output',
          type: 'json',
          admin: { description: 'Step output/results' },
        },
        {
          name: 'error',
          type: 'text',
        },
      ],
    },
    {
      name: 'startedAt',
      type: 'date',
    },
    {
      name: 'completedAt',
      type: 'date',
    },
    {
      name: 'elapsedMs',
      type: 'number',
      admin: { description: 'Total elapsed time in milliseconds' },
    },
    {
      name: 'error',
      type: 'textarea',
    },
    {
      name: 'results',
      type: 'group',
      fields: [
        { name: 'objectivesCreated', type: 'number', defaultValue: 0 },
        { name: 'statementsCreated', type: 'number', defaultValue: 0 },
        { name: 'controlsCreated', type: 'number', defaultValue: 0 },
        { name: 'frameworkMappings', type: 'number', defaultValue: 0 },
        { name: 'gapsIdentified', type: 'number', defaultValue: 0 },
        { name: 'draftsCreated', type: 'number', defaultValue: 0 },
      ],
    },
  ],
}
