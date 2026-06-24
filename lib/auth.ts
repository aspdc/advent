import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { admin } from "better-auth/plugins"
import { client, db } from "@/db"
import { serverEnv } from "@/lib/env"

export const auth = betterAuth({
  secret: serverEnv.BETTER_AUTH_SECRET,
  baseURL: serverEnv.BETTER_AUTH_URL,
  database: mongodbAdapter(db, { client }),
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