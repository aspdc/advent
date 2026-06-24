import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins"
import { db } from "@/db"
import * as schema from "@/db/schema"
import { serverEnv } from "@/lib/env"

export const auth = betterAuth({
  secret: serverEnv.BETTER_AUTH_SECRET,
  baseURL: serverEnv.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  user: {
    additionalFields: {
      lastSolvedProblemId: {
        type: "number",
        defaultValue: null,
        input: false,
      },
      solvedProblems: {
        type: "json",
        defaultValue: {
          totalSolved: 0,
          solved: []
        },
        input: false
      },
      score: {
        type: "number",
        defaultValue: 0,
        input: false
      }
    }
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
      disableSignUp: false
    }
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  plugins: [admin()],
})

export type authType = typeof auth