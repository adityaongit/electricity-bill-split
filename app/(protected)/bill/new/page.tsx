"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
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
import { Trash2 } from "lucide-react"
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
  trackStarterDraftOpen,
  trackStarterDraftResume,
  trackAuthPromptShown,
} from "@/lib/analytics"
import type { AreaInput } from "@/lib/data-service"
import {
  clearOnboardingDraft,
  getOnboardingDraft,
  saveOnboardingDraft,
  type OnboardingDraft,
} from "@/lib/onboarding-draft"
import { GuestConversionDialog } from "@/components/auth/guest-conversion-dialog"

interface SetupRoommateDraft {
  id: string
  name: string
  area: string
}

function createSlug(value: string, index: number) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return normalized || `area-${index + 1}`
}

function getCurrentMonthRange() {
  const now = new Date()
  return {
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: now,
  }
}

const DEFAULT_QUICK_SETUP_AREAS = ["Hall", "Room 1", "Room 2"]

const SAMPLE_SETUP = {
  areas: ["Hall", "Room 1", "Room 2"],
  roommates: [
    { id: "sample-roommate-1", name: "Aarav", area: "room-1" },
    { id: "sample-roommate-2", name: "Mia", area: "room-2" },
  ],
  totalBill: "128.50",
  totalUnits: "76",
  submeterReadings: {
    hall: { previous: "210", current: "228" },
    "room-1": { previous: "510", current: "536" },
    "room-2": { previous: "400", current: "432" },
  },
}

