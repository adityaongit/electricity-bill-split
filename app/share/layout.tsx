import type { ReactNode } from "react"
import { GuestProvider } from "@/lib/guest-context"
import { CurrencyProvider } from "@/lib/currency-context"

export default function ShareLayout({ children }: { children: ReactNode }) {
  return (
    <GuestProvider>
      <CurrencyProvider>{children}</CurrencyProvider>
    </GuestProvider>
  )
}
