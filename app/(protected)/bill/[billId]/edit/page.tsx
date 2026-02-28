"use client"

import { useEffect, useState, useMemo, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
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
import { toast } from "sonner"
import { calculateBill } from "@/lib/bill-calculator"
import type { BillResult, RoommateInput } from "@/lib/bill-calculator"
import { formatCurrency } from "@/lib/utils"
import { useDataService } from "@/lib/guest-context"
import { useCurrency } from "@/lib/currency-context"
import type { FlatData, RoommateData, BillDetailData } from "@/lib/data-service"

export default function EditBillPage({
  params,
}: {
  params: Promise<{ billId: string }>
}) {
  const { billId } = use(params)
  const router = useRouter()
  const { service } = useDataService()
  const { currency } = useCurrency()

  const [flat, setFlat] = useState<FlatData | null>(null)
  const [roommates, setRoommates] = useState<RoommateData[]>([])
  const [bill, setBill] = useState<BillDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()
  const [totalBill, setTotalBill] = useState("")
  const [totalUnits, setTotalUnits] = useState("")
  const [submeterReadings, setSubmeterReadings] = useState<
    Record<string, { previous: string; current: string }>
  >({})
  const [roommatesDays, setRoommatesDays] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadData() {
      const billData = await service.getBill(billId)
      if (!billData) {
        setLoading(false)
        return
      }
      setBill(billData)

      const flats = await service.getFlats()
      const flatData = flats.find((f) => f._id === billData.flatId) ?? null
      setFlat(flatData)

      const rm = await service.getRoommates(billData.flatId)
      setRoommates(rm)

      // Pre-fill form fields
      setDateFrom(new Date(billData.billingPeriod.from))
      setDateTo(new Date(billData.billingPeriod.to))
      setTotalBill(String(billData.totalBill))
      setTotalUnits(String(billData.totalUnits))

      // Pre-fill submeter readings
      const readings: Record<string, { previous: string; current: string }> = {}
      for (const [slug, reading] of Object.entries(billData.submeterReadings)) {
        readings[slug] = {
          previous: String(reading.previous),
          current: String(reading.current),
        }
      }
      setSubmeterReadings(readings)

      // Pre-fill days stayed from splits (matched by roommateId)
      const days: Record<string, string> = {}
      for (const r of rm) {
        const split = billData.splits.find((s) => s.roommateId === r._id)
        days[r._id] = split ? String(split.daysStayed) : "30"
      }
      setRoommatesDays(days)

      setLoading(false)
    }
    loadData()
  }, [billId, service])

  const roommateInputs: RoommateInput[] = useMemo(
    () =>
      roommates.map((r) => ({
        roommateId: r._id,
        roommateName: r.name,
        area: r.area,
        daysStayed: parseInt(roommatesDays[r._id] || "30", 10) || 30,
      })),
    [roommates, roommatesDays]
  )

  const preview: BillResult | null = useMemo(() => {
    const billVal = parseFloat(totalBill)
    const units = parseFloat(totalUnits)

    const allReadingsFilled = flat?.areas.every(
      (area) =>
        submeterReadings[area.slug]?.previous !== "" &&
        submeterReadings[area.slug]?.current !== "" &&
        submeterReadings[area.slug]?.previous !== undefined &&
        submeterReadings[area.slug]?.current !== undefined
    )

    if (!billVal || !units || !allReadingsFilled || roommateInputs.length === 0) return null

    const readings = Object.fromEntries(
      Object.entries(submeterReadings).map(([slug, vals]) => [
        slug,
        {
          previous: parseFloat(vals.previous) || 0,
          current: parseFloat(vals.current) || 0,
        },
      ])
    )

    return calculateBill({
      totalBill: billVal,
      totalUnits: units,
      submeterReadings: readings,
      roommates: roommateInputs,
    })
  }, [totalBill, totalUnits, submeterReadings, roommateInputs, flat])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!flat || !preview || !dateFrom || !dateTo) return
    setSubmitting(true)

    try {
      const readings = Object.fromEntries(
        Object.entries(submeterReadings).map(([slug, vals]) => [
          slug,
          {
            previous: parseFloat(vals.previous) || 0,
            current: parseFloat(vals.current) || 0,
          },
        ])
      )

      await service.updateBill(billId, {
        billingPeriod: { from: dateFrom.toISOString(), to: dateTo.toISOString() },
        totalBill: parseFloat(totalBill),
        totalUnits: parseFloat(totalUnits),
        submeterReadings: readings,
        roommates: roommateInputs,
      })

      toast.success("Bill updated!")
      router.push(`/bill/${billId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update bill")
    }

    setSubmitting(false)
  }

  function updateReading(slug: string, field: "previous" | "current", value: string) {
    setSubmeterReadings((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], [field]: value },
    }))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!bill || !flat) {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit Bill</h1>
          <p className="text-muted-foreground">{flat.name}</p>
        </div>
        <Button type="submit" disabled={submitting || !preview || !dateFrom || !dateTo}>
          {submitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form inputs */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bill Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From</Label>
                  <DatePicker
                    value={dateFrom}
                    onChange={setDateFrom}
                    placeholder="Start date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <DatePicker
                    value={dateTo}
                    onChange={setDateTo}
                    placeholder="End date"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalBill">Total Bill ({currency === "INR" ? "₹" : currency})</Label>
                  <Input
                    id="totalBill"
                    type="number"
                    step="0.01"
                    value={totalBill}
                    onChange={(e) => setTotalBill(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalUnits">Total Units</Label>
                  <Input
                    id="totalUnits"
                    type="number"
                    step="0.01"
                    value={totalUnits}
                    onChange={(e) => setTotalUnits(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submeter Readings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {flat.areas.map((area) => (
                <div key={area.slug}>
                  <p className="mb-2 text-sm font-medium">{area.label}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${area.slug}-previous`}>Previous</Label>
                      <Input
                        id={`${area.slug}-previous`}
                        type="number"
                        step="0.01"
                        value={submeterReadings[area.slug]?.previous || ""}
                        onChange={(e) => updateReading(area.slug, "previous", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${area.slug}-current`}>Current</Label>
                      <Input
                        id={`${area.slug}-current`}
                        type="number"
                        step="0.01"
                        value={submeterReadings[area.slug]?.current || ""}
                        onChange={(e) => updateReading(area.slug, "current", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Days Stayed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roommates.map((r) => (
                  <div key={r._id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {flat.areas.find((a) => a.slug === r.area)?.label || r.area}
                      </p>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={31}
                      className="w-20"
                      value={roommatesDays[r._id] || ""}
                      placeholder="30"
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === "" || /^\d+$/.test(value)) {
                          setRoommatesDays((prev) => ({ ...prev, [r._id]: value }))
                        }
                      }}
                      onBlur={() => {
                        if (!roommatesDays[r._id] || roommatesDays[r._id] === "") {
                          setRoommatesDays((prev) => ({ ...prev, [r._id]: "30" }))
                        }
                      }}
                    />
                    <span className="text-xs text-muted-foreground">days</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {!preview ? (
                <p className="text-sm text-muted-foreground">
                  Enter bill details and units to see the split preview.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Per Unit Price</p>
                      <p className="font-medium">
                        {formatCurrency(preview.computed.perUnitPrice, currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Common Units</p>
                      <p className="font-medium">{preview.computed.commonUnits}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Area Breakdown</p>
                    {Object.entries(preview.computed.areaUnits).map(([slug, units]) => (
                      <div key={slug} className="grid grid-cols-3 gap-2 text-sm">
                        <p className="text-muted-foreground">
                          {flat.areas.find((a) => a.slug === slug)?.label || slug}
                        </p>
                        <p className="text-center font-medium">{units} units</p>
                        <p className="text-right font-medium">
                          {formatCurrency(preview.computed.areaCosts[slug] || 0, currency)}
                        </p>
                      </div>
                    ))}
                    <div className="grid grid-cols-3 gap-2 text-sm pt-2 border-t">
                      <p className="text-muted-foreground">Common</p>
                      <p className="text-center font-medium">{preview.computed.commonUnits} units</p>
                      <p className="text-right font-medium">
                        {formatCurrency(preview.computed.commonCost, currency)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead className="text-right">Area Share</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.splits.map((s) => (
                        <TableRow key={s.roommateId}>
                          <TableCell className="font-medium">{s.roommateName}</TableCell>
                          <TableCell>
                            {flat.areas.find((a) => a.slug === s.area)?.label || s.area}
                          </TableCell>
                          <TableCell className="text-right">{s.areaSharePercent}%</TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(s.totalAmount, currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
