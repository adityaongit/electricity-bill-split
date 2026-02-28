import { ObjectId } from "mongodb"
import { getDb } from "@/lib/db"
import { getSessionOrUnauthorized, jsonResponse, errorResponse } from "@/lib/api-utils"
import { generateShareId, calculateExpirationDate, isValidExpiration } from "@/lib/share-service"
import { trackShareLinkGenerated } from "@/lib/analytics"
import { config } from "@/lib/config"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const { session, error } = await getSessionOrUnauthorized()
  if (error) return error

  try {
    const { billId, expirationDays = config.share.defaultExpirationDays } = await request.json()

    if (!billId) {
      return errorResponse("billId is required", 400)
    }

    if (!isValidExpiration(expirationDays)) {
      return errorResponse(`expirationDays must be between ${config.share.minExpirationDays} and ${config.share.maxExpirationDays}`, 400)
    }

    const db = getDb()

    const bill = await db.collection("bills").findOne({ _id: new ObjectId(billId) })
    if (!bill) {
      return errorResponse("Bill not found", 404)
    }

    if (bill.status !== "finalized") {
      return errorResponse("Only finalized bills can be shared", 403)
    }

    if (bill.createdBy !== session.user.id) {
      return errorResponse("You don't own this bill", 403)
    }

    const existing = await db.collection("share_tokens").findOne({ billId: new ObjectId(billId) })
    if (existing) {
      return jsonResponse({ 
        shareUrl: `/share/${existing.shareId}`,
        expiresAt: existing.expiresAt 
      })
    }

    const shareId = generateShareId()
    const expiresAt = calculateExpirationDate(expirationDays)

    await db.collection("share_tokens").insertOne({
      billId: new ObjectId(billId),
      shareId,
      expiresAt,
      viewCount: 0,
      createdAt: new Date(),
      createdBy: session.user.id,
    })

    const sharePath = `/share/${shareId}`
    console.log("Share generated:", { billId, shareId, sharePath, expiresAt })

    trackShareLinkGenerated(billId, expirationDays)

    return jsonResponse({ 
      shareUrl: sharePath,
      expiresAt 
    })
  } catch (error) {
    console.error("Error generating share link:", error)
    return errorResponse("Failed to generate share link", 500)
  }
}
