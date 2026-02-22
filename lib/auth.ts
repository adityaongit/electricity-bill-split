import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { MongoClient } from "mongodb"

const globalForMongo = globalThis as typeof globalThis & {
  _authMongoClient?: MongoClient
}

function getAuthDb() {
  if (!globalForMongo._authMongoClient) {
    globalForMongo._authMongoClient = new MongoClient(process.env.MONGODB_URI!)
  }
  return globalForMongo._authMongoClient.db("elec-bill")
}

let _auth: ReturnType<typeof betterAuth> | null = null

export function getAuth() {
  if (!_auth) {
    _auth = betterAuth({
      database: mongodbAdapter(getAuthDb()),
      emailAndPassword: {
        enabled: true,
      },
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      },
    })
  }
  return _auth
}
