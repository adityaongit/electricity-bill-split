"use client"

import { useEffect, useRef, useState } from "react"
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

const STORAGE_KEY = "pwa-install-dismissed"

export function PwaInstallPrompt() {
  const [open, setOpen] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Don't show if already dismissed or installed
    if (localStorage.getItem(STORAGE_KEY)) return

    // Only on mobile
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    if (!mobile) return

    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    setIsIos(ios)

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {})
    }

    // Android/Chrome: capture the install event
    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
    }
    window.addEventListener("beforeinstallprompt", handler)

    // Show dialog after 10 seconds
    const timer = setTimeout(() => {
      // For iOS always show (no beforeinstallprompt); for Android wait for event
      if (ios || deferredPrompt.current) {
        setOpen(true)
      }
    }, 10000)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, "1")
    setOpen(false)
  }

  async function handleInstall() {
    localStorage.setItem(STORAGE_KEY, "1")
    setOpen(false)
    if (deferredPrompt.current) {
      await deferredPrompt.current.prompt()
      deferredPrompt.current = null
    }
    // iOS: nothing to do here — instructions shown in dialog body
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add SplitWatt to Home Screen</AlertDialogTitle>
          <AlertDialogDescription>
            {isIos
              ? 'Tap the Share button in Safari, then select "Add to Home Screen" to install SplitWatt as an app.'
              : "Install SplitWatt on your home screen for quick access — works offline too."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDismiss}>Not now</AlertDialogCancel>
          {!isIos && (
            <AlertDialogAction onClick={handleInstall}>Install</AlertDialogAction>
          )}
          {isIos && (
            <AlertDialogAction onClick={handleDismiss}>Got it</AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
