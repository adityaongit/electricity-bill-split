"use client"

import { useState } from "react"
import { toPng } from "html-to-image"
import { Button } from "@/components/ui/button"
import { getWhatsAppUrl } from "@/lib/whatsapp"
import { useDataService } from "@/lib/guest-context"
import { toast } from "sonner"
import { generateBillFilename } from "@/lib/utils"

interface ExportActionsProps {
  billId: string
  bill: {
    billingPeriod: { from: string; to: string }
    totalBill: number
    totalUnits: number
    submeterReadings: {
      hall: { previous: number; current: number }
      room: { previous: number; current: number }
    }
    computed: {
      perUnitPrice: number
      hallUnits: number
      roomUnits: number
      commonUnits: number
      hallCost: number
      roomCost: number
      commonCost: number
    }
    splits: {
      roommateName: string
      area: string
      daysStayed: number
      areaSharePercent: number
      areaCost: number
      commonCost: number
      totalAmount: number
    }[]
  }
  imageTargetId?: string
}

export function ExportActions({
  billId,
  bill,
  imageTargetId = "bill-detail",
}: ExportActionsProps) {
  const { service } = useDataService()
  const [exporting, setExporting] = useState<string | null>(null)

  async function handlePdfDownload() {
    setExporting("pdf")
    try {
      const blob = await service.generatePdfBlob(billId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = generateBillFilename(bill.billingPeriod.from, bill.billingPeriod.to, "pdf")
      a.click()
      URL.revokeObjectURL(url)
      toast.success("PDF downloaded")
    } catch {
      toast.error("Failed to download PDF")
    }
    setExporting(null)
  }

  async function handleImageDownload() {
    setExporting("image")
    try {
      const node = document.getElementById(imageTargetId)
      if (!node) throw new Error("Target element not found")

      // Create a clean clone of the element for consistent screenshot
      const clone = node.cloneNode(true) as HTMLElement
      clone.style.display = "block"
      clone.style.position = "absolute"
      clone.style.left = "-9999px"
      clone.style.background = "#fff"
      clone.style.padding = "20px"
      clone.style.width = "780px" // Fixed width for consistency

      // Remove export buttons from the clone
      const exportBtns = clone.querySelector("div.flex.flex-wrap.gap-2")
      if (exportBtns) {
        exportBtns.remove()
      }

      document.body.appendChild(clone)

      const dataUrl = await toPng(clone, { pixelRatio: 2, backgroundColor: "#fff" })
      const a = document.createElement("a")
      a.href = dataUrl
      a.download = generateBillFilename(bill.billingPeriod.from, bill.billingPeriod.to, "png")
      a.click()

      // Clean up
      document.body.removeChild(clone)
      toast.success("Image downloaded")
    } catch {
      toast.error("Failed to download image")
    }
    setExporting(null)
  }

  function handleWhatsApp() {
    const url = getWhatsAppUrl(bill)
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
