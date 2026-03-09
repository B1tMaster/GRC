import type { PayloadRequest } from 'payload'

export const AuthConfig = {
  tokenExpiration: 86400 * 7, // 7 days
  verify: true,
}

export const ACLConfig = {
  read: ({ req }: { req: PayloadRequest }) => {
    const user = req.user
    if (!user) {
      return false
    }

    if (user.role === 'admin') {
      return true
    }

    return {
      user: {
        equals: user.id,
      },
    }
  },
  create: () => true,
  update: ({ req: { user } }: { req: PayloadRequest }) => {
    if (user) {
      return user.role === 'admin' // Allow updates for admin users
    }
    return false
  },
  delete: () => true,
}
