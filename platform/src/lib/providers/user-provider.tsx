'use client'

import { createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import type { User, TestRun } from '@/payload-types'
import type { LoginResponse } from '@/lib/actions/payload-auth'
import { payloadAuth, payloadLogin } from '@/lib/actions/payload-auth'
import { getTestRuns } from '@/lib/actions/payload-collections'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface UserContextType {
  user: User | null
  tasks: TestRun[]
  isLoading: boolean
  login: (data: { password: string; email: string }) => Promise<LoginResponse>
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['auth'],
    queryFn: payloadAuth,
  })

  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTestRuns,
    enabled: !!user,
  })

  const logout = async () => {
    Cookies.remove('payload-token')
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['auth'] }),
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    ])
    router.push('/login')
  }

  const { mutateAsync: login, isPending: isLoginLoading } = useMutation({
    mutationFn: async (data: { password: string; email: string }) => {
      return await payloadLogin(data)
    },
    onSuccess: ({ token }) => {
      if (token) {
        Cookies.set('payload-token', token)
        Promise.all([queryClient.invalidateQueries({ queryKey: ['auth'] }), queryClient.invalidateQueries({ queryKey: ['tasks'] })]).then(() => {
          router.push('/')
        })
      }
    },
    onError: error => {
      throw error instanceof Error ? error : new Error('Login failed')
    },
  })

  return (
    <UserContext.Provider
      value={{
        user: user || null,
        isLoading: isLoadingUser || isLoadingTasks || isLoginLoading,
        logout,
        login,
        tasks,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
