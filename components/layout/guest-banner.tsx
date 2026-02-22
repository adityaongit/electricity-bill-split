"use client"

import Link from "next/link"
import { useDataService } from "@/lib/guest-context"
import { useEffect, useState } from "react"

export function GuestBanner() {
  const { isGuest } = useDataService()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isGuest) return null

  return (
    <div className="border-b border-border bg-muted/50 px-4 py-2 text-center text-sm text-muted-foreground">
      You&apos;re using guest mode — data is stored locally in this browser.{" "}
      <Link href="/signup" className="font-medium text-primary hover:text-primary/80 underline underline-offset-2">
        Sign up
      </Link>{" "}
      to save it to the cloud.
    </div>
  )
}
