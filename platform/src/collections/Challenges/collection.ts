import { CollectionConfig } from 'payload'

export const ChallengesCollection: CollectionConfig = {
  slug: 'challenges',
  admin: {
    useAsTitle: 'challengeId',
    group: 'GRC',
  },
  fields: [
    {
      name: 'challengeId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'policyDraft',
      type: 'relationship',
      relationTo: 'policy-drafts',
      required: true,
    },
    {
      name: 'challengedBy',
      type: 'text',
      required: true,
      admin: { description: 'User ID or name of the challenger' },
    },
    {
      name: 'rationale',
      type: 'textarea',
      required: true,
      admin: { description: 'Reason for challenging the policy draft' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'open',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Under Review', value: 'under-review' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Dismissed', value: 'dismissed' },
      ],
    },
    {
      name: 'resolution',
      type: 'textarea',
    },
    {
      name: 'resolvedAt',
      type: 'date',
    },
  ],
}
