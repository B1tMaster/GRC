import type { CollectionConfig } from 'payload'
import { AuthConfig } from '@/auth/config'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    hidden: false,
  },
  access: {
    read: ({ req: { user }, id }) => {
      if (user && user.role === 'admin') return true

      if (id && user && user.id === id) return true
      return false
    },
    create: () => true,
    update: ({ req: { user }, id }) => {
      if (user) {
        return user.role === 'admin' || user.id === id
      }
      return true
    },
    delete: ({ req: { user } }) => {
      if (user) {
        return user.role === 'admin'
      }
      return false
    },
  },
  auth: AuthConfig,
  fields: [
    {
      name: 'role',
      type: 'select',
      options: ['admin', 'user'],
      defaultValue: 'user',
      required: true,
      access: {
        read: ({ req: { user } }) => user?.role === 'admin',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data }) => {
        // For development environment, automatically verify users
        return {
          ...data,
          _verified: true,
        }
      },
    ],
  },
}
