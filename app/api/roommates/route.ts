import { ObjectId } from "mongodb"
import { getDb } from "@/lib/db"
import { getSessionOrUnauthorized, jsonResponse, errorResponse } from "@/lib/api-utils"
import { createRoommateSchema } from "@/lib/validations"
import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { error } = await getSessionOrUnauthorized()
  if (error) return error

  const flatId = request.nextUrl.searchParams.get("flatId")
  if (!flatId) return errorResponse("flatId is required")

  const db = getDb()
  const roommates = await db
    .collection("roommates")
    .find({ flatId: new ObjectId(flatId), isActive: true })
    .sort({ createdAt: 1 })
    .toArray()

  return jsonResponse(roommates)
}

export async function POST(request: Request) {
  const { error } = await getSessionOrUnauthorized()
  if (error) return error

  const body = await request.json()
  const parsed = createRoommateSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message)
  }

  const db = getDb()
  const now = new Date()
  const result = await db.collection("roommates").insertOne({
    flatId: new ObjectId(parsed.data.flatId),
    name: parsed.data.name,
    area: parsed.data.area,
    ...(parsed.data.phone && { phone: parsed.data.phone }),
    isActive: true,
    createdAt: now,
    updatedAt: now,
  })

  return jsonResponse({ _id: result.insertedId, ...parsed.data }, 201)
}
