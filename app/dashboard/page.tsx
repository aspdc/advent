import { Progress } from "@/components/dashboard/progress"
import { protectRoute } from "@/lib/protect-route"
import { db } from "@/db"
import { submission } from "@/db/schema"
import { eq } from "drizzle-orm"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await protectRoute()

  const submissions = await db
    .select()
    .from(submission)
    .where(eq(submission.userId, session.user.id))

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
        <Progress progress={submissions} />
      </div>
    </div>
  )
}
