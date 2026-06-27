import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { serverEnv } from "@/lib/env"

const redis = new Redis({
  url: serverEnv.UPSTASH_REDIS_REST_URL,
  token: serverEnv.UPSTASH_REDIS_REST_TOKEN,
})

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.tokenBucket(3, "1 m", 5),
  analytics: true,
  prefix: "ratelimit:validate",
})

export async function checkRateLimit(identifier: string) {
  return ratelimit.limit(identifier)
}

const adminLoginRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  prefix: "ratelimit:admin-login",
})

export async function checkAdminLoginRateLimit(identifier: string) {
  return adminLoginRatelimit.limit(identifier)
}
