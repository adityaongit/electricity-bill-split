"use client"

import { useState } from "react"
import { useDataService } from "@/lib/guest-context"
import { useEffect } from "react"
import { signIn } from "@/lib/auth-client"
import { trackOAuthClick } from "@/lib/analytics"

export function GuestBanner() {
  const { isGuest, isMigrating } = useDataService()
  const [mounted, setMounted] = useState(false)
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleGoogleSignIn() {
    setSigningIn(true)
    trackOAuthClick("google")
    await signIn.social({ provider: "google", callbackURL: "/dashboard" })
    setSigningIn(false)
  }

  if (!mounted) return null

  if (isMigrating) {
    return (
      <div className="border-b border-border bg-blue-50 dark:bg-blue-950/30 px-4 py-2 text-center text-sm text-blue-700 dark:text-blue-300">
        Migrating your data, please wait...
      </div>
    )
  }

  if (!isGuest) return null

  return (
    <div className="border-b border-border bg-muted/50 px-4 py-2 text-center text-sm text-muted-foreground">
      You&apos;re using guest mode — data is stored locally.{" "}
      <button
        onClick={handleGoogleSignIn}
        disabled={signingIn}
        className="font-medium text-primary hover:text-primary/80 underline underline-offset-2 disabled:opacity-50"
      >
        {signingIn ? "Redirecting..." : "Save to cloud with Google"}
      </button>
    </div>
  )
}
