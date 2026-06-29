import { db } from "@/db"
import { problem } from "@/db/schema"
import { eq } from "drizzle-orm"
import { tryCatch } from "@/lib/try-catch"

export async function getActiveProblemIds(): Promise<Set<string>> {
  const { data, error } = await tryCatch(
    db
      .select({ id: problem.id })
      .from(problem)
      .where(eq(problem.isActive, true)),
  )

  if (error || !data) return new Set()
  return new Set(data.map((p) => p.id))
}

export async function getActiveProblemCount(): Promise<number> {
  const ids = await getActiveProblemIds()
  return ids.size
}
