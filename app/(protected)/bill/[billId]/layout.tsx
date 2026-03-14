import type { ReactNode } from "react"
import type { Metadata } from "next"
import { config } from "@/lib/config"

interface BillLayoutProps {
  children: ReactNode
  params: Promise<{
    billId: string
  }>
}

export async function generateMetadata({ params }: BillLayoutProps): Promise<Metadata> {
  const { billId } = await params

  return {
    alternates: {
      canonical: `${config.app.url}/bill/${billId}`,
    },
  }
}

export default function BillLayout({ children }: { children: ReactNode }) {
  return children
}
