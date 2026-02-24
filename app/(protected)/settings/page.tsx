"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useDataService } from "@/lib/guest-context"
import { useCurrency } from "@/lib/currency-context"
import { SUPPORTED_CURRENCIES } from "@/lib/currency"
import type { FlatData, AreaInput } from "@/lib/data-service"
import { Home, Trash2, Plus, User, Mail, CreditCard, ChevronRight } from "lucide-react"
import {
  trackFlatCreate,
  trackFlatDelete,
  trackCurrencyChange,
} from "@/lib/analytics"

// Room type presets
const ROOM_TYPE_PRESETS = [
  { value: "hall", label: "Hall" },
  { value: "living-room", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "balcony", label: "Balcony" },
  { value: "study", label: "Study/Office" },
  { value: "store", label: "Store Room" },
]

interface UpiDialogState {
  open: boolean
  flatId: string | null
  flatName: string
  upiId: string
  upiPayeeName: string
}

type CreateFlatStep = 1 | 2 | 3

function CreateFlatDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (flat: FlatData) => void
}) {
  const { service } = useDataService()
  const [step, setStep] = useState<CreateFlatStep>(1)
  const [creating, setCreating] = useState(false)

  // Step 1: Flat name
  const [flatName, setFlatName] = useState("")

  // Step 2: Number of rooms
  const [numRooms, setNumRooms] = useState<number>(2)

  // Step 3: Room types
  const [roomTypes, setRoomTypes] = useState<Array<{ preset: string; custom?: string }>>([])

  function resetForm() {
    setFlatName("")
    setNumRooms(2)
    setRoomTypes([])
    setStep(1)
  }

  function handleOpenChange(open: boolean) {
    if (!open) resetForm()
    onOpenChange(open)
  }

  function handleNextStep1() {
    if (!flatName.trim()) {
      toast.error("Please enter a flat name")
      return
    }
    setStep(2)
  }

  function handleNextStep2() {
    if (numRooms < 1) {
      toast.error("Please enter at least 1 room")
      return
    }
    // Initialize room types with defaults
    setRoomTypes(
      Array.from({ length: numRooms }, (_, i) => ({
        preset: i === 0 ? "hall" : i === 1 ? "bedroom" : "bedroom",
      }))
    )
    setStep(3)
  }

  async function handleCreate() {
    setCreating(true)
    try {
      const areas: AreaInput[] = roomTypes.map((rt, i) => ({
        slug: rt.custom ? `custom-${i}` : rt.preset,
        label: rt.custom || ROOM_TYPE_PRESETS.find((p) => p.value === rt.preset)?.label || `Room ${i + 1}`,
      }))

      const flat = await service.createFlat(flatName.trim(), areas)
      trackFlatCreate()
      toast.success("Flat created successfully!")
      resetForm()
      onOpenChange(false)
      onSuccess(flat)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create flat")
    }
    setCreating(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Flat</DialogTitle>
          <DialogDescription>
            {step === 1 && "Enter your flat name to get started"}
            {step === 2 && "How many rooms/submeters does your flat have?"}
            {step === 3 && "Configure the room types for each submeter"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="flatName">Flat Name</Label>
              <Input
                id="flatName"
                placeholder="e.g., My Apartment, 2BHK Flat"
                value={flatName}
                onChange={(e) => setFlatName(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleNextStep1}>
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="numRooms">Number of Rooms/Submeters</Label>
              <Input
                id="numRooms"
                type="number"
                min={1}
                max={20}
                value={numRooms}
                onChange={(e) => setNumRooms(parseInt(e.target.value) || 1)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Enter the total number of rooms with separate electricity submeters
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="button" onClick={handleNextStep2}>
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {roomTypes.map((rt, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-lg border bg-muted/20">
                  <span className="text-sm font-medium w-20 shrink-0">Room {i + 1}</span>
                  <div className="flex-1 flex gap-2">
                    <select
                      className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                      value={rt.preset}
                      onChange={(e) => {
                        const new = [...roomTypes]
                        new[i] = { ...rt, preset: e.target.value, custom: undefined }
                        setRoomTypes(new)
                      }}
                    >
                      {ROOM_TYPE_PRESETS.map((preset) => (
                        <option key={preset.value} value={preset.value}>
                          {preset.label}
                        </option>
                      ))}
                      <option value="other">Other...</option>
                    </select>
                    {rt.preset === "other" && (
                      <Input
                        placeholder="Custom type"
                        className="flex-1"
                        value={rt.custom || ""}
                        onChange={(e) => {
                          const new = [...roomTypes]
                          new[i] = { ...rt, custom: e.target.value }
                          setRoomTypes(new)
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(2)} className="w-full sm:w-auto">
                Back
              </Button>
              <Button
                type="button"
                onClick={handleCreate}
                disabled={creating || roomTypes.some((rt) => rt.preset === "other" && !rt.custom?.trim())}
                className="w-full sm:w-auto"
              >
                {creating ? "Creating..." : "Create Flat"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const { isGuest, service } = useDataService()
  const { currency, setCurrency, isLoading: currencyLoading } = useCurrency()
  const [flats, setFlats] = useState<FlatData[]>([])
  const [loading, setLoading] = useState(true)
  const [currencyUpdating, setCurrencyUpdating] = useState(false)
  const [upiDialog, setUpiDialog] = useState<UpiDialogState>({
    open: false,
    flatId: null,
    flatName: "",
    upiId: "",
    upiPayeeName: "",
  })
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  useEffect(() => {
    service.getFlats().then((data) => {
      setFlats(data)
      setLoading(false)
    })
  }, [service])

  const displayName = isGuest ? "Guest" : (session?.user?.name ?? "—")
  const displayEmail = isGuest ? "Guest mode — data stored locally" : (session?.user?.email ?? "—")
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  function handleFlatCreated(flat: FlatData) {
    setFlats((prev) => [flat, ...prev])
  }

  async function handleDeleteFlat(id: string) {
    try {
      await service.deleteFlat(id)
      trackFlatDelete()
      toast.success("Flat deleted")
      setFlats((prev) => prev.filter((f) => f._id !== id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete flat")
    }
  }

  function openUpiDialog(flat: FlatData) {
    setUpiDialog({
      open: true,
      flatId: flat._id,
      flatName: flat.name,
      upiId: flat.upiId ?? "",
      upiPayeeName: flat.upiPayeeName ?? "",
    })
  }

  async function handleSaveUpi(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!upiDialog.flatId) return

    const updating = true
    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const updated = await service.updateFlat(upiDialog.flatId, {
        upiId: formData.get("upiId") as string || undefined,
        upiPayeeName: formData.get("upiPayeeName") as string || undefined,
      })
      toast.success("UPI settings saved")
      setFlats((prev) => prev.map((f) => f._id === upiDialog.flatId ? updated : f))
      setUpiDialog({ ...upiDialog, open: false })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save UPI settings")
    }
  }

  function handleUpiDialogChange(open: boolean) {
    if (!open) {
      setUpiDialog({ open: false, flatId: null, flatName: "", upiId: "", upiPayeeName: "" })
    }
  }

  async function handleCurrencyChange(newCurrency: string | null) {
    if (!newCurrency) return
    const oldCurrency = currency
    setCurrencyUpdating(true)
    try {
      await setCurrency(newCurrency as any)
      trackCurrencyChange(oldCurrency, newCurrency)
      toast.success("Currency preference updated")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update currency")
    }
    setCurrencyUpdating(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and flats</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-lg font-medium">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">{displayName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{displayEmail}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            {currencyLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Combobox
                items={SUPPORTED_CURRENCIES.map((c) => c.code)}
                value={currency}
                onValueChange={handleCurrencyChange}
                itemToStringValue={(code) => {
                  const config = SUPPORTED_CURRENCIES.find((c) => c.code === code)
                  return config ? `${config.symbol} ${config.name}` : code
                }}
                disabled={currencyUpdating}
              >
                <ComboboxInput
                  id="currency"
                  placeholder="Search currency..."
                  disabled={currencyUpdating}
                />
                <ComboboxContent>
                  <ComboboxEmpty>No currency found.</ComboboxEmpty>
                  <ComboboxList>
                    {(code) => {
                      const config = SUPPORTED_CURRENCIES.find((c) => c.code === code)
                      if (!config) return null
                      return (
                        <ComboboxItem key={code} value={code}>
                          <div className="flex items-center gap-2 flex-1">
                            <span className="font-medium w-6">{config.symbol}</span>
                            <span className="text-muted-foreground">{config.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{config.code}</span>
                        </ComboboxItem>
                      )
                    }}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            )}
            <p className="text-xs text-muted-foreground">
              Search and select your preferred currency for displaying amounts
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Flats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => setCreateDialogOpen(true)} className="w-full gap-1.5">
            <Plus className="h-4 w-4" />
            Create New Flat
          </Button>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : flats.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Home className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                No flats yet. Create one above to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {flats.map((flat) => (
                <div
                  key={flat._id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                      <Home className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{flat.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {flat.areas.length === 1
                          ? `${flat.areas.length} room`
                          : `${flat.areas.length} rooms`}
                      </p>
                      {flat.upiId && (
                        <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {flat.upiId}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openUpiDialog(flat)}
                      title="Edit UPI settings"
                    >
                      <CreditCard className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteFlat(flat._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateFlatDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleFlatCreated}
      />

      <Dialog open={upiDialog.open} onOpenChange={handleUpiDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>UPI Payment Settings</DialogTitle>
            <DialogDescription>
              Configure UPI payment details for &quot;{upiDialog.flatName}&quot;. Roommates will use these details to pay their share.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveUpi} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upiId">UPI ID</Label>
              <Input
                id="upiId"
                name="upiId"
                placeholder="e.g., name@okaxis or mobile@paytm"
                defaultValue={upiDialog.upiId}
                pattern="[a-zA-Z0-9.\-_]{3,30}@[a-zA-Z0-9.\-]{2,30}"
                title="Enter a valid UPI ID (e.g., name@upi)"
              />
              <p className="text-xs text-muted-foreground">
                Enter UPI ID in format: username@provider (e.g., name@okaxis)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="upiPayeeName">Payee Name</Label>
              <Input
                id="upiPayeeName"
                name="upiPayeeName"
                placeholder="e.g., Rahul Kumar"
                defaultValue={upiDialog.upiPayeeName}
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                Name that will appear in the UPI payment app
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleUpiDialogChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
