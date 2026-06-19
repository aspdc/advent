import { env } from "@/lib/env"
import { MongoClient } from "mongodb"

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

const uri = env.MONGODB_URI
const options = {}

const client: MongoClient = new MongoClient(uri, options)
const clientPromise: Promise<MongoClient> = client.connect()

export { clientPromise,client }
