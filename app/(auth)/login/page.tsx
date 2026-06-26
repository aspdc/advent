/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { runAuthAction } from "@/lib/auth-action"
import { Button } from "@/components/ui/button"
import { clientEnv } from "@/lib/env"

export default function LoginPage() {
  const router = useRouter()
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
        authClient.signIn.social({
          provider: "google",
          callbackURL: "/",
        }),
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
            Login
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

        <div
          className="cf-turnstile w-full"
          data-sitekey={clientEnv.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_KEY}
        ></div>

        <Button id="login-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "[Signing In...]" : "[Sign In with Google]"}
        </Button>
      </form>
    </div>
  )
}
