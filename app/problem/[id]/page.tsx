import { protectProblem } from "@/lib/problems/protect"
import { ProblemView } from "@/components/problem/problem-view"

export const dynamic = "force-dynamic"

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const problemId = Number(id)
  const session = await protectProblem(problemId)

  return (
    <div className="flex flex-1 flex-col gap-8 py-16">
      <div className="flex items-baseline gap-3">
        <h1 className="font-mono text-3xl font-semibold tracking-wide text-foreground">
          Problem {problemId}
        </h1>
        <span className="text-sm text-muted-foreground/70 font-mono">
          {session.user.name}
        </span>
      </div>
      <ProblemView problemId={problemId} />
    </div>
  )
}
