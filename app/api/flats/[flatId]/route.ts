import { ObjectId } from "mongodb"
import { getDb } from "@/lib/db"
import { getSessionOrUnauthorized, jsonResponse, errorResponse } from "@/lib/api-utils"
import { updateFlatSchema } from "@/lib/validations"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ flatId: string }> }
) {
  const { session, error } = await getSessionOrUnauthorized()
  if (error) return error

  const { flatId } = await params
  const db = getDb()
  const flat = await db.collection("flats").findOne({
    _id: new ObjectId(flatId),
    ownerId: session.user.id,
  })

  if (!flat) return errorResponse("Flat not found", 404)
  return jsonResponse(flat)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ flatId: string }> }
) {
  const { session, error } = await getSessionOrUnauthorized()
  if (error) return error

  const { flatId } = await params
  const body = await request.json()
  const parsed = updateFlatSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message)
  }

  const db = getDb()
  const result = await db.collection("flats").findOneAndUpdate(
    { _id: new ObjectId(flatId), ownerId: session.user.id },
    { $set: { ...parsed.data, updatedAt: new Date() } },
    { returnDocument: "after" }
  )

  if (!result) return errorResponse("Flat not found", 404)
  return jsonResponse(result)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ flatId: string }> }
) {
  const { session, error } = await getSessionOrUnauthorized()
  if (error) return error

  const { flatId } = await params
  const db = getDb()
  const result = await db.collection("flats").deleteOne({
    _id: new ObjectId(flatId),
    ownerId: session.user.id,
  })

  if (result.deletedCount === 0) return errorResponse("Flat not found", 404)
  return jsonResponse({ deleted: true })
}
