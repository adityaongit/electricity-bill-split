"use client"

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react"
import type { DataService } from "./data-service"
import { createApiService } from "./api-service"
import { createGuestService } from "./guest-service"
import { useSession } from "@/lib/auth-client"
import { migrateGuestData } from "./guest-migration"

interface GuestContextValue {
  isGuest: boolean
  isMigrating: boolean
  service: DataService
}

const GuestContext = createContext<GuestContextValue | null>(null)

function getGuestCookie(): boolean {
  if (typeof document === "undefined") return false
  return document.cookie.split("; ").some((c) => c === "guest=1")
}

export function GuestProvider({ children }: { children: ReactNode }) {
  const [isGuest, setIsGuest] = useState<boolean>(() => getGuestCookie())
  const [isMigrating, setIsMigrating] = useState(false)
  const { data: session, isPending } = useSession()

  useEffect(() => {
    if (!isPending && session?.user && isGuest) {
      setIsMigrating(true)
      migrateGuestData().finally(() => {
        setIsGuest(false)
        setIsMigrating(false)
      })
    }
  }, [session?.user?.id, isPending, isGuest])

  const value = useMemo<GuestContextValue>(
    () => ({
      isGuest,
      isMigrating,
      service: isGuest && !isMigrating ? createGuestService() : createApiService(),
    }),
    [isGuest, isMigrating]
  )

  return <GuestContext value={value}>{children}</GuestContext>
}

export function useDataService(): GuestContextValue {
  const ctx = useContext(GuestContext)
  if (!ctx) throw new Error("useDataService must be used within GuestProvider")
  return ctx
}
