"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ExportActions } from "@/components/export/export-actions"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useDataService } from "@/lib/guest-context"
import { useCurrency } from "@/lib/currency-context"
import { getIndividualWhatsAppUrl } from "@/lib/whatsapp"
import type { BillDetailData, RoommateData, FlatData } from "@/lib/data-service"
import { trackBillView } from "@/lib/analytics"

export default function BillDetailPage({
  params,
}: {
  params: Promise<{ billId: string }>
}) {
  const { billId } = use(params)
  const { service } = useDataService()
  const { currency } = useCurrency()
  const [bill, setBill] = useState<BillDetailData | null>(null)
  const [flat, setFlat] = useState<FlatData | null>(null)
  const [roommates, setRoommates] = useState<RoommateData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const billData = await service.getBill(billId)
      setBill(billData)
      if (billData) {
        trackBillView(billId)
        const [mates, flatData] = await Promise.all([
          service.getRoommates(billData.flatId),
          service.getFlats().then(flats => flats.find(f => f._id === billData.flatId) || null)
        ])
        setRoommates(mates)
        setFlat(flatData)
      }
      setLoading(false)
    }
    loadData()
  }, [billId, service])

  const getRoommatePhone = (name: string) => {
    const roommate = roommates.find((r) => r.name === name)
    return roommate?.phone
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!bill) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-semibold">Bill not found</h2>
        <Button className="mt-4" asChild>
          <Link href="/bill/history">View History</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6" id="bill-detail">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">Bill Details</h1>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium shadow-xs",
                  bill.status === "finalized"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "border-border bg-background text-muted-foreground dark:bg-input/30 dark:border-input"
                )}
              >
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  bill.status === "finalized" ? "bg-emerald-500" : "bg-muted-foreground/50"
                )} />
                {bill.status === "finalized" ? "Finalized" : "Draft"}
              </span>
            </div>
            <p className="text-muted-foreground mt-1">
              {formatDate(bill.billingPeriod.from)} — {formatDate(bill.billingPeriod.to)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportActions billId={billId} bill={bill} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="flex items-center justify-center">
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">Total Bill</p>
            <p className="text-2xl font-bold">{formatCurrency(bill.totalBill, currency)}</p>
          </CardContent>
        </Card>
        <Card className="flex items-center justify-center">
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">Total Units</p>
            <p className="text-2xl font-bold">{bill.totalUnits}</p>
          </CardContent>
        </Card>
        <Card className="flex items-center justify-center">
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">Per Unit Price</p>
            <p className="text-2xl font-bold">
              {formatCurrency(bill.computed.perUnitPrice, currency)}
            </p>
          </CardContent>
        </Card>
        <Card className="flex items-center justify-center">
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">Common Units</p>
            <p className="text-2xl font-bold">{bill.computed.commonUnits}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submeter Readings</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile view */}
          <div className="space-y-4 md:hidden">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Hall</span>
                <span className="text-sm text-muted-foreground">{bill.computed.hallUnits} units</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Previous</p>
                  <p className="font-medium">{bill.submeterReadings.hall.previous}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Current</p>
                  <p className="font-medium">{bill.submeterReadings.hall.current}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Cost</p>
                  <p className="font-bold">{formatCurrency(bill.computed.hallCost, currency)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Room</span>
                <span className="text-sm text-muted-foreground">{bill.computed.roomUnits} units</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Previous</p>
                  <p className="font-medium">{bill.submeterReadings.room.previous}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Current</p>
                  <p className="font-medium">{bill.submeterReadings.room.current}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Cost</p>
                  <p className="font-bold">{formatCurrency(bill.computed.roomCost, currency)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-sm text-muted-foreground">Common Units</p>
              <p className="text-lg font-bold">{bill.computed.commonUnits} units</p>
              <p className="text-sm font-medium">{formatCurrency(bill.computed.commonCost, currency)}</p>
            </div>
          </div>

          {/* Desktop view */}
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
                <TableRow>
                  <TableCell className="font-medium">Hall</TableCell>
                  <TableCell className="text-right">{bill.submeterReadings.hall.previous}</TableCell>
                  <TableCell className="text-right">{bill.submeterReadings.hall.current}</TableCell>
                  <TableCell className="text-right font-medium">{bill.computed.hallUnits}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(bill.computed.hallCost, currency)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Room</TableCell>
                  <TableCell className="text-right">{bill.submeterReadings.room.previous}</TableCell>
                  <TableCell className="text-right">{bill.submeterReadings.room.current}</TableCell>
                  <TableCell className="text-right font-medium">{bill.computed.roomUnits}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(bill.computed.roomCost, currency)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile view - Card layout */}
          <div className="space-y-4 md:hidden">
            {bill.splits.map((s, i) => {
              const phone = getRoommatePhone(s.roommateName)
              return (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-base">{s.roommateName}</p>
                      <p className="text-sm text-muted-foreground capitalize">{s.area}</p>
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
                  {phone ? (
                    <Button
                      variant="outline"
                      className="w-full text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950"
                      onClick={() => {
                        const url = getIndividualWhatsAppUrl(
                          bill,
                          phone,
                          flat?.upiId,
                          flat?.upiPayeeName,
                          currency
                        )
                        window.open(url, "_blank")
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Share on WhatsApp
                    </Button>
                  ) : (
                    <a href="/roommates" className="block">
                      <Button variant="outline" className="w-full" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Add phone number to share
                      </Button>
                    </a>
                  )}
                </div>
              )
            })}
          </div>

          {/* Desktop view - Table layout */}
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
                  <TableHead className="text-right w-[140px]">WhatsApp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bill.splits.map((s, i) => {
                  const phone = getRoommatePhone(s.roommateName)
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{s.roommateName}</TableCell>
                      <TableCell className="capitalize">{s.area}</TableCell>
                      <TableCell className="text-right">{s.daysStayed}</TableCell>
                      <TableCell className="text-right">{s.areaSharePercent}%</TableCell>
                      <TableCell className="text-right">{formatCurrency(s.areaCost, currency)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(s.commonCost, currency)}</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(s.totalAmount, currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {phone ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950"
                            onClick={() => {
                              const url = getIndividualWhatsAppUrl(
                                bill,
                                phone,
                                flat?.upiId,
                                flat?.upiPayeeName
                              )
                              window.open(url, "_blank")
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        ) : (
                          <a href="/roommates" className="text-xs text-muted-foreground hover:underline">
                            Add phone
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href="/bill/history">Back to History</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/bill/new">Create New Bill</Link>
        </Button>
      </div>
    </div>
  )
}
