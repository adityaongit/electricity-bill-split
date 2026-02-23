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
import type { FlatData } from "@/lib/data-service"
import { Home, Trash2, Plus, User, Mail, CreditCard } from "lucide-react"

interface UpiDialogState {
  open: boolean
  flatId: string | null
  flatName: string
  upiId: string
  upiPayeeName: string
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const { isGuest, service } = useDataService()
  const { currency, setCurrency, isLoading: currencyLoading } = useCurrency()
  const [flats, setFlats] = useState<FlatData[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [currencyUpdating, setCurrencyUpdating] = useState(false)
  const [upiDialog, setUpiDialog] = useState<UpiDialogState>({
    open: false,
    flatId: null,
    flatName: "",
    upiId: "",
    upiPayeeName: "",
  })

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

  async function handleCreateFlat(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCreating(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    try {
      const flat = await service.createFlat(formData.get("flatName") as string)
      toast.success("Flat created")
      setFlats((prev) => [flat, ...prev])
      form.reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create flat")
    }

    setCreating(false)
  }

  async function handleDeleteFlat(id: string) {
    try {
      await service.deleteFlat(id)
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

    setUpdating(true)
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

    setUpdating(false)
  }

  function handleUpiDialogChange(open: boolean) {
    if (!open) {
      setUpiDialog({ open: false, flatId: null, flatName: "", upiId: "", upiPayeeName: "" })
    }
  }

  async function handleCurrencyChange(newCurrency: string | null) {
    if (!newCurrency) return
    setCurrencyUpdating(true)
    try {
      await setCurrency(newCurrency as any)
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
          <form onSubmit={handleCreateFlat} className="flex gap-2">
            <Input
              name="flatName"
              placeholder="e.g. My Apartment"
              required
              className="flex-1"
            />
            <Button type="submit" disabled={creating} size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              {creating ? "Creating..." : "Create"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground">
            Default areas: Hall, Room. More areas coming soon.
          </p>

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
                        {flat.areas.map((a) => a.label).join(", ")}
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
                disabled={updating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updating}>
                {updating ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
