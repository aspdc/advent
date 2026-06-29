import Elysia from "elysia"
import { hasRole, isAuthenticated } from "@/lib/middleware/auth"
import { db } from "@/db"
import { problem, user, submission } from "@/db/schema"
import { eq, ne, and, ilike, or, desc, asc, sql } from "drizzle-orm"
import { tryCatch } from "@/lib/try-catch"

function paginate(page: number, limit: number) {
  return { offset: (page - 1) * limit, limit }
}

function sanitizeSearch(input: string): string {
  return input.trim().slice(0, 100)
}

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

adminRoutes.get("/users", async ({ query, set }) => {
  const page = Math.max(1, Number(query["page"]) || 1)
  const limit = Math.min(100, Math.max(1, Number(query["limit"]) || 20))
  const search = sanitizeSearch(String(query["search"] || ""))
  const { offset } = paginate(page, limit)

  const whereClause = and(
    ne(user.role, "admin"),
    search
      ? or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`))
      : undefined,
  )

  const { data: countResult, error: countError } = await tryCatch(
    db.select({ count: sql<number>`count(*)` }).from(user).where(whereClause),
  )

  if (countError) {
    set.status = 500
    return { success: false, error: "Failed to fetch users" }
  }

  const { data: items, error } = await tryCatch(
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        banned: user.banned,
        banReason: user.banReason,
        score: user.score,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(whereClause)
      .orderBy(desc(user.createdAt))
      .limit(limit)
      .offset(offset),
  )

  if (error) {
    set.status = 500
    return { success: false, error: "Failed to fetch users" }
  }

  set.status = 200
  return {
    success: true,
    data: { items, total: Number(countResult?.[0]?.count ?? 0), page, limit },
  }
})

adminRoutes.put("/users/:id/ban", async ({ params: { id }, set }) => {
  const { data: existing, error: findError } = await tryCatch(
    db.query.user.findFirst({ where: eq(user.id, id) }),
  )

  if (findError || !existing) {
    set.status = 404
    return { success: false, error: "User not found" }
  }

  if (existing.role === "admin") {
    set.status = 403
    return { success: false, error: "Cannot ban the admin user" }
  }

  const { error: updateError } = await tryCatch(
    db
      .update(user)
      .set({
        banned: !existing.banned,
        banReason: !existing.banned ? "Banned by admin" : null,
      })
      .where(eq(user.id, id)),
  )

  if (updateError) {
    set.status = 500
    return { success: false, error: "Failed to update user" }
  }

  set.status = 200
  return { success: true, data: { id, banned: !existing.banned } }
})

adminRoutes.get("/submissions", async ({ query, set }) => {
  const page = Math.max(1, Number(query["page"]) || 1)
  const limit = Math.min(100, Math.max(1, Number(query["limit"]) || 20))
  const search = sanitizeSearch(String(query["search"] || ""))
  const sortBy = String(query["sortBy"] || "submittedAt")
  const sortDir = String(query["sortDir"] || "desc")
  const { offset } = paginate(page, limit)

  const orderColumn =
    sortBy === "problemId"
      ? submission.problemId
      : sortBy === "submittedValue"
        ? submission.submittedValue
        : submission.submittedAt

  const order = sortDir === "asc" ? asc(orderColumn) : desc(orderColumn)

  const whereClause = search
    ? or(
        ilike(user.name, `%${search}%`),
        ilike(sql`${submission.problemId}::text`, `%${search}%`),
        ilike(submission.submittedValue, `%${search}%`),
      )
    : undefined

  const { data: countResult, error: countError } = await tryCatch(
    db
      .select({ count: sql<number>`count(*)` })
      .from(submission)
      .leftJoin(user, eq(submission.userId, user.id))
      .where(whereClause),
  )

  if (countError) {
    set.status = 500
    return { success: false, error: "Failed to fetch submissions" }
  }

  const { data: items, error } = await tryCatch(
    db
      .select({
        id: submission.id,
        problemId: submission.problemId,
        userId: submission.userId,
        userName: user.name,
        submittedValue: submission.submittedValue,
        submittedAt: submission.submittedAt,
      })
      .from(submission)
      .leftJoin(user, eq(submission.userId, user.id))
      .where(whereClause)
      .orderBy(order)
      .limit(limit)
      .offset(offset),
  )

  if (error) {
    set.status = 500
    return { success: false, error: "Failed to fetch submissions" }
  }

  set.status = 200
  return {
    success: true,
    data: {
      items,
      total: Number(countResult?.[0]?.count ?? 0),
      page,
      limit,
    },
  }
})

export { adminRoutes }
