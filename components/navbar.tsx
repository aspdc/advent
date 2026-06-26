"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { authClient, useSession } from "@/lib/auth-client"
import { runAuthAction } from "@/lib/auth-action"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, isPending } = useSession()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const displayName =
    session?.user?.name?.trim() || session?.user?.email?.split("@")[0] || "user"

  const profileHref = session?.user?.role === "admin" ? "/admin" : "/dashboard"

  async function handleLogout() {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)

    try {
      const { error } = await runAuthAction(
        authClient.signOut(),
        "Unable to logout"
      )

      if (error) {
        return
      }

      router.refresh()
      router.push("/login")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <nav
        className="mx-auto flex h-12 w-4/5 max-w-6xl items-center justify-between"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex items-baseline gap-1.5 font-mono text-foreground no-underline"
          aria-label="Advent home"
        >
          <span className="text-sm font-semibold tracking-widest text-foreground uppercase">
            Advent
          </span>
        </Link>

        <ul className="m-0 flex list-none items-center gap-1 p-0" role="list">
          {[
            { href: "/dashboard", text: "Dashboard" },
            { href: "/leaderboard", text: "Leaderboard" },
            { href: "/about", text: "About" },
          ].map((item) => (
            <li key={item.href}>
              <Button variant="ghost" className="text-sm" asChild>
                <Link
                  href={item.href}
                  className={pathname === item.href ? "text-primary/70" : undefined}
                >
                  {`[${item.text}]`}
                </Link>
              </Button>
            </li>
          ))}
          <li>
            {isPending ? (
              <Button variant="ghost" disabled>
                [...]
              </Button>
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">[{displayName}]</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="font-mono">
                    @{displayName}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={profileHref}>
                      Go to{" "}
                      {session.user.role === "admin" ? "Admin" : "Dashboard"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={isLoggingOut}
                    onSelect={(event) => {
                      event.preventDefault()
                      void handleLogout()
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" asChild>
                <Link href="/login" id="nav-login">
                  [Login]
                </Link>
              </Button>
            )}
          </li>
        </ul>
      </nav>
    </header>
  )
}
