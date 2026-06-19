import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function protectRoute(role: "user" | "admin" = "user") {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect(role === "admin" ? "/admin/login" : "/login")
  }

  const userRole = (session.user as { role?: string }).role

  if (role === "admin" && userRole !== "admin") {
    redirect("/")
  }

  return session
}
