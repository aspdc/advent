"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    async function checkSession() {
      const { data: session } = await runAuthAction(
        authClient.getSession(),
        "Unable to load session"
      )

      if (session) {
        const path =
          session.user.role === "admin" ? "/admin" : "/dashboard"
        router.replace(path)
        return
      }

      setIsChecking(false)
    }

    checkSession()
  }, [router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
        toast.error("Sign in failed", {
          description: signInError,
        })
        return
      }

      const { data: session, error: sessionError } = await runAuthAction(
        authClient.getSession(),
        "Unable to load session"
      )

      if (sessionError) {
        setError(sessionError)
        toast.error("Session error", {
          description: sessionError,
        })
        return
      }

      const name =
        session?.user?.name ||
        session?.user?.email?.split("@")[0] ||
        "Admin"

      toast.success(`Welcome, ${name}!`, {
        description: "Redirecting to admin panel...",
      })

      router.refresh()
      router.push("/admin")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isChecking) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Checking session...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <form
        className="flex w-full max-w-xs flex-col gap-5"
        onSubmit={handleSubmit}
        noValidate
        aria-busy={isSubmitting}
      >
        <div className="flex items-center gap-2">
          <h1 className="m-0 font-mono text-lg font-semibold tracking-widest text-foreground">
            Admin Login
          </h1>
        </div>

        {error && (
          <p
            className="m-0 rounded-sm border border-destructive px-3 py-2 font-mono text-xs text-destructive"
            role="alert"
          >
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

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "[Signing In...]" : "[Sign In]"}
        </Button>
      </form>
    </div>
  )
}
