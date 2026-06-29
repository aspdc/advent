import Elysia from "elysia"
import { hasRole, isAuthenticated } from "@/lib/middleware/auth"
import { db } from "@/db"
import { problem } from "@/db/schema"
import { eq } from "drizzle-orm"
import { tryCatch } from "@/lib/try-catch"

const adminRoutes = new Elysia({ prefix: "/admin" })
  .use(isAuthenticated)
  .use(hasRole(["admin"]))

adminRoutes.get("/problems", async ({ set }) => {
  const { data, error } = await tryCatch(
    db
      .select({ id: problem.id, isActive: problem.isActive })
      .from(problem)
      .orderBy(problem.id),
  )

  if (error) {
    set.status = 500
    return { success: false, error: "Failed to fetch problems" }
  }

  set.status = 200
  return { success: true, data }
})

adminRoutes.put("/problems/:id", async ({ params: { id }, set }) => {
  const { data: existing, error: findError } = await tryCatch(
    db.query.problem.findFirst({ where: eq(problem.id, id) }),
  )

  if (findError || !existing) {
    set.status = 404
    return { success: false, error: "Problem not found" }
  }

  const { error: updateError } = await tryCatch(
    db
      .update(problem)
      .set({ isActive: !existing.isActive })
      .where(eq(problem.id, id)),
  )

  if (updateError) {
    set.status = 500
    return { success: false, error: "Failed to update problem" }
  }

  set.status = 200
  return { success: true, data: { id, isActive: !existing.isActive } }
})

export { adminRoutes }
