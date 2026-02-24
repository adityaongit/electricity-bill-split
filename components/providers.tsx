"use client"

import type { ReactNode } from "react"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { AnalyticsProvider } from "@/components/providers/analytics-provider"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AnalyticsProvider>
        {children}
      </AnalyticsProvider>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  )
}
