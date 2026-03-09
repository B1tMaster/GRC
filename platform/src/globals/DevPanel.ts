import { GlobalConfig } from 'payload'

export const DevPanel: GlobalConfig = {
  slug: 'dev-panel',
  fields: [
    {
      name: 'limitTests',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'If enabled, the tests will be limited to 3 random cases for each suite',
      },
    },
    {
      name: 'workflowBatchSize',
      label: 'Workflow Test Case Batch Size',
      type: 'number',
      admin: {
        description: 'Number of test cases to process in parallel per workflow batch. Default: 5.',
      },
      defaultValue: 3,
      min: 1,
    },
  ],
}
