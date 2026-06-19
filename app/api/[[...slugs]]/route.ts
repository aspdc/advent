import { Elysia, Context } from "elysia"
import { auth } from "@/lib/auth"
import { env } from "@/lib/env"
import { client } from "@/db"
import { tryCatch } from "@/lib/try-catch"

const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"]

const betterAuthView = (context: Context) => {
  if (!BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
    return new Response("Method Not Allowed", { status: 405 })
  }

  return auth.handler(context.request)
}

async function seedAdmin(context: Context) {
  const secret = context.request.headers.get("x-seed-secret")
  if (secret !== env.BETTER_AUTH_SECRET) {
    return new Response("Unauthorized", { status: 401 })
  }

  const db = client.db()
  const users = db.collection("user")

  const { data: existing, error: findError } = await tryCatch(
    users.findOne({ email: env.ADMIN_EMAIL })
  )

  if (findError) {
    return Response.json({ error: findError.message }, { status: 500 })
  }

  if (existing) {
    if (existing.role !== "admin") {
      const { error: updateError } = await tryCatch(
        users.updateOne({ email: env.ADMIN_EMAIL }, { $set: { role: "admin" } })
      )
      if (updateError) {
        return Response.json({ error: updateError.message }, { status: 500 })
      }
    }
    return Response.json({ message: "Admin already exists — role ensured." })
  }

  const { data: created, error: createError } = await tryCatch(
    auth.api.signUpEmail({
      body: {
        name: "Admin",
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
      },
    })
  )

  if (createError) {
    return Response.json({ error: createError.message }, { status: 500 })
  }

  if (!created?.user?.id) {
    return Response.json({ error: "Failed to create admin user" }, { status: 500 })
  }

  const { error: promoteError } = await tryCatch(
    users.updateOne({ email: env.ADMIN_EMAIL }, { $set: { role: "admin" } })
  )

  if (promoteError) {
    return Response.json({ error: promoteError.message }, { status: 500 })
  }

  return Response.json({ message: "Admin seeded successfully." })
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
