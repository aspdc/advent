import z from "zod"

export const envSchema = z.object({
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_SECRET: z.string(),
  MONGODB_URI: z.url(),
})

export const env = envSchema.parse(process.env)
