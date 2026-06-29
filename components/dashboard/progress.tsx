import Link from "next/link"
import type { ProgressItem } from "@/types/progress"
import { getProblemStatus, buildSolvedSet } from "@/lib/problems"
import { getActiveProblemIds } from "@/lib/problems/active"

interface ProgressProps {
  progress?: ProgressItem[]
}

export async function Progress({ progress = [] }: ProgressProps) {
  const solved = buildSolvedSet(progress)
  const activeIds = await getActiveProblemIds()
  const activeCount = activeIds.size
  const solvedActiveCount = [...solved].filter((id) => activeIds.has(id)).length

  const activeProblems = [...activeIds]
    .map(Number)
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b)

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Solved {solvedActiveCount} of {activeCount} problems
      </p>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
        {activeProblems.map((problemNumber) => {
          const id = String(problemNumber)
          const status = getProblemStatus(solved, problemNumber)
          const item = progress.find((p) => p.problemId === id)

          if (status === "locked") {
            return (
              <div
                key={id}
                className="flex aspect-square cursor-not-allowed items-center justify-center rounded-lg border border-border font-mono text-sm text-muted-foreground opacity-40"
              >
                {id}
              </div>
            )
          }

          if (status === "solved") {
            return (
              <Link
                key={id}
                href={`/problem/${id}`}
                className="flex aspect-square items-center justify-center rounded-lg border border-primary bg-primary/10 font-mono text-sm text-primary transition-colors hover:bg-primary/20"
              >
                <span className="flex flex-col items-center text-xs leading-tight">
                  <span>Solved</span>
                  <span>{item?.submittedValue}</span>
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={id}
              href={`/problem/${id}`}
              className="flex aspect-square items-center justify-center rounded-lg border border-muted font-mono text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {id}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
