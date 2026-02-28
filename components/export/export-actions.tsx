"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getWhatsAppUrl } from "@/lib/whatsapp"
import { useDataService } from "@/lib/guest-context"
import { useCurrency } from "@/lib/currency-context"
import { toast } from "sonner"
import { generateBillFilename } from "@/lib/utils"
import { generateBillImageDataUrl } from "@/lib/generate-bill-image"
import type { BillDetailData, FlatData } from "@/lib/data-service"
import {
  trackExportPDF,
  trackExportPDFFailed,
  trackExportImage,
  trackExportImageFailed,
  trackShareWhatsApp,
} from "@/lib/analytics"

interface ExportActionsProps {
  billId: string
  bill: BillDetailData
  flat: FlatData | null
}

export function ExportActions({ billId, bill, flat }: ExportActionsProps) {
  const { service } = useDataService()
  const { currency } = useCurrency()
  const [exporting, setExporting] = useState<string | null>(null)

  async function handlePdfDownload() {
    setExporting("pdf")
    try {
      const blob = await service.generatePdfBlob(billId, currency)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = generateBillFilename(bill.billingPeriod.from, bill.billingPeriod.to, "pdf")
      a.click()
      URL.revokeObjectURL(url)
      trackExportPDF(billId)
      toast.success("PDF downloaded")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      trackExportPDFFailed(billId, errorMsg)
      toast.error("Failed to download PDF")
    }
    setExporting(null)
  }

  async function handleImageDownload() {
    setExporting("image")
    try {
      const dataUrl = await generateBillImageDataUrl(bill, flat, currency)
      const a = document.createElement("a")
      a.href = dataUrl
      a.download = generateBillFilename(bill.billingPeriod.from, bill.billingPeriod.to, "png")
      a.click()
      trackExportImage(billId)
      toast.success("Image downloaded")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      trackExportImageFailed(billId, errorMsg)
      toast.error("Failed to download image")
    }
    setExporting(null)
  }

  function handleWhatsApp() {
    const url = getWhatsAppUrl(bill, currency)
    trackShareWhatsApp(billId, "group")
    window.open(url, "_blank")
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePdfDownload}
        disabled={exporting === "pdf"}
      >
        {exporting === "pdf" ? "Generating..." : "Download PDF"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleImageDownload}
        disabled={exporting === "image"}
      >
        {exporting === "image" ? "Capturing..." : "Download Image"}
      </Button>
      <Button variant="outline" size="sm" onClick={handleWhatsApp}>
        Share on WhatsApp
      </Button>
    </div>
  )
}
