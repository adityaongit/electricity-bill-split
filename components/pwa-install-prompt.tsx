"use client"

import { useEffect, useRef, useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { trackPwaInstall } from "@/lib/analytics"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PwaInstallButton() {
  const [isMobile, setIsMobile] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [canInstallNatively, setCanInstallNatively] = useState(false)
  const [open, setOpen] = useState(false)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    if (!mobile) return

    setIsMobile(true)
    setIsIos(/iPhone|iPad|iPod/i.test(navigator.userAgent))

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {})
    }

    // Pick up event captured before React mounted (see layout.tsx <head> script)
    const w = window as typeof window & { __pwaPrompt?: BeforeInstallPromptEvent }
    if (w.__pwaPrompt) {
      deferredPrompt.current = w.__pwaPrompt
      setCanInstallNatively(true)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      setCanInstallNatively(true)
      ;(window as typeof w).__pwaPrompt = e as BeforeInstallPromptEvent
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  async function handleInstall() {
    if (deferredPrompt.current) {
      trackPwaInstall("native")
      setOpen(false)
      await deferredPrompt.current.prompt()
      deferredPrompt.current = null
      setCanInstallNatively(false)
    }
  }

  function handleGotIt() {
    trackPwaInstall(isIos ? "manual_ios" : "manual_android")
    setOpen(false)
  }

  function getDescription() {
    if (isIos) {
      return 'Tap the Share button (□↑) in Safari, then select "Add to Home Screen".'
    }
    if (canInstallNatively) {
      return "Install SplitWatt on your home screen for quick access."
    }
    // Android but no native prompt — show manual instructions
    return 'Tap the browser menu (⋮) in Chrome, then select "Add to Home Screen" or "Install app".'
  }

  if (!isMobile) return null

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Download className="h-4 w-4 mr-2" />
        Install App
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add SplitWatt to Home Screen</AlertDialogTitle>
            <AlertDialogDescription>{getDescription()}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {canInstallNatively && !isIos ? (
              <AlertDialogAction onClick={handleInstall}>Install</AlertDialogAction>
            ) : (
              <AlertDialogAction onClick={handleGotIt}>Got it</AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
