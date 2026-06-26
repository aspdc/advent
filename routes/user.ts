import Elysia from "elysia"
import { db } from "@/db"
import { submission } from "@/db/schema"
import { eq } from "drizzle-orm"
import { tryCatch } from "@/lib/try-catch"
import { hasRole, isAuthenticated } from "@/lib/middleware/auth"

const userRoutes = new Elysia({prefix: "/user"})
  .use(isAuthenticated)
  .use(hasRole(["user", "admin"]))

userRoutes.get("/progress", async ({ headers, set }) => {
  const userId = headers["user-id"]

  if (!userId) {
    set.status = 401
    return { success: false, data: null, error: "Unauthorized" }
  }

  const result = await tryCatch(
    db
      .select()
      .from(submission)
      .where(eq(submission.userId, userId as string))
  )

  if (result.error) {
    set.status = 500
    return { success: false, data: null, error: result.error }
  }

  set.status = 200
  return { success: true, data: result.data, error: null }
})

export { userRoutes }
