"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "@/lib/auth-client"
import { useDataService } from "@/lib/guest-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Menu,
  LayoutDashboard,
  FilePlus,
  History,
  Users,
  Settings,
  LogOut,
  UserPlus,
  ArrowRightLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/layout/logo"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bill/new", label: "New Bill", icon: FilePlus },
  { href: "/bill/history", label: "History", icon: History },
  { href: "/roommates", label: "Roommates", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
]

function NavLinks({ onClick, mobile = false }: { onClick?: () => void; mobile?: boolean }) {
  const pathname = usePathname()

  return (
    <>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        if (mobile) {
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              "text-sm font-medium transition-colors hover:text-foreground",
              isActive ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </>
  )
}

export function AppHeader() {
  const { data: session } = useSession()
  const { isGuest } = useDataService()
  const [mounted, setMounted] = useState(false)
  const [initials, setInitials] = useState("")
  const [displayName, setDisplayName] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const name = isGuest ? "Guest" : session?.user?.name ?? "Account"
    setDisplayName(name)
    const computed = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    setInitials(computed)
  }, [isGuest, session?.user?.name])

  function handleLeave() {
    if (isGuest) {
      document.cookie = "guest=; path=/; max-age=0"
      window.location.href = "/login"
    } else {
      signOut().then(() => {
        window.location.href = "/login"
      })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Logo href="/dashboard" />

          <nav className="hidden items-center gap-6 md:flex">
            <NavLinks />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden md:inline-flex gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">{mounted ? initials : ""}</AvatarFallback>
                </Avatar>
                {mounted ? displayName : ""}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isGuest ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/signup" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Sign up
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLeave} className="flex items-center gap-2">
                    <ArrowRightLeft className="h-4 w-4" />
                    Exit guest mode
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={handleLeave} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 px-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-full flex-col">
                {/* Logo section */}
                <div className="border-b px-6 py-4">
                  <Logo href="/dashboard" />
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                  <NavLinks mobile onClick={() => {}} />
                </nav>

                {/* User section */}
                <div className="border-t px-6 py-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Theme</span>
                    <ThemeToggle />
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-sm font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {isGuest ? "Guest mode" : session?.user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 space-y-2">
                    {isGuest ? (
                      <>
                        <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                          <Link href="/signup" className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Sign up
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleLeave}>
                          <ArrowRightLeft className="h-4 w-4" />
                          Exit guest mode
                        </Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleLeave}>
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
