"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import type { FlatData, RoommateData } from "@/lib/data-service"
import {
  trackBillCreateInitiate,
  trackBillCreateSuccess,
  trackBillCreateFailed,
} from "@/lib/analytics"

export default function NewBillPage() {
  const router = useRouter()
  const { service } = useDataService()
  const { currency } = useCurrency()
  const [flats, setFlats] = useState<FlatData[]>([])
  const [selectedFlat, setSelectedFlat] = useState<FlatData | null>(null)
  const [roommates, setRoommates] = useState<RoommateData[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [autoFilled, setAutoFilled] = useState(false)

  // Bill form state
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()
  const [totalBill, setTotalBill] = useState("")
  const [totalUnits, setTotalUnits] = useState("")

  // Dynamic submeter readings state
  const [submeterReadings, setSubmeterReadings] = useState<
    Record<string, { previous: string; current: string }>
  >({})
  const [roommatesDays, setRoommatesDays] = useState<Record<string, string>>({})

  useEffect(() => {
    service.getFlats().then((data) => {
      setFlats(data)
      if (data.length > 0) setSelectedFlat(data[0])
      setLoading(false)
    })
  }, [service])

  useEffect(() => {
    if (!selectedFlat) return

    Promise.all([
      service.getRoommates(selectedFlat._id),
      service.getBills(selectedFlat._id, 1, 1),
    ]).then(([rm, billsResult]) => {
      setRoommates(rm)
      const days: Record<string, string> = {}
      rm.forEach((r) => {
        days[r._id] = "30"
      })
      setRoommatesDays(days)

      // Initialize submeter readings for all areas
      const initialReadings: Record<string, { previous: string; current: string }> = {}
      selectedFlat.areas.forEach((area) => {
        initialReadings[area.slug] = { previous: "", current: "" }
      })
      setSubmeterReadings(initialReadings)

      // Auto-fill from last bill
      const latestBill = billsResult.bills[0]
      if (latestBill?.submeterReadings) {
        const autoFilledReadings: Record<string, { previous: string; current: string }> = {}
        for (const [slug, reading] of Object.entries(latestBill.submeterReadings)) {
          if (slug in initialReadings) {
            autoFilledReadings[slug] = {
              previous: String(reading.current),
              current: "",
            }
          }
        }
        setSubmeterReadings(autoFilledReadings)
        setAutoFilled(true)
      }
    })
  }, [selectedFlat, service])

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
    const bill = parseFloat(totalBill)
    const units = parseFloat(totalUnits)

    // Check if all submeter readings have valid values
    const allReadingsFilled = selectedFlat?.areas.every(
      (area) =>
        submeterReadings[area.slug]?.previous &&
        submeterReadings[area.slug]?.current
    )

    if (!bill || !units || !allReadingsFilled || roommateInputs.length === 0) return null

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
      totalBill: bill,
      totalUnits: units,
      submeterReadings: readings,
      roommates: roommateInputs,
    })
  }, [totalBill, totalUnits, submeterReadings, roommateInputs, selectedFlat])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFlat || !preview || !dateFrom || !dateTo) return
    setSubmitting(true)
    trackBillCreateInitiate()

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

      const result = await service.createBill({
        flatId: selectedFlat._id,
        billingPeriod: { from: dateFrom.toISOString(), to: dateTo.toISOString() },
        totalBill: parseFloat(totalBill),
        totalUnits: parseFloat(totalUnits),
        submeterReadings: readings,
        roommates: roommateInputs,
        status: "finalized",
      })

      trackBillCreateSuccess(parseFloat(totalBill), roommates.length)
      toast.success("Bill created!")
      router.push(`/bill/${result._id}`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create bill"
      trackBillCreateFailed(errorMsg)
      toast.error(errorMsg)
    }

    setSubmitting(false)
  }

  function updateReading(slug: string, field: "previous" | "current", value: string) {
    setSubmeterReadings((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], [field]: value },
    }))
    setAutoFilled(false)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (flats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold">No flat set up yet</h2>
        <p className="mt-2 text-muted-foreground">Create a flat in Settings first.</p>
        <Button className="mt-4" asChild>
          <a href="/settings">Go to Settings</a>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">New Bill</h1>
          <p className="text-muted-foreground">Enter bill details and see the split live</p>
        </div>
        <Button type="submit" disabled={submitting || !preview || !dateFrom || !dateTo}>
          {submitting ? "Saving..." : "Save Bill"}
        </Button>
      </div>

      {flats.length > 1 && (
        <Select
          value={selectedFlat?._id}
          onValueChange={(id) => setSelectedFlat(flats.find((f) => f._id === id) ?? null)}
        >
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {flats.map((f) => (
              <SelectItem key={f._id} value={f._id}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

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
              <CardTitle className="flex items-center gap-2">
                Submeter Readings
                {autoFilled && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    Auto-filled from last bill
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedFlat?.areas.map((area) => (
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
              {roommates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No roommates found.{" "}
                  <a href="/roommates" className="underline">
                    Add roommates
                  </a>{" "}
                  first.
                </p>
              ) : (
                <div className="space-y-3">
                  {roommates.map((r) => (
                    <div key={r._id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{r.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedFlat?.areas.find((a) => a.slug === r.area)?.label || r.area}
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
              )}
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
                      <p className="font-medium">
                        {preview.computed.commonUnits}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Area Breakdown</p>
                    {Object.entries(preview.computed.areaUnits).map(([slug, units]) => (
                      <div key={slug} className="grid grid-cols-3 gap-2 text-sm">
                        <p className="text-muted-foreground">
                          {selectedFlat?.areas.find((a) => a.slug === slug)?.label || slug}
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
                          <TableCell className="font-medium">
                            {s.roommateName}
                          </TableCell>
                          <TableCell>
                            {selectedFlat?.areas.find((a) => a.slug === s.area)?.label || s.area}
                          </TableCell>
                          <TableCell className="text-right">
                            {s.areaSharePercent}%
                          </TableCell>
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
