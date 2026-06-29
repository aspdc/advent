import Elysia from "elysia"
import { z } from "zod"
import { hasRole, isAuthenticated } from "@/lib/middleware/auth"
import { getSolvedSet, isUnlocked } from "@/lib/problems/protect"
import { getActiveProblemIds } from "@/lib/problems/active"
import { TOTAL_PROBLEMS } from "@/types/progress"
import { executeLambda } from "@/lib/lambda"
import { checkRateLimit } from "@/lib/rate-limit"
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

  const activeIds = await getActiveProblemIds()

  if (!activeIds.has(String(problemId))) {
    set.status = 404
    return { success: false, data: null, error: "Problem not found" }
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

  const activeIds = await getActiveProblemIds()

  if (!activeIds.has(String(problemId))) {
    set.status = 404
    return { success: false, error: "Problem not found" }
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

  const generateBody = JSON.parse(result.data.body)

  return {
    success: true,
    data: { ...generateBody, isSolved: solved.has(String(problemId)) },
  }
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

  const activeIds = await getActiveProblemIds()

  if (!activeIds.has(String(problemId))) {
    set.status = 404
    return { success: false, error: "Problem not found" }
  }

  if (solved.has(String(problemId))) {
    set.status = 200
    return { success: true, data: null }
  }

  const { success: limitOk, limit, remaining, reset } = await checkRateLimit(user.email)

  set.headers["X-RateLimit-Limit"] = String(limit)
  set.headers["X-RateLimit-Remaining"] = String(remaining)

  if (!limitOk) {
    set.status = 429
    set.headers["Retry-After"] = String(Math.ceil((reset - Date.now()) / 1000))
    return { success: false, error: "Too many submissions. Try again in a moment." }
  }

  const result = await executeLambda({
    action: "validate",
    payload: { email: user.email, problemId, answer },
  })

  if (!result.success) {
    set.status = 500
    return { success: false, error: result.errorMessage }
  }

  const validateBody = JSON.parse(result.data.body)

  if (validateBody.isCorrect) {
    const { error: insertError } = await tryCatch(
      db
        .insert(submission)
        .values({
          userId: user.id,
          problemId: String(problemId),
          submittedValue: answer as string,
        })
        .onConflictDoNothing(),
    )

    if (insertError) {
      set.status = 500
      return { success: false, error: "Failed to record submission" }
    }
  }

  set.status = 200

  return { success: true, data: validateBody }
})

export { problemRoutes }
