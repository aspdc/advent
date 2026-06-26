import { z } from "zod"

const serverEnvSchema = z.object({
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_SECRET: z.string(),
  DATABASE_URL: z.url(),
  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  IAM_ACCESS_KEY_ID: z.string(),
  IAM_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string().default("us-east-1"),
  LAMBDA_NAME: z.string(),
  UPSTASH_REDIS_REST_URL: z.string(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),
})

export const clientEnv = {} as const

export const serverEnv =
  typeof window === "undefined"
    ? serverEnvSchema.parse(process.env)
    : ({} as z.infer<typeof serverEnvSchema>)
