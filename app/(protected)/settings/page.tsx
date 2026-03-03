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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useDataService } from "@/lib/guest-context"
import { useCurrency } from "@/lib/currency-context"
import { SUPPORTED_CURRENCIES } from "@/lib/currency"
import type { FlatData, AreaInput } from "@/lib/data-service"
import { Home, Trash2, Plus, User, Mail, CreditCard, ChevronRight, AlertTriangle, Check } from "lucide-react"
import { useRouter } from "next/navigation"
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

type CreateFlatStep = 1 | 2 | 3 | 'success'

function CreateFlatDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (flat: FlatData) => void
}) {
  const router = useRouter()
  const { service } = useDataService()
  const [step, setStep] = useState<CreateFlatStep>(1)
  const [creating, setCreating] = useState(false)
  const [createdFlat, setCreatedFlat] = useState<FlatData | null>(null)

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
    setCreatedFlat(null)
    setStep(1 as CreateFlatStep)
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      resetForm()
    }
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
      setCreatedFlat(flat)
      onSuccess(flat)
      setStep('success')
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
                    {rt.preset === "other" ? (
                      <Input
                        placeholder="Enter room type..."
                        className="flex-1"
                        value={rt.custom || ""}
                        onChange={(e) => {
                          const updated = [...roomTypes]
                          updated[i] = { ...rt, custom: e.target.value }
                          setRoomTypes(updated)
                        }}
                        autoFocus
                      />
                    ) : (
                      <>
                        <Select value={rt.preset} onValueChange={(value) => {
                          const updated = [...roomTypes]
                          updated[i] = { ...rt, preset: value, custom: undefined }
                          setRoomTypes(updated)
                        }}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {ROOM_TYPE_PRESETS.map((preset) => (
                              <SelectItem key={preset.value} value={preset.value}>
                                {preset.label}
                              </SelectItem>
                            ))}
                            <SelectItem value="other">Custom...</SelectItem>
                          </SelectContent>
                        </Select>
                      </>
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

        {step === 'success' && (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center text-center py-4">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600 dark:text-green-500" />
              </div>
              <h3 className="text-lg font-semibold">Flat Created Successfully!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                "{createdFlat?.name}" is ready to use
              </p>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false)
                  resetForm()
                }}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onOpenChange(false)
                  resetForm()
                  router.push('/roommates')
                }}
                className="w-full sm:w-auto"
              >
                Add Roommates
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onOpenChange(false)
                  resetForm()
                  router.push('/bill/new')
                }}
                className="w-full sm:w-auto"
              >
                Create Bill
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
  const [clearDataDialogOpen, setClearDataDialogOpen] = useState(false)
  const [clearingData, setClearingData] = useState(false)

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

  async function handleClearGuestData() {
    setClearingData(true)
    try {
      if (service.clearAllData) {
        await service.clearAllData()
        toast.success("All data cleared successfully")
        setFlats([])
      } else {
        toast.error("This feature is only available in guest mode")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to clear data")
    }
    setClearingData(false)
    setClearDataDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and flats</p>
      </div>

      {/* Two-column layout on lg+ */}
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Left column: Profile + Preferences */}
        <div className="space-y-6">
          {/* Profile card */}
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-base truncate">{displayName}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">{displayEmail}</span>
                  </div>
                  {isGuest && (
                    <span className="inline-flex items-center mt-2 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      Guest mode
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
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
                  Your preferred currency for displaying amounts
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Danger zone (guest only) */}
          {isGuest && (
            <Card className="border-destructive/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-destructive text-base">
                  <AlertTriangle className="h-4 w-4" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete all flats, roommates, and bills stored locally in guest mode.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setClearDataDialogOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Clear All Guest Data
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: Flats */}
        <Card className="h-fit">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base">Your Flats</CardTitle>
            <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New Flat
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-3">
                {[1,2].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : flats.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <Home className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium">No flats yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create a flat to get started
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border rounded-lg border overflow-hidden">
                {flats.map((flat) => (
                  <div
                    key={flat._id}
                    className="flex items-center gap-4 px-4 py-3.5 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Home className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{flat.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {flat.areas.length} {flat.areas.length === 1 ? "room" : "rooms"}
                        {flat.areas.map(a => a.label).join(", ") && (
                          <span className="ml-1 text-muted-foreground/60">
                            · {flat.areas.map(a => a.label).join(", ")}
                          </span>
                        )}
                      </p>
                      {flat.upiId && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                          <CreditCard className="h-3 w-3" />
                          {flat.upiId}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openUpiDialog(flat)}
                        title="Edit UPI settings"
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
      </div>

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

      <AlertDialog open={clearDataDialogOpen} onOpenChange={setClearDataDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Guest Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your flats, roommates, and bills stored in the browser.
              This action cannot be undone. You will need to create a new flat to continue using the app.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearingData}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearGuestData}
              disabled={clearingData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {clearingData ? "Clearing..." : "Clear All Data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
