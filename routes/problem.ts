import Elysia from "elysia"
import { hasRole, isAuthenticated } from "@/lib/middleware/auth"
import { getSolvedSet, isUnlocked } from "@/lib/problems/protect"
import { TOTAL_PROBLEMS } from "@/types/progress"

const problemRoutes = new Elysia({ prefix: "/problem" })
  .use(isAuthenticated)
  .use(hasRole(["user", "admin"]))

problemRoutes.get("/:id", async ({ params: { id }, user, set }) => {
  if (!user) {
    set.status = 401
    return { success: false, data: null, error: "Unauthorized" }
  }

  const problemId = Number(id)

  if (problemId < 1 || problemId > TOTAL_PROBLEMS) {
    set.status = 404
    return { success: false, data: null, error: "Problem not found" }
  }

  const solved = await getSolvedSet(user.id)

  if (!isUnlocked(solved, problemId)) {
    set.status = 403
    return { success: false, data: null, error: "Problem is locked" }
  }

  set.status = 200
  return { success: true, data: { problemId }, error: null }
})

export { problemRoutes }
