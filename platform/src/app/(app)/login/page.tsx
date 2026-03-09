"use client"

import { Route } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import { useUser } from "@/lib/providers/user-provider"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"

export default function LoginPage() {
  const { login, user, isLoading } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isLoading && user) {
      router.push(process.env.NEXT_PUBLIC_DEFAULT_REDIRECT || "/tasks")
    }
  }, [isLoading, user, router])

  const onLogin = async (data: { password: string, email: string }) => {
    try {
      setLoading(true)
      await login(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // If loading or user exists, show nothing while redirecting
  if (!isLoading && user) {
    return null
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Route className="size-4" />
          </div>
          SecurePath
        </a>
        <LoginForm onLogin={onLogin} loading={loading} />
      </div>
    </div>
  )
}
