import { createAuthClient } from "better-auth/react"
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins"
import { authType } from "@/lib/auth"
import { serverEnv } from "@/lib/env"

export const authClient = createAuthClient({
  baseURL: serverEnv.BETTER_AUTH_URL,
  plugins: [adminClient(), inferAdditionalFields<authType>()],
})

export const { signIn, signOut, useSession } = authClient
