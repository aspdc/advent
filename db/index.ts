import mongoose from "mongoose"
import { env } from "@/lib/env"

declare global {
  var _mongoClient: mongoose.mongo.MongoClient | undefined
  var _mongoosePromise: Promise<typeof mongoose> | undefined
}

const parsedMongoUri = new URL(env.MONGODB_URI)
const dbNameFromUri = parsedMongoUri.pathname.replace("/", "") || undefined

const client =
  global._mongoClient ?? new mongoose.mongo.MongoClient(env.MONGODB_URI)

if (!global._mongoClient) {
  global._mongoClient = client
}

const db = client.db(dbNameFromUri)

export async function connectMongoose() {
  const mongoosePromise =
    global._mongoosePromise ??
    mongoose.connect(env.MONGODB_URI, {
      dbName: dbNameFromUri,
    })

  if (!global._mongoosePromise) {
    global._mongoosePromise = mongoosePromise
  }

  return mongoosePromise
}

export { client, db }
