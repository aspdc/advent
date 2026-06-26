import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { db } from "@/db"
import { submission } from "@/db/schema"
import { eq } from "drizzle-orm"
import { TOTAL_PROBLEMS } from "@/types/progress"

export async function protectProblem(problemId: number) {
  if (problemId < 1 || problemId > TOTAL_PROBLEMS) {
    notFound()
  }

  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/login")
  }

  if (problemId === 1) return session

  const result = await db
    .select({ problemId: submission.problemId })
    .from(submission)
    .where(eq(submission.userId, session.user.id))

  const solvedIds = new Set(result.map((s) => s.problemId))

  if (!solvedIds.has(String(problemId - 1))) {
    redirect("/dashboard")
  }

  return session
}
