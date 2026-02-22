import { ObjectId } from "mongodb"
import { getDb } from "@/lib/db"
import { getSessionOrUnauthorized, jsonResponse, errorResponse } from "@/lib/api-utils"
import { updateRoommateSchema } from "@/lib/validations"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ roommateId: string }> }
) {
  const { error } = await getSessionOrUnauthorized()
  if (error) return error

  const { roommateId } = await params
  const body = await request.json()
  const parsed = updateRoommateSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message)
  }

  const db = getDb()
  const updateData: Record<string, any> = { updatedAt: new Date() }
  const unsetData: Record<string, any> = {}

  // Handle phone: empty string means remove phone
  if ("phone" in parsed.data) {
    if (parsed.data.phone === "" || parsed.data.phone === null || parsed.data.phone === undefined) {
      unsetData.phone = ""
    } else {
      updateData.phone = parsed.data.phone
    }
  }
  if (parsed.data.name) updateData.name = parsed.data.name
  if (parsed.data.area) updateData.area = parsed.data.area

  const updateOp: any = { $set: updateData }
  if (Object.keys(unsetData).length > 0) {
    updateOp.$unset = unsetData
  }

  const result = await db.collection("roommates").findOneAndUpdate(
    { _id: new ObjectId(roommateId) },
    updateOp,
    { returnDocument: "after" }
  )

  if (!result) return errorResponse("Roommate not found", 404)
  return jsonResponse(result)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ roommateId: string }> }
) {
  const { error } = await getSessionOrUnauthorized()
  if (error) return error

  const { roommateId } = await params
  const db = getDb()
  const result = await db.collection("roommates").findOneAndUpdate(
    { _id: new ObjectId(roommateId) },
    { $set: { isActive: false, updatedAt: new Date() } },
    { returnDocument: "after" }
  )

  if (!result) return errorResponse("Roommate not found", 404)
  return jsonResponse({ deleted: true })
}
