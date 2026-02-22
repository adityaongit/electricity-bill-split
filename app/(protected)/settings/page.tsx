"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { useDataService } from "@/lib/guest-context"
import type { FlatData } from "@/lib/data-service"
import { Home, Trash2, Plus, User, Mail } from "lucide-react"

export default function SettingsPage() {
  const { data: session } = useSession()
  const { isGuest, service } = useDataService()
  const [flats, setFlats] = useState<FlatData[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

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
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteFlat(flat._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
