"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Check, Phone, Edit2, UserPlus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="rounded-xl border overflow-hidden">
          <div className="bg-muted/40 px-6 py-3 border-b grid grid-cols-[1fr_auto_auto_auto] gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-4 w-20" />)}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4 border-b last:border-b-0 flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-32 flex-1" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
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

  const totalRoommates = roommates.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Roommates</h1>
          <p className="text-muted-foreground">
            {totalRoommates > 0
              ? `${totalRoommates} roommate${totalRoommates !== 1 ? "s" : ""} across ${selectedFlat?.areas.length ?? 0} area${(selectedFlat?.areas.length ?? 0) !== 1 ? "s" : ""}`
              : "Manage roommates for your flat"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {flats.length > 1 && (
            <Select
              value={selectedFlat?._id}
              onValueChange={(id) => setSelectedFlat(flats.find((f) => f._id === id) ?? null)}
            >
              <SelectTrigger className="w-44">
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-1.5" />
                Add Roommate
              </Button>
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
      </div>

      {/* Desktop table layout */}
      <div className="hidden md:block rounded-xl border overflow-hidden">
        {grouped?.map((area, areaIdx) => (
          <div key={area.slug}>
            {/* Area section header */}
            <div className={`flex items-center justify-between px-6 py-3 bg-muted/40 ${areaIdx > 0 ? "border-t" : ""}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{area.label}</span>
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-muted px-1.5 text-xs font-medium tabular-nums text-muted-foreground">
                  {area.roommates.length}
                </span>
              </div>
            </div>

            {area.roommates.length === 0 ? (
              <div className="px-6 py-5 border-t">
                <p className="text-sm text-muted-foreground">No roommates in this area yet.</p>
              </div>
            ) : (
              <table className="w-full border-t">
                <thead>
                  <tr className="border-b bg-background">
                    <th className="text-left px-6 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider w-[40%]">
                      Name
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      WhatsApp
                    </th>
                    <th className="w-24 px-6 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {area.roommates.map((r) => (
                    <tr key={r._id} className="group hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-primary">
                              {r.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-sm">{r.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {r.phone ? (
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            <span>{r.phone}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openEditDialog(r)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveRoommate(r._id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-4">
        {grouped?.map((area) => (
          <div key={area.slug} className="rounded-xl border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/40 border-b">
              <span className="text-sm font-semibold">{area.label}</span>
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-muted px-1.5 text-xs font-medium tabular-nums text-muted-foreground">
                {area.roommates.length}
              </span>
            </div>
            {area.roommates.length === 0 ? (
              <div className="px-4 py-4">
                <p className="text-sm text-muted-foreground">No roommates in this area yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {area.roommates.map((r) => (
                  <div key={r._id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-primary">
                          {r.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-sm">{r.name}</span>
                        {r.phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Phone className="h-3 w-3" />
                            <span>{r.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEditDialog(r)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveRoommate(r._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

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
