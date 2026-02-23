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
  const [hallPrevious, setHallPrevious] = useState("")
  const [hallCurrent, setHallCurrent] = useState("")
  const [roomPrevious, setRoomPrevious] = useState("")
  const [roomCurrent, setRoomCurrent] = useState("")
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

      // Auto reading shift
      const latestBill = billsResult.bills[0]
      if (latestBill?.submeterReadings) {
        setHallPrevious(String(latestBill.submeterReadings.hall.current))
        setRoomPrevious(String(latestBill.submeterReadings.room.current))
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
    if (!bill || !units || roommateInputs.length === 0) return null

    return calculateBill({
      totalBill: bill,
      totalUnits: units,
      submeterReadings: {
        hall: {
          previous: parseFloat(hallPrevious) || 0,
          current: parseFloat(hallCurrent) || 0,
        },
        room: {
          previous: parseFloat(roomPrevious) || 0,
          current: parseFloat(roomCurrent) || 0,
        },
      },
      roommates: roommateInputs,
    })
  }, [totalBill, totalUnits, hallPrevious, hallCurrent, roomPrevious, roomCurrent, roommateInputs])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFlat || !preview || !dateFrom || !dateTo) return
    setSubmitting(true)

    try {
      const result = await service.createBill({
        flatId: selectedFlat._id,
        billingPeriod: { from: dateFrom.toISOString(), to: dateTo.toISOString() },
        totalBill: parseFloat(totalBill),
        totalUnits: parseFloat(totalUnits),
        submeterReadings: {
          hall: {
            previous: parseFloat(hallPrevious) || 0,
            current: parseFloat(hallCurrent) || 0,
          },
          room: {
            previous: parseFloat(roomPrevious) || 0,
            current: parseFloat(roomCurrent) || 0,
          },
        },
        roommates: roommateInputs,
        status: "finalized",
      })

      toast.success("Bill created!")
      router.push(`/bill/${result._id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create bill")
    }

    setSubmitting(false)
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
                  <Label htmlFor="totalBill">Total Bill (₹)</Label>
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
              <div>
                <p className="mb-2 text-sm font-medium">Hall</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hallPrevious">Previous</Label>
                    <Input
                      id="hallPrevious"
                      type="number"
                      step="0.01"
                      value={hallPrevious}
                      onChange={(e) => {
                        setHallPrevious(e.target.value)
                        setAutoFilled(false)
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hallCurrent">Current</Label>
                    <Input
                      id="hallCurrent"
                      type="number"
                      step="0.01"
                      value={hallCurrent}
                      onChange={(e) => setHallCurrent(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Room</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomPrevious">Previous</Label>
                    <Input
                      id="roomPrevious"
                      type="number"
                      step="0.01"
                      value={roomPrevious}
                      onChange={(e) => {
                        setRoomPrevious(e.target.value)
                        setAutoFilled(false)
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roomCurrent">Current</Label>
                    <Input
                      id="roomCurrent"
                      type="number"
                      step="0.01"
                      value={roomCurrent}
                      onChange={(e) => setRoomCurrent(e.target.value)}
                    />
                  </div>
                </div>
              </div>
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
                        <p className="text-xs text-muted-foreground capitalize">
                          {r.area}
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
                          // Allow empty string or valid numbers
                          if (value === "" || /^\d+$/.test(value)) {
                            setRoommatesDays((prev) => ({ ...prev, [r._id]: value }))
                          }
                        }}
                        onBlur={() => {
                          // Reset to 30 if left empty
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
                    <div>
                      <p className="text-muted-foreground">Hall Units</p>
                      <p className="font-medium">{preview.computed.hallUnits}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Room Units</p>
                      <p className="font-medium">{preview.computed.roomUnits}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Hall Cost</p>
                      <p className="font-medium">
                        {formatCurrency(preview.computed.hallCost, currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Room Cost</p>
                      <p className="font-medium">
                        {formatCurrency(preview.computed.roomCost, currency)}
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
                          <TableCell className="capitalize">{s.area}</TableCell>
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
