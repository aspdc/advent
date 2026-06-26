import { Elysia, Context } from "elysia"
import { eq } from "drizzle-orm"

import { auth } from "@/lib/auth"
import { serverEnv } from "@/lib/env"
import { checkAdminLoginRateLimit } from "@/lib/rate-limit"
import { db } from "@/db"
import { user } from "@/db/schema"
import { tryCatch } from "@/lib/try-catch"
import { userRoutes } from "@/routes/user"
import { problemRoutes } from "@/routes/problem"

declare global {
  var _adminSeedPromise: Promise<void> | undefined
}

const BETTER_AUTH_ACCEPT_METHODS = ["GET", "POST"]

async function ensureAdmin() {
  const { data: existing, error: findError } = await tryCatch(
    db.query.user.findFirst({
      where: eq(user.email, serverEnv.ADMIN_EMAIL),
    })
  )

  if (findError) {
    console.error("Failed to query admin user:", findError)
    throw findError
  }

  if (existing) {
    if (existing.role !== "admin") {
      const { error: updateError } = await tryCatch(
        db
          .update(user)
          .set({ role: "admin" })
          .where(eq(user.email, serverEnv.ADMIN_EMAIL))
      )

      if (updateError) {
        console.error("Failed to update admin role:", updateError)
        throw updateError
      }
    }

    return
  }

  const { data: created, error: createError } = await tryCatch(
    auth.api.createUser({
      body: {
        name: "Admin",
        email: serverEnv.ADMIN_EMAIL,
        password: serverEnv.ADMIN_PASSWORD,
        role: "admin",
      },
    })
  )

  if (createError) {
    console.error("Failed to create admin user:", createError)
    throw createError
  }

  if (!created?.user?.id) {
    throw new Error("Failed to create admin user")
  }
}

async function ensureAdminOnce() {
  if (!global._adminSeedPromise) {
    global._adminSeedPromise = ensureAdmin().catch((error) => {
      global._adminSeedPromise = undefined
      throw error
    })
  }

  await global._adminSeedPromise
}

const betterAuthView = async (context: Context) => {
  if (!BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
    return new Response("Method Not Allowed", { status: 405 })
  }

  if (
    context.request.method === "POST" &&
    new URL(context.request.url).pathname.endsWith("/auth/sign-in/email")
  ) {
    const forwardedFor = context.request.headers.get("x-forwarded-for")
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown"

    const { success: limitOk } = await checkAdminLoginRateLimit(ip)

    if (!limitOk) {
      return Response.json(
        { error: "Too many login attempts. Try again in a moment." },
        { status: 429 },
      )
    }
  }

  const { error: seedError } = await tryCatch(ensureAdminOnce())

  if (seedError) {
    console.error("ensureAdminOnce failed:")
    console.error(seedError)
    console.error(seedError.stack)

    return Response.json({ error: seedError.message }, { status: 500 })
  }

  const { data: response, error } = await tryCatch(
    auth.handler(context.request)
  )

  if (error) {
    console.error("Better Auth error:")
    console.error(error)
    console.error(error.stack)

    return Response.json({ error: error.message }, { status: 500 })
  }

  return response
}

async function seedAdmin(context: Context) {
  const secret = context.request.headers.get("x-seed-secret")

  if (secret !== serverEnv.BETTER_AUTH_SECRET) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { error } = await tryCatch(ensureAdmin())

  if (error) {
    console.error("Seed admin failed:")
    console.error(error)
    console.error(error.stack)

    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({
    message: "Admin ensured successfully.",
  })
}

const app = new Elysia({ prefix: "/api" })
  .get("/", () => ({ status: "OK" }))
  .all("/auth/*", betterAuthView)
  .all("/auth", betterAuthView)
  .post("/seed-admin", seedAdmin)
  .use(userRoutes)
  .use(problemRoutes)
  .onError(({ code, error, path, request }) => {
    console.error("Unhandled Elysia error")
    console.error({
      code,
      method: request.method,
      path,
      error,
    })
  })

export const GET = app.fetch
export const POST = app.fetch
export const PUT = app.fetch
export const DELETE = app.fetch
