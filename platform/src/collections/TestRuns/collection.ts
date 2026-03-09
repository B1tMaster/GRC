import { CollectionConfig, Field } from 'payload'
import startTestHandler from '@/collections/TestRuns/api/start/handler'
import completeRelatedTestSuitesHandler from '@/collections/TestRuns/api/start/completions/related-test-suites/handler'

export const testRunResultFields: Field[] = [
  {
    name: 'case',
    type: 'relationship',
    relationTo: 'test-cases',
  },
  {
    name: 'summary',
    type: 'group',
    fields: [
      {
        name: 'status',
        type: 'select',
        options: [
          { label: 'Compliant', value: 'COMPLIANT' },
          { label: 'Partially Compliant', value: 'PARTIALLY_COMPLIANT' },
          { label: 'Non Compliant', value: 'NON_COMPLIANT' },
        ],
      },
      {
        name: 'confidenceLevel',
        type: 'text',
      },
      {
        name: 'briefing',
        type: 'textarea',
      },
    ],
  },
  {
    name: 'gaps',
    type: 'array',
    fields: [
      {
        name: 'title',
        type: 'text',
      },
      {
        name: 'description',
        type: 'textarea',
      },
      {
        name: 'severity',
        type: 'select',
        options: [
          { label: 'Critical', value: 'CRITICAL' },
          { label: 'High', value: 'HIGH' },
          { label: 'Medium', value: 'MEDIUM' },
          { label: 'Low', value: 'LOW' },
        ],
      },
      {
        name: 'documentEvidence',
        type: 'array',
        fields: [
          {
            name: 'citation',
            type: 'textarea',
          },
          {
            name: 'location',
            type: 'text',
          },
          {
            name: 'context',
            type: 'textarea',
          },
        ],
      },
      {
        name: 'controlEvidence',
        type: 'array',
        fields: [
          {
            name: 'citation',
            type: 'textarea',
          },
          {
            name: 'location',
            type: 'text',
          },
          {
            name: 'context',
            type: 'textarea',
          },
        ],
      },
      {
        name: 'impact',
        type: 'group',
        fields: [
          {
            name: 'security',
            type: 'textarea',
          },
          {
            name: 'compliance',
            type: 'textarea',
          },
          {
            name: 'operational',
            type: 'textarea',
          },
        ],
      },
      {
        name: 'recommendation',
        type: 'group',
        fields: [
          {
            name: 'description',
            type: 'textarea',
          },
          {
            name: 'priority',
            type: 'select',
            options: [
              { label: 'High', value: 'HIGH' },
              { label: 'Medium', value: 'MEDIUM' },
              { label: 'Low', value: 'LOW' },
            ],
          },
          {
            name: 'steps',
            type: 'array',
            fields: [
              {
                name: 'step',
                type: 'text',
              },
            ],
          },
          {
            name: 'expectedOutcome',
            type: 'textarea',
          },
        ],
      },
    ],
  },
  {
    name: 'overallRecommendations',
    type: 'group',
    fields: [
      {
        name: 'priority',
        type: 'select',
        options: [
          { label: 'High', value: 'HIGH' },
          { label: 'Medium', value: 'MEDIUM' },
          { label: 'Low', value: 'LOW' },
        ],
      },
      {
        name: 'dependencies',
        type: 'array',
        fields: [
          {
            name: 'dependency',
            type: 'text',
          },
        ],
      },
    ],
  },
]

export const TestRunsCollection: CollectionConfig = {
  slug: 'test-runs',
  dbName: 'tests',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'startTestBtn',
      type: 'ui',
      admin: {
        components: {
          Field: 'src/components/start-test',
        },
      },
    },
    {
      name: 'completionTestCasesBtn',
      type: 'ui',
      admin: {
        components: {
          Field: 'src/components/completion-test-cases',
        },
      },
    },
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Created', value: 'CREATED' },
        { label: 'Fulfilled', value: 'FULFILLED' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'Completed', value: 'COMPLETED' },
        { label: 'Failed', value: 'FAILED' },
      ],
      defaultValue: 'CREATED',
    },
    {
      name: 'input',
      type: 'relationship',
      relationTo: 'input-files',
      hasMany: true,
    },
    {
      name: 'result',
      type: 'array',
      fields: [
        {
          name: 'suites',
          type: 'group',
          fields: [
            {
              name: 'suite',
              relationTo: 'test-suites',
              type: 'relationship',
            },
            {
              name: 'cases',
              type: 'array',
              fields: testRunResultFields,
            },
          ],
        },
      ],
    },
  ],
  endpoints: [
    {
      path: '/:id/start',
      method: 'post',
      handler: startTestHandler,
    },
    {
      path: '/:id/completions/related-test-suites',
      method: 'post',
      handler: completeRelatedTestSuitesHandler,
    },
  ],
}
