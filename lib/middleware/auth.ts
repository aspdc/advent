import { type AnyElysia, Elysia } from "elysia"
import { auth } from "@/lib/auth"

export const isAuthenticated = new Elysia({ name: "isAuthenticated" }).derive(
  { as: "scoped" },
  async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return { user: null, session: null }
    }

    return {
      user: session.user,
      session: session.session,
    }
  }
)

export const hasRole = (allowedRoles: string[]) => {
  return (app: AnyElysia) =>
    app.onBeforeHandle(({ user, set }) => {
      if (!user) {
        set.status = 401
        return "Unauthorized access"
      }
      if (!user.role || !allowedRoles.includes(user.role)) {
        set.status = 403
        return "Forbidden: You do not have the required role"
      }
    })
}
