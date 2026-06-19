import { Elysia, Context } from "elysia"
import { auth } from "@/lib/auth"

const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"]

const betterAuthView = (context: Context) => {
  if (!BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
    return new Response("Method Not Allowed", { status: 405 })
  }

  return auth.handler(context.request)
}

const app = new Elysia({ prefix: "/api" })
  .get("/", { status: "OK" })
  .all("/auth/*", betterAuthView)
  .all("/auth", betterAuthView)

export const GET = app.fetch
export const POST = app.fetch
export const PUT = app.fetch
export const DELETE = app.fetch
