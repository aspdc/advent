import { protectRoute } from "@/lib/protect-route"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const session = await protectRoute("admin")

  return (
    <div className="flex-1 flex flex-col gap-2 py-10">
      <h1 className="font-mono text-xl font-semibold text-foreground m-0 tracking-wide">
        Admin Dashboard
      </h1>
      <p className="text-sm text-muted-foreground m-0">
        Signed in as <span className="font-mono text-primary">{session.user.name || session.user.email}</span>
      </p>
    </div>
  )
}
