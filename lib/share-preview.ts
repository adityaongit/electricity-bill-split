import { ObjectId } from "mongodb"
import { getDb } from "@/lib/db"

export interface SharePreviewData {
  shareId: string
  totalBill: number
  totalUnits: number
  roommateCount: number
  billingPeriod: {
    from: string
    to: string
  }
}

export async function getSharePreviewData(shareId: string): Promise<SharePreviewData | null> {
  const db = getDb()

  const token = await db.collection("share_tokens").findOne({ shareId })
  if (!token || new Date(token.expiresAt) < new Date()) {
    return null
  }

  const bill = await db.collection("bills").findOne({ _id: new ObjectId(token.billId) })
  if (!bill) {
    return null
  }

  const roommateCount = await db.collection("bill_splits").countDocuments({
    billId: new ObjectId(token.billId),
  })

  return {
    shareId: token.shareId,
    totalBill: bill.totalBill,
    totalUnits: bill.totalUnits,
    roommateCount,
    billingPeriod: {
      from: bill.billingPeriod.from,
      to: bill.billingPeriod.to,
    },
  }
}
