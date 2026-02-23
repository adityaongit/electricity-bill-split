"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { DEFAULT_CURRENCY, type CurrencyCode } from "./currency"
import { authClient } from "./auth-client"

interface CurrencyContextValue {
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => Promise<void>
  isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadCurrencyPreference() {
      try {
        const session = await authClient.getSession()
        if (session.data) {
          // Auth mode: fetch from API
          const res = await fetch("/api/user/settings")
          if (res.ok) {
            const data = await res.json()
            if (data.currency) {
              setCurrencyState(data.currency)
            }
          }
        } else {
          // Guest mode: fetch from IndexedDB
          const { openGuestDb } = await import("./guest-db")
          const db = await openGuestDb()
          const setting = await db.get("user_settings", "currency")
          if (setting) {
            setCurrencyState(setting.value as CurrencyCode)
          }
        }
      } catch (error) {
        console.error("Failed to load currency preference:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCurrencyPreference()
  }, [])

  async function setCurrency(code: CurrencyCode) {
    try {
      const session = await authClient.getSession()
      if (session.data) {
        // Auth mode: save via API
        const res = await fetch("/api/user/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currency: code }),
        })
        if (!res.ok) throw new Error("Failed to save currency preference")
      } else {
        // Guest mode: save to IndexedDB
        const { openGuestDb } = await import("./guest-db")
        const db = await openGuestDb()
        await db.put("user_settings", {
          key: "currency",
          value: code,
          updatedAt: new Date().toISOString(),
        })
      }
      setCurrencyState(code)
    } catch (error) {
      console.error("Failed to save currency preference:", error)
      throw error
    }
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider")
  }
  return context
}
