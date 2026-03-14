"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { trackCTAClick, trackGuestModeStart } from "@/lib/analytics"
import { useSession } from "@/lib/auth-client"

interface TrackedButtonProps extends React.ComponentProps<typeof Button> {
  href: string
  children: React.ReactNode
  location: "hero" | "bottom"
}

export function TrackedButton({
  href,
  children,
  location,
  onClick,
  ...props
}: TrackedButtonProps) {
  const router = useRouter()
  const { data: session } = useSession()

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event)
    if (event.defaultPrevented) return

    trackCTAClick(location)

    if (href === "/signup") {
      if (!session?.user) {
        trackGuestModeStart()
        document.cookie = "guest=1; path=/; max-age=31536000; SameSite=Lax"
      }

      router.push("/bill/new")
      return
    }

    router.push(href)
  }

  return (
    <Button {...props} onClick={handleClick}>
      {children}
    </Button>
  )
}
