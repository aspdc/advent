"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"

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
      className="navbar-link"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? "[Light]" : "[Dark]"}
    </button>
  )
}

export function Navbar() {
  return (
    <header className="navbar">
      <nav className="navbar-inner" aria-label="Main navigation">
        {/* Brand */}
        <Link href="/" className="navbar-brand" aria-label="Advent home">
          <span className="navbar-title">Advent</span>
        </Link>

        {/* Right side */}
        <ul className="navbar-links" role="list">
          <li>
            <Link href="/puzzles" className="navbar-link">[Puzzles]</Link>
          </li>
          <li>
            <Link href="/leaderboard" className="navbar-link">[Leaderboard]</Link>
          </li>
          <li>
            <Link href="/about" className="navbar-link">[About]</Link>
          </li>
          <li>
            <Link href="/login" id="nav-login" className="navbar-link">[Login]</Link>
          </li>
          <li>
            <ThemeToggle />
          </li>
        </ul>
      </nav>
    </header>
  )
}
