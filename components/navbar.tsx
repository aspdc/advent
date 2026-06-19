"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"

const NAV_LINK =
  "font-mono text-xs text-muted-foreground no-underline px-2 py-1 rounded-sm transition-colors duration-150 hover:text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"

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
    <button
      id="theme-toggle"
      className={`${NAV_LINK} appearance-none border-none bg-transparent cursor-pointer`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? "[Light]" : "[Dark]"}
    </button>
  )
}

export function Navbar() {
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
          <span className="text-primary text-xl leading-none animate-star-pulse" aria-hidden="true">
            *
          </span>
          <span className="text-sm font-semibold tracking-widest uppercase text-foreground">
            Advent
          </span>
          <span className="text-xs text-muted-foreground tracking-wide">
            2024
          </span>
        </Link>

        <ul className="list-none m-0 p-0 flex items-center gap-1" role="list">
          <li>
            <Link href="/puzzles" className={NAV_LINK}>[Puzzles]</Link>
          </li>
          <li>
            <Link href="/leaderboard" className={NAV_LINK}>[Leaderboard]</Link>
          </li>
          <li>
            <Link href="/about" className={NAV_LINK}>[About]</Link>
          </li>
          <li>
            <Link href="/login" id="nav-login" className={NAV_LINK}>[Login]</Link>
          </li>
          <li>
            <ThemeToggle />
          </li>
        </ul>
      </nav>
    </header>
  )
}
