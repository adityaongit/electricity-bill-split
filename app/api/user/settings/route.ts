import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { getSessionOrUnauthorized, errorResponse, jsonResponse } from "@/lib/api-utils"
import { DEFAULT_CURRENCY } from "@/lib/currency"

export async function GET() {
  const { session, error } = await getSessionOrUnauthorized()
  if (error) return error

  const db = getDb()
  const settings = await db.collection("user_settings").findOne({
    userId: session.user.id,
  })

  const currency = settings?.currency ?? DEFAULT_CURRENCY

  return jsonResponse({ currency })
}

export async function PATCH(req: Request) {
  const { session, error } = await getSessionOrUnauthorized()
  if (error) return error

  const body = await req.json()
  const { currency } = body

  if (!currency) {
    return errorResponse("Currency is required")
  }

  const db = getDb()
  await db.collection("user_settings").updateOne(
    { userId: session.user.id },
    {
      $set: {
        userId: session.user.id,
        currency,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  )

  return jsonResponse({ currency })
}
