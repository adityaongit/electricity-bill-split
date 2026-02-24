import { ObjectId } from "mongodb"
import type { DocumentProps } from "@react-pdf/renderer"
import { renderToStream } from "@react-pdf/renderer"
import React, { createElement } from "react"
import { getDb } from "@/lib/db"
import { getSessionOrUnauthorized, errorResponse } from "@/lib/api-utils"
import { BillPdfDocument } from "@/components/export/bill-pdf-document"
import { DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ billId: string }> }
) {
  const { error } = await getSessionOrUnauthorized()
  if (error) return error

  const { billId } = await params
  const { searchParams } = new URL(request.url)
  const currency = (searchParams.get("currency") ?? DEFAULT_CURRENCY) as CurrencyCode
  const db = getDb()

  const [bill, splits, flat] = await Promise.all([
    db.collection("bills").findOne({ _id: new ObjectId(billId) }),
    db.collection("bill_splits").find({ billId: new ObjectId(billId) }).toArray(),
    db.collection("flats").findOne({ _id: new ObjectId((bill as any).flatId) }),
  ])

  if (!bill) return errorResponse("Bill not found", 404)

  const billData = {
    billingPeriod: {
      from: (bill.billingPeriod.from as Date).toISOString(),
      to: (bill.billingPeriod.to as Date).toISOString(),
    },
    totalBill: bill.totalBill as number,
    totalUnits: bill.totalUnits as number,
    submeterReadings: bill.submeterReadings as Record<string, { previous: number; current: number }>,
    computed: bill.computed as {
      areaUnits: bill.computed.areaUnits as Record<string, number>,
      commonUnits: bill.computed.commonUnits as number,
      perUnitPrice: bill.computed.perUnitPrice as number,
      areaCosts: bill.computed.areaCosts as Record<string, number>,
      commonCost: bill.computed.commonCost as number,
    },
    splits: splits.map((s) => ({
      roommateName: s.roommateName as string,
      area: s.area as string,
      daysStayed: s.daysStayed as number,
      areaSharePercent: s.areaSharePercent as number,
      areaCost: s.areaCost as number,
      commonCost: s.commonCost as number,
      totalAmount: s.totalAmount as number,
    })),
  }

  const element = createElement(BillPdfDocument, {
    bill: billData,
    flat: flat ? { areas: flat.areas as { slug: string; label: string }[] } } : undefined,
    currency
  })
  const stream = await renderToStream(
    element as unknown as React.ReactElement<DocumentProps>
  )

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="bill-${billId}.pdf"`,
    },
  })
}
