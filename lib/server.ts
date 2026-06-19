import { treaty } from "@elysia/eden"
import { env } from "@/lib/env"

export const api = treaty(env.BETTER_AUTH_URL).api
