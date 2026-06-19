"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { tryCatch } from "@/lib/try-catch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data: signInResponse, error: requestError } = await tryCatch(
      authClient.signIn.email({ email, password })
    )

    setLoading(false)

    if (requestError) {
      setError(requestError.message)
      return
    }

    if (signInResponse?.error) {
      setError(signInResponse.error.message || "Unable to sign in")
      return
    }

    router.refresh()
    router.push("/admin")
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <form className="flex flex-col gap-5 w-full max-w-xs" onSubmit={handleSubmit} noValidate>
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
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="admin-password">Password</Label>
          <Input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? "..." : "[Sign In]"}
        </Button>
      </form>
    </div>
  )
}
