import type { ProblemStatus } from "@/types/progress"
import { TOTAL_PROBLEMS } from "@/types/progress"
import type { ProgressItem } from "@/types/progress"

export function getProblemStatus(
  solvedProblemIds: Set<string>,
  problemId: number
): ProblemStatus {
  if (problemId < 1 || problemId > TOTAL_PROBLEMS) return "locked"
  if (solvedProblemIds.has(String(problemId))) return "solved"
  if (problemId === 1) return "unlocked"
  if (solvedProblemIds.has(String(problemId - 1))) return "unlocked"
  return "locked"
}

export function isProblemAccessible(
  solvedProblemIds: Set<string>,
  problemId: number
): boolean {
  return getProblemStatus(solvedProblemIds, problemId) !== "locked"
}

export function getNextUnsolved(
  solvedProblemIds: Set<string>
): number | null {
  for (let i = 1; i <= TOTAL_PROBLEMS; i++) {
    if (!solvedProblemIds.has(String(i))) return i
  }
  return null
}

export function buildSolvedSet(progress: ProgressItem[]): Set<string> {
  const solved = new Set<string>()
  for (const item of progress) {
    if (item.problemId) solved.add(item.problemId)
  }
  return solved
}
