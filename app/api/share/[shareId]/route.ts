import { ObjectId } from "mongodb"
import { getDb } from "@/lib/db"
import { getSessionOrUnauthorized, jsonResponse, errorResponse } from "@/lib/api-utils"
import { trackShareLinkViewed, trackShareLinkRevoked } from "@/lib/analytics"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params
  const db = getDb()

  const token = await db.collection("share_tokens").findOne({ shareId })
  
  if (!token) {
    return errorResponse("Share link not found", 404)
  }

  if (new Date(token.expiresAt) < new Date()) {
    return errorResponse("Share link has expired", 404)
  }

  await db.collection("share_tokens").updateOne(
    { _id: token._id },
    { $inc: { viewCount: 1 } }
  )

  trackShareLinkViewed(shareId)

  const bill = await db.collection("bills").findOne({ _id: new ObjectId(token.billId) })
  if (!bill) {
    return errorResponse("Bill not found", 404)
  }

  const splits = await db.collection("bill_splits").find({ billId: new ObjectId(token.billId) }).toArray()

  return jsonResponse({
    bill,
    splits,
    shareId: token.shareId,
    expiresAt: token.expiresAt,
    viewCount: token.viewCount + 1,
  })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { session, error } = await getSessionOrUnauthorized()
  if (error) return error

  const { shareId } = await params
  const db = getDb()

  const token = await db.collection("share_tokens").findOne({ shareId })

  if (!token) {
    return errorResponse("Share link not found", 404)
  }

  if (token.createdBy !== session.user.id) {
    return errorResponse("You don't own this share link", 403)
  }

  await db.collection("share_tokens").deleteOne({ _id: token._id })

  trackShareLinkRevoked(shareId)

  return jsonResponse({ deleted: true })
}
