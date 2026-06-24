import { createAuthClient } from "better-auth/react"
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins"
import { authType } from "@/lib/auth"

export const authClient = createAuthClient({
  plugins: [adminClient(), inferAdditionalFields<authType>()],
})

export const { signIn, signOut, useSession } = authClient