export default function NewBillPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { service, isGuest } = useDataService()
  const { currency } = useCurrency()
  const [flats, setFlats] = useState<FlatData[]>([])
  const [selectedFlat, setSelectedFlat] = useState<FlatData | null>(null)
  const [roommates, setRoommates] = useState<RoommateData[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [autoFilled, setAutoFilled] = useState(false)
  const [quickSetupSubmitting, setQuickSetupSubmitting] = useState(false)
  const [showSavePrompt, setShowSavePrompt] = useState(false)
  const [pendingSavedBillId, setPendingSavedBillId] = useState<string | null>(null)

  // Bill form state
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()
  const [totalBill, setTotalBill] = useState("")
  const [totalUnits, setTotalUnits] = useState("")

  const [quickSetupAreas, setQuickSetupAreas] = useState<string[]>(DEFAULT_QUICK_SETUP_AREAS)
  const [quickSetupRoommates, setQuickSetupRoommates] = useState<SetupRoommateDraft[]>([
    { id: crypto.randomUUID(), name: "", area: "room-1" },
  ])

  // Dynamic submeter readings state
  const [submeterReadings, setSubmeterReadings] = useState<
    Record<string, { previous: string; current: string }>
  >({})
  const [roommatesDays, setRoommatesDays] = useState<Record<string, string>>({})
  const restoredDraftRef = useRef<OnboardingDraft | null>(null)
  const sampleRequestedRef = useRef(searchParams.get("sample") === "1")
  const sampleAppliedRef = useRef(false)

  useEffect(() => {
    async function loadInitialState() {
      const [data, draft] = await Promise.all([
        service.getFlats(),
        isGuest ? getOnboardingDraft() : Promise.resolve(null),
      ])

      setFlats(data)

      if (draft) {
        restoredDraftRef.current = draft
        setQuickSetupAreas(draft.quickSetupAreas)
        setQuickSetupRoommates(draft.quickSetupRoommates)
        setDateFrom(draft.dateFrom ? new Date(draft.dateFrom) : undefined)
        setDateTo(draft.dateTo ? new Date(draft.dateTo) : undefined)
        setTotalBill(draft.totalBill)
        setTotalUnits(draft.totalUnits)
        setSubmeterReadings(draft.submeterReadings)
        setRoommatesDays(draft.roommatesDays)
        trackStarterDraftResume()
      } else {
        const range = getCurrentMonthRange()
        setDateFrom(range.from)
        setDateTo(range.to)
        if (sampleRequestedRef.current) {
          setQuickSetupAreas(SAMPLE_SETUP.areas)
          setQuickSetupRoommates(SAMPLE_SETUP.roommates)
          trackStarterDraftOpen("sample")
        } else {
          trackStarterDraftOpen("fresh")
        }
      }

      if (data.length > 0) {
        const draftFlat = draft?.selectedFlatId
        setSelectedFlat(data.find((flat) => flat._id === draftFlat) ?? data[0])
      }

      setLoading(false)
    }

    loadInitialState()
  }, [service, isGuest])

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

      const restoredDraft = restoredDraftRef.current
      if (restoredDraft?.selectedFlatId === selectedFlat._id) {
        setRoommatesDays({ ...days, ...restoredDraft.roommatesDays })
        setSubmeterReadings(
          Object.keys(restoredDraft.submeterReadings).length > 0
            ? restoredDraft.submeterReadings
            : initialReadings
        )
        restoredDraftRef.current = null
        return
      }

      if (sampleRequestedRef.current && !sampleAppliedRef.current) {
        const sampleDays: Record<string, string> = {}
        rm.forEach((roommate) => {
          sampleDays[roommate._id] = "30"
        })
        setRoommatesDays(sampleDays)
        setTotalBill(SAMPLE_SETUP.totalBill)
        setTotalUnits(SAMPLE_SETUP.totalUnits)
        setSubmeterReadings({
          hall: { ...SAMPLE_SETUP.submeterReadings.hall },
          "room-1": { ...SAMPLE_SETUP.submeterReadings["room-1"] },
          "room-2": { ...SAMPLE_SETUP.submeterReadings["room-2"] },
        })
        sampleAppliedRef.current = true
        return
      }

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

  useEffect(() => {
    if (!isGuest || loading) return

    const draft: OnboardingDraft = {
      selectedFlatId: selectedFlat?._id,
      quickSetupAreas,
      quickSetupRoommates,
      dateFrom: dateFrom?.toISOString(),
      dateTo: dateTo?.toISOString(),
      totalBill,
      totalUnits,
      submeterReadings,
      roommatesDays,
    }

    void saveOnboardingDraft(draft)
  }, [
    isGuest,
    loading,
    selectedFlat?._id,
    quickSetupAreas,
    quickSetupRoommates,
    dateFrom,
    dateTo,
    totalBill,
    totalUnits,
    submeterReadings,
    roommatesDays,
  ])

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
      if (isGuest) {
        await clearOnboardingDraft()
        trackAuthPromptShown("save")
        setPendingSavedBillId(result._id)
        setShowSavePrompt(true)
      } else {
        router.push(`/bill/${result._id}`)
      }
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

  function applySampleSetup() {
    setQuickSetupAreas(SAMPLE_SETUP.areas)
    setQuickSetupRoommates(SAMPLE_SETUP.roommates.map((roommate) => ({ ...roommate })))
    sampleRequestedRef.current = true
    sampleAppliedRef.current = false
    trackStarterDraftOpen("sample")
  }

  function updateQuickSetupArea(index: number, value: string) {
    setQuickSetupAreas((prev) => {
      const previousLabel = prev[index]
      const next = prev.map((label, idx) => (idx === index ? value : label))
      const previousSlug = createSlug(previousLabel, index)
      const nextSlug = createSlug(value, index)

      if (previousSlug !== nextSlug) {
        setQuickSetupRoommates((roommatesPrev) =>
          roommatesPrev.map((roommate) =>
            roommate.area === previousSlug ? { ...roommate, area: nextSlug } : roommate
          )
        )
      }

      return next
    })
  }

  function addQuickSetupArea() {
    setQuickSetupAreas((prev) => [...prev, `Room ${prev.length + 1}`])
  }

  function removeQuickSetupArea(index: number) {
    setQuickSetupAreas((prev) => {
      if (prev.length === 1) return prev
      const next = prev.filter((_, idx) => idx !== index)
      setQuickSetupRoommates((roommatesPrev) =>
        roommatesPrev.map((roommate) => {
          if (roommate.area !== createSlug(prev[index], index)) return roommate
          return { ...roommate, area: createSlug(next[0], 0) }
        })
      )
      return next
    })
  }

  function addQuickSetupRoommate() {
    const firstArea = createSlug(quickSetupAreas[0] ?? "Room 1", 0)
    setQuickSetupRoommates((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", area: firstArea },
    ])
  }

  function updateQuickSetupRoommate(id: string, field: "name" | "area", value: string) {
    setQuickSetupRoommates((prev) =>
      prev.map((roommate) => (roommate.id === id ? { ...roommate, [field]: value } : roommate))
    )
  }

  function removeQuickSetupRoommate(id: string) {
    setQuickSetupRoommates((prev) => (prev.length === 1 ? prev : prev.filter((roommate) => roommate.id !== id)))
  }

  async function handleQuickSetupSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const cleanedAreas = quickSetupAreas.map((label) => label.trim()).filter(Boolean)
    if (cleanedAreas.length === 0) {
      toast.error("Add at least one area or room")
      return
    }

    const areas: AreaInput[] = cleanedAreas.map((label, index) => ({
      slug: createSlug(label, index),
      label,
    }))

    const validRoommates = quickSetupRoommates
      .map((roommate) => ({ ...roommate, name: roommate.name.trim() }))
      .filter((roommate) => roommate.name)

    if (validRoommates.length === 0) {
      toast.error("Add at least one roommate to continue")
      return
    }

    setQuickSetupSubmitting(true)

    try {
      const flat = await service.createFlat("My Flat", areas)
      await Promise.all(
        validRoommates.map((roommate) =>
          service.createRoommate(flat._id, roommate.name, roommate.area)
        )
      )

      const nextFlats = [flat]
      setFlats(nextFlats)
      setSelectedFlat(flat)
      const range = getCurrentMonthRange()
      setDateFrom(range.from)
      setDateTo(range.to)
      toast.success("Setup complete. Enter the bill details now.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create your quick setup")
    } finally {
      setQuickSetupSubmitting(false)
    }
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
    const areaOptions = quickSetupAreas.map((label, index) => ({
      slug: createSlug(label, index),
      label: label.trim() || `Room ${index + 1}`,
    }))

    return (
      <div className="mx-auto max-w-3xl space-y-6 py-6 sm:py-8">
        <div className="space-y-2 px-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Start with the bill, not the setup</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Add the rooms and roommates needed for this bill. We&apos;ll use a temporary flat name
            and the default currency for now. You can change both later from{" "}
            <Link href="/settings" className="underline underline-offset-4">
              Settings
            </Link>
            .
          </p>
          <p className="text-sm text-muted-foreground">
            No signup needed. Data stays in your browser unless you create an account.
          </p>
        </div>

        <form onSubmit={handleQuickSetupSubmit}>
          <Card className="border-border/70 shadow-none">
            <CardHeader>
              <CardTitle>Quick setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium">Areas / submeters</p>
                    <p className="text-sm text-muted-foreground">
                      Add the places you track separately, like Hall, Room 1, or Kitchen.
                    </p>
                  </div>
                  <Button type="button" variant="outline" onClick={addQuickSetupArea} className="w-full sm:w-auto">
                    Add area
                  </Button>
                </div>

                <div className="space-y-3">
                  {quickSetupAreas.map((label, index) => (
                    <div key={`${index}-${label}`} className="rounded-lg border p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                      <Input
                        value={label}
                        onChange={(e) => updateQuickSetupArea(index, e.target.value)}
                        placeholder={`Room ${index + 1}`}
                        className="w-full"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={quickSetupAreas.length === 1}
                        onClick={() => removeQuickSetupArea(index)}
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium">Roommates</p>
                    <p className="text-sm text-muted-foreground">
                      Add at least one roommate and assign them to an area.
                    </p>
                  </div>
                  <Button type="button" variant="outline" onClick={addQuickSetupRoommate} className="w-full sm:w-auto">
                    Add roommate
                  </Button>
                </div>

                <div className="space-y-3">
                  {quickSetupRoommates.map((roommate, index) => (
                    <div key={roommate.id} className="rounded-lg border p-3 sm:p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <Label htmlFor={`roommate-${roommate.id}`}>Roommate {index + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={quickSetupRoommates.length === 1}
                          onClick={() => removeQuickSetupRoommate(roommate.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-3 sm:grid sm:grid-cols-[minmax(0,1fr)_180px] sm:items-end sm:gap-3 sm:space-y-0">
                        <Input
                          id={`roommate-${roommate.id}`}
                          value={roommate.name}
                          onChange={(e) => updateQuickSetupRoommate(roommate.id, "name", e.target.value)}
                          placeholder="Enter name"
                        />
                        <div className="space-y-2">
                          <Label>Area</Label>
                          <Select
                            value={roommate.area}
                            onValueChange={(value) => updateQuickSetupRoommate(roommate.id, "area", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select area" />
                            </SelectTrigger>
                            <SelectContent>
                              {areaOptions.map((area) => (
                                <SelectItem key={area.slug} value={area.slug}>
                                  {area.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-sm text-muted-foreground">
                  Flat name defaults to <span className="font-medium text-foreground">My Flat</span>.
                  Currency stays <span className="font-medium text-foreground">{currency}</span> until you change it.
                </p>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
                  <Button type="button" variant="ghost" onClick={applySampleSetup} className="w-full sm:w-auto">
                    Use sample data
                  </Button>
                  <Button type="submit" disabled={quickSetupSubmitting} className="w-full sm:w-auto">
                    {quickSetupSubmitting ? "Preparing..." : "Continue to bill"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">New Bill</h1>
          <p className="text-muted-foreground">Enter bill details and see the split live</p>
          {isGuest && (
            <p className="text-sm text-muted-foreground">
              No signup needed. Your work stays in this browser unless you choose to save it to an account.
            </p>
          )}
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
        <Button type="submit" disabled={submitting || !preview || !dateFrom || !dateTo} className="w-full sm:w-auto">
          {submitting ? "Saving..." : "Save Bill"}
        </Button>
        {!sampleAppliedRef.current && (
          <Button type="button" variant="ghost" onClick={applySampleSetup} className="w-full sm:w-auto">
            Use sample data
          </Button>
        )}
        </div>
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
                  Enter the bill amount, units, and current readings to unlock the live split preview.
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
      <GuestConversionDialog
        open={showSavePrompt}
        onOpenChange={(open) => {
          setShowSavePrompt(open)
          if (!open && pendingSavedBillId) {
            router.push(`/bill/${pendingSavedBillId}`)
            setPendingSavedBillId(null)
          }
        }}
        source="save"
        callbackURL={pendingSavedBillId ? `/bill/${pendingSavedBillId}` : "/dashboard"}
      />
    </>
  )
}
