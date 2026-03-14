import type { ReactNode } from "react"
import type { Metadata } from "next"
import { config } from "@/lib/config"

export const metadata: Metadata = {
  alternates: {
    canonical: `${config.app.url}/bill/history`,
  },
}

export default function BillHistoryLayout({ children }: { children: ReactNode }) {
  return children
}
