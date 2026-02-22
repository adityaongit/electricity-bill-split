import { getDb } from "@/lib/db"
import { getSessionOrUnauthorized, jsonResponse, errorResponse } from "@/lib/api-utils"
import { createFlatSchema } from "@/lib/validations"

export async function GET() {
  const { session, error } = await getSessionOrUnauthorized()
  if (error) return error

  const db = getDb()
  const flats = await db
    .collection("flats")
    .find({ ownerId: session.user.id })
    .sort({ createdAt: -1 })
    .toArray()

  return jsonResponse(flats)
}

export async function POST(request: Request) {
  const { session, error } = await getSessionOrUnauthorized()
  if (error) return error

  const body = await request.json()
  const parsed = createFlatSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message)
  }

  const db = getDb()
  const now = new Date()
  const result = await db.collection("flats").insertOne({
    ownerId: session.user.id,
    name: parsed.data.name,
    areas: parsed.data.areas,
    createdAt: now,
    updatedAt: now,
  })

  return jsonResponse({ _id: result.insertedId, ...parsed.data }, 201)
}
