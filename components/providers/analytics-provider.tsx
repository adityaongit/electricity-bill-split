"use client"

import { useEffect, type ReactNode } from "react"

interface AnalyticsProviderProps {
  children: ReactNode
}

/**
 * Analytics Provider Component
 *
 * Client-side provider that ensures Umami is loaded before any tracking occurs.
 * Wraps the app to provide analytics functionality with error handling.
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useEffect(() => {
    // Verify Umami script is loaded
    const checkUmami = () => {
      if (typeof window !== "undefined" && window.umami) {
        console.log("[Analytics] Umami loaded successfully")
        return true
      }
      return false
    }

    // Check immediately
    if (!checkUmami()) {
      // If not loaded immediately, check again after a short delay
      const timeoutId = setTimeout(() => {
        if (!checkUmami()) {
          console.warn("[Analytics] Umami script not detected. Analytics may not work.")
        }
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [])

  return <>{children}</>
}
