import { protectProblem } from "@/lib/protect-problem"

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
    <div className="flex flex-1 flex-col gap-4 py-10">
      <h1 className="font-mono text-xl font-semibold tracking-wide text-foreground">
        Problem {problemId}
      </h1>
      <p className="text-sm text-muted-foreground">
        Signed in as{" "}
        <span className="font-mono text-primary">
          {session.user.name || session.user.email}
        </span>
      </p>
    </div>
  )
}
