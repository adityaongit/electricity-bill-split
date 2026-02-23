import type { ReactNode } from "react"
import type { Metadata } from "next"
import { GuestProvider } from "@/lib/guest-context"
import { CurrencyProvider } from "@/lib/currency-context"
import { AppHeader } from "@/components/layout/app-header"
import { GuestBanner } from "@/components/layout/guest-banner"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <GuestProvider>
      <CurrencyProvider>
        <div className="flex min-h-screen flex-col">
          <AppHeader />
          <GuestBanner />
          <main className="flex-1">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</div>
          </main>
        </div>
      </CurrencyProvider>
    </GuestProvider>
  )
}
