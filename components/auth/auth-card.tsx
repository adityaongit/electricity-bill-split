import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/layout/logo"

export function AuthCard({
  title,
  children,
  footer,
}: {
  title: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo className="text-2xl" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {children}
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      </div>
    </div>
  )
}
