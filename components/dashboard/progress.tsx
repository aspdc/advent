import Link from "next/link"
import type { ProgressItem } from "@/types/progress"
import { TOTAL_PROBLEMS } from "@/types/progress"
import { getProblemStatus, buildSolvedSet } from "@/lib/problems"

interface ProgressProps {
  progress?: ProgressItem[]
}

export function Progress({ progress = [] }: ProgressProps) {
  const solved = buildSolvedSet(progress)
  const solvedCount = solved.size

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Solved {solvedCount} of {TOTAL_PROBLEMS} problems
      </p>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
        {Array.from({ length: TOTAL_PROBLEMS }, (_, i) => {
          const id = String(i + 1)
          const status = getProblemStatus(solved, i + 1)
          const item = progress.find((p) => p.problemId === id)

          if (status === "locked") {
            return (
              <div
                key={id}
                className="flex aspect-square cursor-not-allowed items-center justify-center rounded-lg border border-border text-sm font-mono text-muted-foreground opacity-40"
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
                className="flex aspect-square items-center justify-center rounded-lg border border-primary bg-primary/10 text-sm font-mono text-primary transition-colors hover:bg-primary/20"
              >
                <span className="flex flex-col items-center leading-tight">
                  <span>✓</span>
                  <span className="text-xs">{item?.submittedValue}</span>
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={id}
              href={`/problem/${id}`}
              className="flex aspect-square items-center justify-center rounded-lg border border-muted text-sm font-mono text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {id}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
