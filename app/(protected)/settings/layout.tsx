import type { ReactNode } from "react"
import type { Metadata } from "next"
import { config } from "@/lib/config"

export const metadata: Metadata = {
  alternates: {
    canonical: `${config.app.url}/settings`,
  },
}

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return children
}
