import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { admin } from "better-auth/plugins"
import { client } from "@/db"
import { env } from "@/lib/env"

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: mongodbAdapter(client.db(), { client }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  plugins: [admin()],
})
