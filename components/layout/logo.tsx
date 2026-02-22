import { Zap } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function Logo({
  href = "/",
  className,
}: {
  href?: string
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-1.5 font-bold text-xl group", className)}
    >
      <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
        <Zap className="h-4 w-4 fill-current" />
      </span>
      <span className="tracking-tight">
        Split<span className="text-primary">Watt</span>
      </span>
    </Link>
  )
}
