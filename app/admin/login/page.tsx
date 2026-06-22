"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { runAuthAction } from "@/lib/auth-action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Password from "@/components/ui/password-input"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (isSubmitting) {
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const { error: signInError } = await runAuthAction(
        authClient.signIn.email({ email, password }),
        "Unable to sign in"
      )

      if (signInError) {
        setError(signInError)
        return
      }

      const { data: session, error: sessionError } = await runAuthAction(
        authClient.getSession(),
        "Unable to load session"
      )

      if (sessionError) {
        setError(sessionError)
        return
      }

      const redirectPath = session?.user?.role === "admin" ? "/admin" : "/dashboard"

      router.refresh()
      router.push(redirectPath)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <form
        className="flex flex-col gap-5 w-full max-w-xs"
        onSubmit={handleSubmit}
        noValidate
        aria-busy={isSubmitting}
      >
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-lg font-semibold tracking-widest text-foreground m-0">Admin Login</h1>
        </div>

        {error && (
          <p className="font-mono text-xs text-destructive border border-destructive rounded-sm px-3 py-2 m-0" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="admin-email">Email</Label>
          <Input
            id="admin-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="admin-password">Password</Label>
          <Password
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "[Signing In...]" : "[Sign In]"}
        </Button>
      </form>
    </div>
  )
}
