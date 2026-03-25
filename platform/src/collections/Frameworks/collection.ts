import { CollectionConfig } from 'payload'

export const FrameworksCollection: CollectionConfig = {
  slug: 'frameworks',
  admin: {
    useAsTitle: 'name',
    group: 'GRC',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'code',
      type: 'select',
      options: [
        { label: 'COBIT 2019', value: 'COBIT2019' },
        { label: 'COSO ERM', value: 'COSO_ERM' },
        { label: 'ISO 27001', value: 'ISO27001' },
        { label: 'NIST CSF', value: 'NIST_CSF' },
        { label: 'NIST 800-53 r5', value: 'NIST_800_53' },
        { label: 'HKMA', value: 'HKMA' },
        { label: 'HKMA SPM', value: 'HKMA_SPM' },
        { label: 'MAS', value: 'MAS' },
        { label: 'PCI DSS v4', value: 'PCI_DSS' },
      ],
      required: true,
      index: true,
    },
    {
      name: 'version',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'controls',
      type: 'array',
      fields: [
        {
          name: 'controlId',
          type: 'text',
          required: true,
        },
        {
          name: 'controlName',
          type: 'text',
          required: true,
        },
        {
          name: 'domain',
          type: 'text',
        },
        {
          name: 'process',
          type: 'text',
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'keywords',
          type: 'json',
          admin: {
            description: 'Array of keyword strings for mapping',
          },
        },
      ],
    },
  ],
}
