"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { tryCatch } from "@/lib/try-catch"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: signInError } = await tryCatch(
      authClient.signIn.email({ email, password })
    )

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    router.push("/")
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <form className="flex flex-col gap-5 w-full max-w-xs" onSubmit={handleSubmit} noValidate>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xl text-primary animate-star-pulse" aria-hidden="true">*</span>
          <h1 className="font-mono text-lg font-semibold tracking-widest text-foreground m-0">Login</h1>
        </div>

        {error && (
          <p className="font-mono text-xs text-destructive border border-destructive rounded-sm px-3 py-2 m-0" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-xs text-muted-foreground tracking-wide" htmlFor="email">Email</label>
          <input
            id="email"
            className="bg-background text-foreground border border-border rounded-sm px-3 py-2 font-mono text-sm w-full outline-none transition-colors duration-150 focus:border-primary"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-xs text-muted-foreground tracking-wide" htmlFor="password">Password</label>
          <input
            id="password"
            className="bg-background text-foreground border border-border rounded-sm px-3 py-2 font-mono text-sm w-full outline-none transition-colors duration-150 focus:border-primary"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          id="login-submit"
          className="font-mono text-xs text-primary-foreground bg-primary border-none rounded-sm px-4 py-2.5 transition-opacity duration-150 tracking-wider mt-1 hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          {loading ? "..." : "[Sign In]"}
        </button>
      </form>
    </div>
  )
}
