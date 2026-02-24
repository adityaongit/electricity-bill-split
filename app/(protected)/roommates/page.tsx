"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Check, Phone, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useDataService } from "@/lib/guest-context"
import type { FlatData, RoommateData } from "@/lib/data-service"
import {
  trackRoommateAdd,
  trackRoommateRemove,
  trackRoommateUpdate,
  trackCurrencyChange,
} from "@/lib/analytics"

export default function RoommatesPage() {
  const router = useRouter()
  const { service } = useDataService()
  const [flats, setFlats] = useState<FlatData[]>([])
  const [selectedFlat, setSelectedFlat] = useState<FlatData | null>(null)
  const [roommates, setRoommates] = useState<RoommateData[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingRoommate, setEditingRoommate] = useState<RoommateData | null>(null)

  useEffect(() => {
    service.getFlats().then((data) => {
      setFlats(data)
      if (data.length > 0) setSelectedFlat(data[0])
      setLoading(false)
    })
  }, [service])

  const fetchRoommates = useCallback(
    (flatId: string) => {
      service.getRoommates(flatId).then((data) => setRoommates(data))
    },
    [service]
  )

  useEffect(() => {
    if (selectedFlat) fetchRoommates(selectedFlat._id)
  }, [selectedFlat, fetchRoommates])

  async function handleAddRoommate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedFlat) return

    const formData = new FormData(e.currentTarget)
    const phone = (formData.get("phone") as string)?.trim()
    const area = formData.get("area") as string

    try {
      await service.createRoommate(
        selectedFlat._id,
        formData.get("name") as string,
        area,
        phone || undefined
      )
      trackRoommateAdd()
      toast.success("Roommate added")
      setDialogOpen(false)
      fetchRoommates(selectedFlat._id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add roommate")
    }
  }

  async function handleRemoveRoommate(id: string) {
    try {
      await service.deleteRoommate(id)
      trackRoommateRemove()
      toast.success("Roommate removed")
      if (selectedFlat) fetchRoommates(selectedFlat._id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove roommate")
    }
  }

  function openEditDialog(roommate: RoommateData) {
    setEditingRoommate(roommate)
    setEditDialogOpen(true)
  }

  async function handleUpdateRoommate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingRoommate) return

    const formData = new FormData(e.currentTarget)
    const phone = (formData.get("phone") as string)?.trim()
    try {
      await service.updateRoommate(editingRoommate._id, {
        name: formData.get("name") as string,
        area: formData.get("area") as string,
        phone: phone || undefined,
      })
      trackRoommateUpdate()
      toast.success("Roommate updated")
      setEditDialogOpen(false)
      setEditingRoommate(null)
      if (selectedFlat) fetchRoommates(selectedFlat._id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update roommate")
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (flats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold">No flat set up yet</h2>
        <p className="mt-2 text-muted-foreground">
          Go to Settings to create your flat first.
        </p>
        <Button className="mt-4" asChild>
          <a href="/settings">Go to Settings</a>
        </Button>
      </div>
    )
  }

  const grouped = selectedFlat?.areas.map((area) => ({
    ...area,
    roommates: roommates.filter((r) => r.area === area.slug),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roommates</h1>
          <p className="text-muted-foreground">Manage roommates for your flat</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Roommate</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Roommate</DialogTitle>
              <DialogDescription>Add a new roommate to your flat.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddRoommate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="e.g., Rahul" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
                <Select name="area" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedFlat?.areas.map((a) => (
                      <SelectItem key={a.slug} value={a.slug}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">WhatsApp Number (optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="e.g., 9876543210"
                  pattern="[0-9]{10}"
                  title="Enter 10-digit phone number"
                />
                <p className="text-xs text-muted-foreground">
                  Add WhatsApp number for direct bill sharing
                </p>
              </div>
              <Button type="submit" className="w-full">
                Add
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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

      {grouped?.map((area) => (
        <Card key={area.slug}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {area.label}
              <Badge variant="secondary">{area.roommates.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {area.roommates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No roommates in this area yet.</p>
            ) : (
              <div className="space-y-3">
                {area.roommates.map((r) => (
                  <div key={r._id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{r.name}</span>
                      {r.phone && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{r.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(r)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        onClick={() => handleRemoveRoommate(r._id)}
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
      ))}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Roommate</DialogTitle>
            <DialogDescription>Update roommate details.</DialogDescription>
          </DialogHeader>
          {editingRoommate && (
            <form onSubmit={handleUpdateRoommate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingRoommate.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-area">Area</Label>
                <Select name="area" defaultValue={editingRoommate.area} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedFlat?.areas.map((a) => (
                      <SelectItem key={a.slug} value={a.slug}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">WhatsApp Number</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  type="tel"
                  defaultValue={editingRoommate.phone || ""}
                  placeholder="e.g., 9876543210"
                  pattern="[0-9]{10}"
                  title="Enter 10-digit phone number"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to remove phone number
                </p>
              </div>
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Button onClick={() => router.back()} className="w-full sm:w-auto" size="lg">
        <Check className="mr-2 h-4 w-4" />
        Done
      </Button>
    </div>
  )
}
