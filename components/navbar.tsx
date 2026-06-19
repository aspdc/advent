"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"
import { useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useIsMounted()
  const isDark = mounted ? resolvedTheme === "dark" : false

  return (
    <Button
      variant="ghost"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? "[Light]" : "[Dark]"}
    </Button>
  )
}

export function Navbar() {
  const { data: session, isPending } = useSession()

  const displayName =
    session?.user?.name?.trim() ||
    session?.user?.email?.split("@")[0] ||
    "user"

  const profileHref = session?.user?.role === "admin" ? "/admin" : "/"

  return (
    <header className="w-full border-b border-border bg-background sticky top-0 z-50">
      <nav
        className="w-4/5 max-w-6xl mx-auto h-12 flex items-center justify-between"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex items-baseline gap-1.5 no-underline text-foreground font-mono"
          aria-label="Advent home"
        >
          <span className="text-sm font-semibold tracking-widest uppercase text-foreground">
            Advent
          </span>
          <span className="text-xs text-muted-foreground tracking-wide">
            2024
          </span>
        </Link>

        <ul className="list-none m-0 p-0 flex items-center gap-1" role="list">
          <li>
            <Button variant="ghost" asChild>
              <Link href="/puzzles">[Puzzles]</Link>
            </Button>
          </li>
          <li>
            <Button variant="ghost" asChild>
              <Link href="/leaderboard">[Leaderboard]</Link>
            </Button>
          </li>
          <li>
            <Button variant="ghost" asChild>
              <Link href="/about">[About]</Link>
            </Button>
          </li>
          <li>
            {isPending ? (
              <Button variant="ghost" disabled>
                [...]
              </Button>
            ) : session ? (
              <Button variant="ghost" asChild>
                <Link href={profileHref}>[{displayName}]</Link>
              </Button>
            ) : (
              <Button variant="ghost" asChild>
                <Link href="/login" id="nav-login">[Login]</Link>
              </Button>
            )}
          </li>
          <li>
            <ThemeToggle />
          </li>
        </ul>
      </nav>
    </header>
  )
}
