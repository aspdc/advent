import { protectRoute } from "@/lib/protect-route"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await protectRoute()

  return (
    <div className="flex flex-1 flex-col gap-2 py-10">
      <h1 className="m-0 font-mono text-xl font-semibold tracking-wide text-foreground">
        Dashboard
      </h1>
      <p className="m-0 text-sm text-muted-foreground">
        Signed in as{" "}
        <span className="font-mono text-primary">
          {session.user.name || session.user.email}
        </span>
      </p>
    </div>
  )
}
