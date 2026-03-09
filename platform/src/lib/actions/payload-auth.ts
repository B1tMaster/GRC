"use server"

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { User } from '@/payload-types'

import { headers as nextHeaders } from 'next/headers' 

export interface LoginResponse {
  token?: string
  user?: User
}

export const payloadAuth = async (): Promise<User | null> => {
  const headers = await nextHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({headers})
  if (!user) return null
  return user
}

export const payloadLogin = async ({ password, email }: { password: string, email: string }): Promise<LoginResponse> => {
  const payload = await getPayload({ config: configPromise })
  const { token, user } = await payload.login({
    collection: 'users',
    data: { email, password },
  })
  return {
    token,
    user,
  }
}
