import { Header } from "@/components/layout/header"
import { BillSnapshotCard } from "@/components/export/bill-snapshot-card"
import { ExportActions } from "@/components/export/export-actions"
import { DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency"
import { config } from "@/lib/config"
import type { BillDetailData, FlatData } from "@/lib/data-service"

interface SharePageProps {
  params: {
    shareId: string
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const { shareId } = await params
  
  const appUrl = config.app.url || ""

  const res = await fetch(`${appUrl}/api/share/${shareId}`, {
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-2">Share Link Not Found</h1>
          <p className="text-muted-foreground">
            {res.status === 404 
              ? "This share link has expired or does not exist."
              : "An error occurred while loading the share link."
            }
          </p>
        </div>
      </div>
    )
  }

  const { bill, splits, expiresAt, viewCount } = await res.json()

  const flat: FlatData = {
    _id: bill.flatId,
    name: "Shared Bill",
    areas: [],
  }

  const billData: BillDetailData = {
    _id: bill._id,
    flatId: bill.flatId,
    billingPeriod: bill.billingPeriod,
    totalBill: bill.totalBill,
    totalUnits: bill.totalUnits,
    submeterReadings: bill.submeterReadings,
    computed: bill.computed,
    status: bill.status,
    createdAt: bill.createdAt,
    updatedAt: bill.updatedAt,
    splits,
  }

  const remainingDays = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="mb-6 flex items-center justify-between rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">👁 {viewCount} view{viewCount === 1 ? "" : "s"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${remainingDays <= 3 ? "text-destructive" : "text-muted-foreground"}`}>
                ⏰ Expires in {remainingDays} {remainingDays === 1 ? "day" : "days"}
              </span>
            </div>
          </div>

          <BillSnapshotCard 
            bill={billData} 
            flat={flat} 
            currency={DEFAULT_CURRENCY}
          />

          <div className="mt-8">
            <ExportActions 
              billId={billData._id} 
              bill={billData} 
              flat={flat} 
            />
          </div>
        </div>
      </main>
    </div>
  )
}
