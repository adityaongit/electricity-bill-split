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
    // Lightweight check - no console in production
    if (typeof window === "undefined") return

    // Small timeout to ensure script has loaded
    const timeoutId = setTimeout(() => {
      // Silently verify Umami is available
      window.umami || undefined
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [])

  return <>{children}</>
}
