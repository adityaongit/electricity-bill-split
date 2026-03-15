"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { signIn } from "@/lib/auth-client"
import { trackOAuthClick, track } from "@/lib/analytics"

interface GuestConversionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  continueLabel?: string
  source: "save" | "share" | "history"
  callbackURL?: string
}

export function GuestConversionDialog({
  open,
  onOpenChange,
  title = "Save this work to your account",
  description = "Create an account to save bill history, sync across devices, and keep this bill safe.",
  continueLabel = "Keep using guest mode",
  source,
  callbackURL = "/dashboard",
}: GuestConversionDialogProps) {
  async function handleGoogleSignIn() {
    track("auth_prompt_convert", { source })
    trackOAuthClick("google")
    await signIn.social({ provider: "google", callbackURL })
  }

  function handleContinueGuest() {
    track("auth_prompt_continue_guest", { source })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={handleContinueGuest}>
            {continueLabel}
          </Button>
          <Button onClick={handleGoogleSignIn}>Save to cloud with Google</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
