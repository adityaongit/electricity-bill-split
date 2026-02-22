"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import type { DataService } from "./data-service"
import { createApiService } from "./api-service"
import { createGuestService } from "./guest-service"

interface GuestContextValue {
  isGuest: boolean
  service: DataService
}

const GuestContext = createContext<GuestContextValue | null>(null)

function getGuestCookie(): boolean {
  if (typeof document === "undefined") return false
  return document.cookie.split("; ").some((c) => c === "guest=1")
}

export function GuestProvider({ children }: { children: ReactNode }) {
  const value = useMemo<GuestContextValue>(() => {
    const isGuest = getGuestCookie()
    return {
      isGuest,
      service: isGuest ? createGuestService() : createApiService(),
    }
  }, [])

  return <GuestContext value={value}>{children}</GuestContext>
}

export function useDataService(): GuestContextValue {
  const ctx = useContext(GuestContext)
  if (!ctx) throw new Error("useDataService must be used within GuestProvider")
  return ctx
}
