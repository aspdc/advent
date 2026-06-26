import { Progress } from "@/components/dashboard/progress"
import type { ProgressItem } from "@/types/progress"
import { protectRoute } from "@/lib/protect-route"
import { tryCatch } from "@/lib/try-catch"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await protectRoute()
  const progressResponse = await tryCatch<ProgressItem[]>(
    fetch("/api/user/progress")
      .then((res) => res.json())
      .then((res) => res.data)
  )

  return (
    <div className="flex flex-1 flex-col gap-2 py-10">
      <p className="">
        Hi,{" "}
        <span className="font-mono text-primary">
          {session.user.name || session.user.email}
        </span>{" "}
        .&nbsp; Continue solving the Advent and keep an eye on the{" "}
        <Link href="/leaderboard" className="text-primary hover:underline">
          leaderboard
        </Link>{" "}
        to see how you rank against other participants!
      </p>
      <div className="mt-4">
        <Progress progress={progressResponse.data ?? []} />
      </div>
    </div>
  )
}
