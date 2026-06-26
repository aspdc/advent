import type { ProgressItem } from "@/types/progress"

interface ProgressProps {
  progress?: ProgressItem[]
}

export function Progress({ progress = [] }: ProgressProps) {
  const solved = new Map<string, ProgressItem>()
  for (const item of progress) {
    if (item.problemId && !solved.has(item.problemId)) {
      solved.set(item.problemId, item)
    }
  }

  if (progress.length === 0) {
    return (
      <p className="text-muted-foreground">
        You {"haven't"} made any progress yet. Start solving problems to see
        your progress here!
      </p>
    )
  }

  const total = 15
  const solvedCount = solved.size

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Solved {solvedCount} of {total} problems
      </p>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
        {Array.from({ length: total }, (_, i) => {
          const id = String(i + 1)
          const isSolved = solved.has(id)
          const item = solved.get(id)

          return (
            <div
              key={id}
              className={`flex aspect-square items-center justify-center rounded-lg border text-sm font-mono transition-colors ${
                isSolved
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-muted text-muted-foreground"
              }`}
            >
              {isSolved ? (
                <span className="flex flex-col items-center leading-tight">
                  <span>✓</span>
                  <span className="text-xs">{item?.submittedValue}</span>
                </span>
              ) : (
                id
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
