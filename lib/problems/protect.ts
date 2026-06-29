import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { db } from "@/db"
import { submission } from "@/db/schema"
import { eq } from "drizzle-orm"
import { TOTAL_PROBLEMS } from "@/types/progress"
import { getActiveProblemIds } from "@/lib/problems/active"

export async function getSolvedSet(userId: string): Promise<Set<string>> {
  const result = await db
    .select({ problemId: submission.problemId })
    .from(submission)
    .where(eq(submission.userId, userId))

  return new Set(result.map((s) => s.problemId).filter((id): id is string => id !== null))
}

export function isUnlocked(
  solved: Set<string>,
  problemId: number
): boolean {
  if (problemId < 1 || problemId > TOTAL_PROBLEMS) return false
  if (solved.has(String(problemId))) return true
  if (problemId === 1) return true
  if (solved.has(String(problemId - 1))) return true
  return false
}

export async function protectProblem(problemId: number) {
  if (problemId < 1 || problemId > TOTAL_PROBLEMS) {
    notFound()
  }

  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/login")
  }

  const solved = await getSolvedSet(session.user.id)

  if (!isUnlocked(solved, problemId)) {
    redirect("/dashboard")
  }

  const activeIds = await getActiveProblemIds()

  if (!activeIds.has(String(problemId))) {
    redirect("/dashboard")
  }

  return session
}
