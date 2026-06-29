import Elysia from "elysia"
import { db } from "@/db"
import { submission } from "@/db/schema"
import { eq } from "drizzle-orm"
import { tryCatch } from "@/lib/try-catch"
import { hasRole, isAuthenticated } from "@/lib/middleware/auth"
import { getActiveProblemCount } from "@/lib/problems/active"

const userRoutes = new Elysia({prefix: "/user"})
  .use(isAuthenticated)
  .use(hasRole(["user", "admin"]))

userRoutes.get("/progress", async ({ user, set }) => {
  if (!user) {
    set.status = 401
    return { success: false, data: null, error: "Unauthorized" }
  }

  const [result, activeCount] = await Promise.all([
    tryCatch(
      db
        .select()
        .from(submission)
        .where(eq(submission.userId, user.id))
    ),
    getActiveProblemCount(),
  ])

  if (result.error) {
    set.status = 500
    return { success: false, data: null, error: result.error }
  }

  set.status = 200
  return { success: true, data: result.data, activeCount, error: null }
})

export { userRoutes }
