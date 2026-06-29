export interface ProblemData {
  before?: string
  statement: string
  example?: string
  after?: string
  isSolved?: boolean
  nextProblemId?: number | null
}

export interface ValidateData {
  isCorrect?: boolean
  nextProblemId?: number | null
}
