import { Header } from "@/components/layout/header"
import { ExportActions } from "@/components/export/export-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye, Clock } from "lucide-react"
import { DEFAULT_CURRENCY } from "@/lib/currency"
import { formatCurrency, formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { BillDetailData, FlatData } from "@/lib/data-service"
import type { Metadata } from "next"
import { config } from "@/lib/config"
import { getSharePreviewData } from "@/lib/share-preview"

interface SharePageProps {
  params: {
    shareId: string
  }
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { shareId } = await params
  const preview = await getSharePreviewData(shareId)
  const canonical = `${config.app.url}/share/${shareId}`

  if (!preview) {
    return {
      title: "Shared Bill Not Found",
      description: "This shared electricity bill link is missing or has expired.",
      alternates: { canonical },
    }
  }

  return {
    title: `Shared Bill for ${formatDate(preview.billingPeriod.from)} to ${formatDate(preview.billingPeriod.to)}`,
    description: `View a shared ${formatCurrency(preview.totalBill)} electricity bill split across ${preview.roommateCount} roommate${preview.roommateCount === 1 ? "" : "s"}.`,
    alternates: { canonical },
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const { shareId } = await params

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

  const res = await fetch(`${baseUrl}/api/share/${shareId}`, {
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

  const json = await res.json()
  const { bill, splits, expiresAt, viewCount } = json.data

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
  const currency = DEFAULT_CURRENCY

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">

          {/* Meta bar */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Eye className="h-4 w-4 text-muted-foreground" />
              {viewCount} {viewCount === 1 ? "view" : "views"}
            </div>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              remainingDays <= 3 ? "text-destructive" : "text-muted-foreground"
            )}>
              <Clock className="h-4 w-4" />
              Expires in {remainingDays} {remainingDays === 1 ? "day" : "days"}
            </div>
          </div>

          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">Bill Details</h1>
              <span className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium shadow-xs border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Finalized
              </span>
            </div>
            <p className="text-muted-foreground">
              {formatDate(billData.billingPeriod.from)} — {formatDate(billData.billingPeriod.to)}
            </p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card className="flex items-center justify-center">
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">Total Bill</p>
                <p className="text-2xl font-bold">{formatCurrency(billData.totalBill, currency)}</p>
              </CardContent>
            </Card>
            <Card className="flex items-center justify-center">
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">Total Units</p>
                <p className="text-2xl font-bold">{billData.totalUnits}</p>
              </CardContent>
            </Card>
            <Card className="flex items-center justify-center">
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">Per Unit Price</p>
                <p className="text-2xl font-bold">{formatCurrency(billData.computed.perUnitPrice, currency)}</p>
              </CardContent>
            </Card>
            <Card className="flex items-center justify-center">
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">Common Units</p>
                <p className="text-2xl font-bold">{billData.computed.commonUnits}</p>
              </CardContent>
            </Card>
          </div>

          {/* Submeter Readings */}
          <Card>
            <CardHeader>
              <CardTitle>Submeter Readings</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mobile */}
              <div className="space-y-4 md:hidden">
                {Object.entries(billData.submeterReadings).map(([slug, reading]) => {
                  const units = billData.computed.areaUnits[slug] || 0
                  const cost = billData.computed.areaCosts[slug] || 0
                  return (
                    <div key={slug} className="rounded-lg border p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{slug}</span>
                        <span className="text-sm text-muted-foreground">{units} units</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Previous</p>
                          <p className="font-medium">{reading.previous}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Current</p>
                          <p className="font-medium">{reading.current}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Cost</p>
                          <p className="font-bold">{formatCurrency(cost, currency)}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-sm text-muted-foreground">Common Units</p>
                  <p className="text-lg font-bold">{billData.computed.commonUnits} units</p>
                  <p className="text-sm font-medium">{formatCurrency(billData.computed.commonCost, currency)}</p>
                </div>
              </div>

              {/* Desktop */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Area</TableHead>
                      <TableHead className="text-right">Previous</TableHead>
                      <TableHead className="text-right">Current</TableHead>
                      <TableHead className="text-right">Units</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(billData.submeterReadings).map(([slug, reading]) => {
                      const units = billData.computed.areaUnits[slug] || 0
                      const cost = billData.computed.areaCosts[slug] || 0
                      return (
                        <TableRow key={slug}>
                          <TableCell className="font-medium">{slug}</TableCell>
                          <TableCell className="text-right">{reading.previous}</TableCell>
                          <TableCell className="text-right">{reading.current}</TableCell>
                          <TableCell className="text-right font-medium">{units}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(cost, currency)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mobile */}
              <div className="space-y-4 md:hidden">
                {billData.splits.map((s, i) => (
                  <div key={i} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-base">{s.roommateName}</p>
                        <p className="text-sm text-muted-foreground">{s.area}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatCurrency(s.totalAmount, currency)}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Days</p>
                        <p className="font-medium">{s.daysStayed}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Area Share</p>
                        <p className="font-medium">{s.areaSharePercent}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Area Cost</p>
                        <p className="font-medium">{formatCurrency(s.areaCost, currency)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Common</p>
                        <p className="font-medium">{formatCurrency(s.commonCost, currency)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead className="text-right">Days</TableHead>
                      <TableHead className="text-right">Area Share</TableHead>
                      <TableHead className="text-right">Area Cost</TableHead>
                      <TableHead className="text-right">Common</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billData.splits.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{s.roommateName}</TableCell>
                        <TableCell>{s.area}</TableCell>
                        <TableCell className="text-right">{s.daysStayed}</TableCell>
                        <TableCell className="text-right">{s.areaSharePercent}%</TableCell>
                        <TableCell className="text-right">{formatCurrency(s.areaCost, currency)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(s.commonCost, currency)}</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(s.totalAmount, currency)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Export actions */}
          <div>
            <ExportActions
              billId={billData._id}
              bill={billData}
              flat={flat}
              hideShareLink
            />
          </div>

        </div>
      </main>
    </div>
  )
}
