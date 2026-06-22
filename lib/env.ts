import { z } from "zod";

const serverEnvSchema = z.object({
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_SECRET: z.string(),
  MONGODB_URI: z.url(),
  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD: z.string(),
  CLOUDFLARE_TURNSTILE_SECRET: z.string(),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_KEY: z.string(),
});

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_KEY: process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_KEY,
});

export const serverEnv = typeof window === "undefined" 
  ? serverEnvSchema.parse(process.env) 
  : {} as z.infer<typeof serverEnvSchema>; 