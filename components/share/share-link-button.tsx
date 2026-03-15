"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Share2, Copy, CheckCircle2 } from "lucide-react"
import { trackAuthPromptShown, trackShareLinkGenerated } from "@/lib/analytics"
import { config } from "@/lib/config"
import { useDataService } from "@/lib/guest-context"
import { GuestConversionDialog } from "@/components/auth/guest-conversion-dialog"

interface ShareLinkButtonProps {
  billId: string
  disabled?: boolean
}

export function ShareLinkButton({ billId, disabled }: ShareLinkButtonProps) {
  const { isGuest } = useDataService()
  const [open, setOpen] = useState(false)
  const [promptOpen, setPromptOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [expirationDays, setExpirationDays] = useState(String(config.share.defaultExpirationDays))
  const [error, setError] = useState<string | null>(null)

  async function generateShareLink() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/share/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billId, expirationDays: parseInt(expirationDays) }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error)
        return
      }

      const fullUrl = `${window.location.origin}${data.data.shareUrl}`
      setShareUrl(fullUrl)
      trackShareLinkGenerated(billId, parseInt(expirationDays))
    } catch {
      setError("Failed to generate share link")
    } finally {
      setLoading(false)
    }
  }

  async function copyToClipboard() {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError("Failed to copy to clipboard")
    }
  }

  const expirationOptions = [
    { value: "1", label: "1 day" },
    { value: "7", label: "7 days" },
    { value: "30", label: "30 days" },
    { value: "90", label: "90 days" },
  ]

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={(event) => {
              if (!isGuest) return
              event.preventDefault()
              trackAuthPromptShown("share")
              setPromptOpen(true)
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Link
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Split Link</DialogTitle>
            <DialogDescription>
              Generate a read-only link to share this bill with your roommates.
            </DialogDescription>
          </DialogHeader>

          {shareUrl ? (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 text-green-400 bg-green-950/50 border border-green-800 p-3 rounded-lg">
                <CheckCircle2 className="h-5 w-5" />
                <p className="text-sm font-medium">Share link generated successfully!</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="share-url">Share Link</Label>
                <div className="flex gap-2">
                  <Input
                    id="share-url"
                    value={shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button onClick={copyToClipboard} size="sm">
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Link expires in {expirationDays} {parseInt(expirationDays) === 1 ? "day" : "days"}
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {error && (
                <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>
              )}

              <div className="space-y-2">
                <Label>Link expires in:</Label>
                <div className="grid grid-cols-2 gap-2">
                  {expirationOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={expirationDays === option.value ? "default" : "outline"}
                      onClick={() => setExpirationDays(option.value)}
                      className="justify-start"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {shareUrl ? (
              <Button onClick={() => setOpen(false)}>Done</Button>
            ) : (
              <Button onClick={generateShareLink} disabled={loading}>
                {loading ? "Generating..." : "Generate Link"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <GuestConversionDialog
        open={promptOpen}
        onOpenChange={setPromptOpen}
        source="share"
        title="Create an account to share permanent links"
        description="Save this bill to an account to generate share links, sync across devices, and keep your history safe."
      />
    </>
  )
}
