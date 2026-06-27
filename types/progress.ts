export interface ProgressItem {
  id: number
  problemId: string | null
  userId: string
  submittedValue: string
  submittedAt: Date | null
}

export const TOTAL_PROBLEMS = 15

export type ProblemStatus = "locked" | "unlocked" | "solved"
