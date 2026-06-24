"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { runAuthAction } from "@/lib/auth-action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Password from "@/components/ui/password-input"
import { clientEnv } from "@/lib/env"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    return () => {
      if (typeof window !== "undefined" && (window as any).turnstile) {
        try {
          ;(window as any).turnstile.remove()
        } catch (e) {
          console.warn("Turnstile cleanup skipped:", e)
        }
      }
      document.head.removeChild(script)
    }
  }, [])

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()

    if (isSubmitting) {
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const turnstileToken = String(formData.get("cf-turnstile-response"))
      const { error: signInError } = await runAuthAction(
        authClient.signIn.email({ email, password }),
        turnstileToken,
        "Unable to sign in"
      )

      if (signInError) {
        setError(signInError)

        if (typeof window !== "undefined" && (window as any).turnstile)
          (window as any).turnstile.reset()

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

      const redirectPath =
        session?.user?.role === "admin" ? "/admin" : "/dashboard"

      router.refresh()
      router.push(redirectPath)
    } finally {
      setIsSubmitting(false)
    }
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

        <div
          className="cf-turnstile"
          data-sitekey={clientEnv.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_KEY}
        ></div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "[Signing In...]" : "[Sign In]"}
        </Button>
      </form>
    </div>
  )
}
