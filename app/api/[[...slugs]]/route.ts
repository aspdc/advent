import { Elysia, Context } from "elysia"
import { auth } from "@/lib/auth"
import { env } from "@/lib/env"
import { db } from "@/db"
import { tryCatch } from "@/lib/try-catch"

declare global {
  var _adminSeedPromise: Promise<void> | undefined
}

const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"]

async function ensureAdmin() {
  const users = db.collection("user")

  const { data: existing, error: findError } = await tryCatch(
    users.findOne({ email: env.ADMIN_EMAIL })
  )

  if (findError) {
    throw findError
  }

  if (existing) {
    if (existing.role !== "admin") {
      const { error: updateError } = await tryCatch(
        users.updateOne({ email: env.ADMIN_EMAIL }, { $set: { role: "admin" } })
      )

      if (updateError) {
        throw updateError
      }
    }

    return
  }

  const { data: created, error: createError } = await tryCatch(
    auth.api.createUser({
      body: {
        name: "Admin",
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
        role: "admin",
      },
    })
  )

  if (createError) {
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

  const { error: seedError } = await tryCatch(ensureAdminOnce())
  if (seedError) {
    return Response.json({ error: seedError.message }, { status: 500 })
  }

  return auth.handler(context.request)
}

async function seedAdmin(context: Context) {
  const secret = context.request.headers.get("x-seed-secret")
  if (secret !== env.BETTER_AUTH_SECRET) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { error } = await tryCatch(ensureAdmin())

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ message: "Admin ensured successfully." })
}

const app = new Elysia({ prefix: "/api" })
  .get("/", { status: "OK" })
  .all("/auth/*", betterAuthView)
  .all("/auth", betterAuthView)
  .post("/seed-admin", seedAdmin)

export const GET = app.fetch
export const POST = app.fetch
export const PUT = app.fetch
export const DELETE = app.fetch
