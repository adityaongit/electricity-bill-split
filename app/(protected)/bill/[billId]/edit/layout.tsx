import type { ReactNode } from "react"
import type { Metadata } from "next"
import { config } from "@/lib/config"

interface EditBillLayoutProps {
  children: ReactNode
  params: Promise<{
    billId: string
  }>
}

export async function generateMetadata({ params }: EditBillLayoutProps): Promise<Metadata> {
  const { billId } = await params

  return {
    alternates: {
      canonical: `${config.app.url}/bill/${billId}/edit`,
    },
  }
}

export default function EditBillLayout({ children }: { children: ReactNode }) {
  return children
}
