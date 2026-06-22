import { treaty } from "@elysia/eden"
import { serverEnv } from "@/lib/env"

export const api = treaty(serverEnv.BETTER_AUTH_URL).api
