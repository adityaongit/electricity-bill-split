import { MongoClient, type Db } from "mongodb"

const globalForMongo = globalThis as typeof globalThis & {
  _mongoClient?: MongoClient
}

export function getDb(): Db {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set")
  }

  if (!globalForMongo._mongoClient) {
    globalForMongo._mongoClient = new MongoClient(process.env.MONGODB_URI)
  }

  return globalForMongo._mongoClient.db("elec-bill")
}
