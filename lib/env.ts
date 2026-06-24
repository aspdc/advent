import { z } from "zod"

const serverEnvSchema = z.object({
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_SECRET: z.string(),
  DATABASE_URL: z.url(),
  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD: z.string(),
  CLOUDFLARE_TURNSTILE_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  IAM_ACCESS_KEY_ID: z.string(),
  IAM_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string().default("us-east-1"),
  LAMBDA_NAME: z.string(),
})

const clientEnvSchema = z.object({
  NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_KEY: z.string(),
})

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_KEY:
    process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_KEY,
})

export const serverEnv =
  typeof window === "undefined"
    ? serverEnvSchema.parse(process.env)
    : ({} as z.infer<typeof serverEnvSchema>)
