import Elysia from "elysia"
import { z } from "zod"
import { hasRole, isAuthenticated } from "@/lib/middleware/auth"
import { getSolvedSet, isUnlocked } from "@/lib/problems/protect"
import { TOTAL_PROBLEMS } from "@/types/progress"
import { executeLambda } from "@/lib/lambda"
import { db } from "@/db"
import { submission } from "@/db/schema"
import { tryCatch } from "@/lib/try-catch"

const problemRoutes = new Elysia({ prefix: "/problem" })
  .use(isAuthenticated)
  .use(hasRole(["user", "admin"]))

problemRoutes.get("/:id", async ({ params: { id }, user, set }) => {
  if (!user) {
    set.status = 401
    return { success: false, data: null, error: "Unauthorized" }
  }

  const problemId = Number(id)

  if (problemId < 1 || problemId > TOTAL_PROBLEMS) {
    set.status = 404
    return { success: false, data: null, error: "Problem not found" }
  }

  const solved = await getSolvedSet(user.id)

  if (!isUnlocked(solved, problemId)) {
    set.status = 403
    return { success: false, data: null, error: "Problem is locked" }
  }

  set.status = 200
  return { success: true, data: { problemId }, error: null }
})

const generateBodySchema = z
  .object({
    problemId: z.number().int().min(1).max(TOTAL_PROBLEMS),
  })
  .strict()

problemRoutes.post("/generate", async ({ body, user, set }) => {
  if (!user) {
    set.status = 401
    return { success: false, error: "Unauthorized" }
  }

  const parsed = generateBodySchema.safeParse(body)

  if (!parsed.success) {
    set.status = 400
    return { success: false, error: "Invalid request body" }
  }

  const { problemId } = parsed.data
  const solved = await getSolvedSet(user.id)

  if (!isUnlocked(solved, problemId)) {
    set.status = 403
    return { success: false, error: "Problem is locked" }
  }

  const result = await executeLambda({
    action: "generate",
    payload: { email: user.email, problemId },
  })

  if (!result.success) {
    set.status = 500
    return { success: false, error: result.errorMessage }
  }

  set.status = 200
  return { success: true, data: result.data }
})

const validateBodySchema = z
  .object({
    problemId: z.number().int().min(1).max(TOTAL_PROBLEMS),
    answer: z.unknown(),
  })
  .strict()

problemRoutes.post("/validate", async ({ body, user, set }) => {
  if (!user) {
    set.status = 401
    return { success: false, error: "Unauthorized" }
  }

  const parsed = validateBodySchema.safeParse(body)

  if (!parsed.success) {
    set.status = 400
    return { success: false, error: "Invalid request body" }
  }

  const { problemId, answer } = parsed.data
  const solved = await getSolvedSet(user.id)

  if (!isUnlocked(solved, problemId)) {
    set.status = 403
    return { success: false, error: "Problem is locked" }
  }

  const result = await executeLambda({
    action: "validate",
    payload: { email: user.email, problemId, answer },
  })

  if (!result.success) {
    set.status = 500
    return { success: false, error: result.errorMessage }
  }

  const { error: insertError } = await tryCatch(
    db.insert(submission).values({
      userId: user.id,
      problemId: String(problemId),
      submittedValue: answer as number,
    })
  )

  if (insertError) {
    set.status = 500
    return { success: false, error: "Failed to record submission" }
  }

  set.status = 200
  return { success: true, data: result.data }
})

export { problemRoutes }
