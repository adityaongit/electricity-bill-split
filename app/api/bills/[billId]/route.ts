import { ObjectId } from "mongodb"
import { getDb } from "@/lib/db"
import { getSessionOrUnauthorized, jsonResponse, errorResponse } from "@/lib/api-utils"

export const dynamic = "force-dynamic"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ billId: string }> }
) {
  const { session, error } = await getSessionOrUnauthorized()
  if (error) return error

  const { billId } = await params
  const db = getDb()

  // Check if bill exists and belongs to user's flat
  const bill = await db.collection("bills").findOne({ _id: new ObjectId(billId) })
  if (!bill) return errorResponse("Bill not found", 404)

  // Verify user owns this flat
  const flat = await db.collection("flats").findOne({ _id: new ObjectId(bill.flatId), ownerId: session.user.id })
  if (!flat) return errorResponse("Unauthorized", 403)

  // Delete bill splits first
  await db.collection("bill_splits").deleteMany({ billId: new ObjectId(billId) })

  // Delete bill
  await db.collection("bills").deleteOne({ _id: new ObjectId(billId) })

  return jsonResponse({ deleted: true })
}
