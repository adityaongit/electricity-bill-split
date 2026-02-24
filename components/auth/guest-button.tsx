"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { trackGuestModeStart } from "@/lib/analytics"

export function GuestButton({ className }: { className?: string }) {
  const router = useRouter()

  function handleClick() {
    trackGuestModeStart()
    document.cookie = "guest=1; path=/; max-age=31536000; SameSite=Lax"
    router.push("/dashboard")
  }

  return (
    <Button variant="ghost" className={className} onClick={handleClick}>
      Continue as Guest
    </Button>
  )
}
