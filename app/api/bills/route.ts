import { ObjectId } from "mongodb"
import { getDb } from "@/lib/db"
import { getSessionOrUnauthorized, jsonResponse, errorResponse } from "@/lib/api-utils"
import { createBillSchema } from "@/lib/validations"
import { calculateBill } from "@/lib/bill-calculator"
import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { error } = await getSessionOrUnauthorized()
  if (error) return error

  const flatId = request.nextUrl.searchParams.get("flatId")
  if (!flatId) return errorResponse("flatId is required")

  const page = parseInt(request.nextUrl.searchParams.get("page") ?? "1")
  const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "10")
  const skip = (page - 1) * limit

  const db = getDb()
  const [bills, total] = await Promise.all([
    db
      .collection("bills")
      .find({ flatId: new ObjectId(flatId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection("bills").countDocuments({ flatId: new ObjectId(flatId) }),
  ])

  return jsonResponse({
    bills,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}

export async function POST(request: Request) {
  const { session, error } = await getSessionOrUnauthorized()
  if (error) return error

  const body = await request.json()
  const parsed = createBillSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message)
  }

  const { roommates: roommateInputs, ...billData } = parsed.data

  const result = calculateBill({
    totalBill: billData.totalBill,
    totalUnits: billData.totalUnits,
    submeterReadings: billData.submeterReadings,
    roommates: roommateInputs,
  })

  const db = getDb()
  const now = new Date()

  const billDoc = {
    flatId: new ObjectId(billData.flatId),
    createdBy: session.user.id,
    billingPeriod: {
      from: new Date(billData.billingPeriod.from),
      to: new Date(billData.billingPeriod.to),
    },
    totalBill: billData.totalBill,
    totalUnits: billData.totalUnits,
    submeterReadings: billData.submeterReadings,
    computed: result.computed,
    status: billData.status,
    createdAt: now,
    updatedAt: now,
  }

  const insertResult = await db.collection("bills").insertOne(billDoc)
  const billId = insertResult.insertedId

  const splitDocs = result.splits.map((split) => ({
    billId,
    roommateId: new ObjectId(split.roommateId),
    roommateName: split.roommateName,
    area: split.area,
    daysStayed: split.daysStayed,
    areaSharePercent: split.areaSharePercent,
    areaCost: split.areaCost,
    commonCost: split.commonCost,
    totalAmount: split.totalAmount,
    createdAt: now,
  }))

  if (splitDocs.length > 0) {
    await db.collection("bill_splits").insertMany(splitDocs)
  }

  return jsonResponse({ _id: billId, ...billDoc, splits: result.splits }, 201)
}
