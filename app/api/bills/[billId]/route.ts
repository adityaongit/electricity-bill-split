import { ObjectId } from "mongodb"
import { getDb } from "@/lib/db"
import { getSessionOrUnauthorized, jsonResponse, errorResponse } from "@/lib/api-utils"
import { calculateBill } from "@/lib/bill-calculator"
import { updateBillSchema } from "@/lib/validations"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ billId: string }> }
) {
  const { error } = await getSessionOrUnauthorized()
  if (error) return error

  const { billId } = await params
  const db = getDb()

  const bill = await db.collection("bills").findOne({ _id: new ObjectId(billId) })
  if (!bill) return errorResponse("Bill not found", 404)

  const splits = await db.collection("bill_splits").find({ billId: new ObjectId(billId) }).toArray()

  return jsonResponse({ ...bill, splits })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ billId: string }> }
) {
  const { session, error } = await getSessionOrUnauthorized()
  if (error) return error

  const { billId } = await params
  const db = getDb()

  const bill = await db.collection("bills").findOne({ _id: new ObjectId(billId) })
  if (!bill) return errorResponse("Bill not found", 404)

  const flat = await db.collection("flats").findOne({ _id: new ObjectId(bill.flatId), ownerId: session.user.id })
  if (!flat) return errorResponse("Unauthorized", 403)

  const body = await request.json()
  const parsed = updateBillSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.message, 400)

  const input = parsed.data
  const result = calculateBill({
    totalBill: input.totalBill,
    totalUnits: input.totalUnits,
    submeterReadings: input.submeterReadings,
    roommates: input.roommates,
  })

  const now = new Date()

  await db.collection("bills").updateOne(
    { _id: new ObjectId(billId) },
    {
      $set: {
        billingPeriod: input.billingPeriod,
        totalBill: input.totalBill,
        totalUnits: input.totalUnits,
        submeterReadings: input.submeterReadings,
        computed: result.computed,
        updatedAt: now,
      },
    }
  )

  await db.collection("bill_splits").deleteMany({ billId: new ObjectId(billId) })

  if (result.splits.length > 0) {
    await db.collection("bill_splits").insertMany(
      result.splits.map((s) => ({
        billId: new ObjectId(billId),
        roommateId: s.roommateId,
        roommateName: s.roommateName,
        area: s.area,
        daysStayed: s.daysStayed,
        areaSharePercent: s.areaSharePercent,
        areaCost: s.areaCost,
        commonCost: s.commonCost,
        totalAmount: s.totalAmount,
        createdAt: now,
      }))
    )
  }

  return jsonResponse({ updated: true })
}

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
