export interface ProgressItem {
  id: number
  problemId: string | null
  userId: string
  submittedValue: number
  submittedAt: Date | null
}