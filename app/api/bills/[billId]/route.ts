import { ObjectId } from "mongodb"
import { getDb } from "@/lib/db"
import { getSessionOrUnauthorized, jsonResponse, errorResponse } from "@/lib/api-utils"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ billId: string }> }
) {
  const { error } = await getSessionOrUnauthorized()
  if (error) return error

  const { billId } = await params
  const db = getDb()

  const [bill, splits] = await Promise.all([
    db.collection("bills").findOne({ _id: new ObjectId(billId) }),
    db
      .collection("bill_splits")
      .find({ billId: new ObjectId(billId) })
      .toArray(),
  ])

  if (!bill) return errorResponse("Bill not found", 404)

  return jsonResponse({ ...bill, splits })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ billId: string }> }
) {
  const { error } = await getSessionOrUnauthorized()
  if (error) return error

  const { billId } = await params
  const db = getDb()

  const [billResult] = await Promise.all([
    db.collection("bills").deleteOne({ _id: new ObjectId(billId) }),
    db.collection("bill_splits").deleteMany({ billId: new ObjectId(billId) }),
  ])

  if (billResult.deletedCount === 0) return errorResponse("Bill not found", 404)
  return jsonResponse({ deleted: true })
}
