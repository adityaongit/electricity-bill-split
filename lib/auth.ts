import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { MongoClient } from "mongodb"

const globalForMongo = globalThis as typeof globalThis & {
  _authMongoClient?: MongoClient
}

function getAuthDb() {
  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is not set")
  }
  if (!globalForMongo._authMongoClient) {
    globalForMongo._authMongoClient = new MongoClient(mongoUri)
  }
  return globalForMongo._authMongoClient.db("elec-bill")
}

let _auth: ReturnType<typeof betterAuth> | null = null

export function getAuth() {
  if (_auth) {
    return _auth
  }

  // Ensure we have all required env vars before initializing
  const mongoUri = process.env.MONGODB_URI
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!mongoUri || !googleClientId || !googleClientSecret) {
    throw new Error("Missing required environment variables for auth initialization")
  }

  _auth = betterAuth({
    database: mongodbAdapter(getAuthDb()),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      },
    },
  })

  return _auth
}
