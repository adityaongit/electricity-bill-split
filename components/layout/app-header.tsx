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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
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

function NavLinks({
  onClick,
  mobile = false,
}: {
  onClick?: () => void
  mobile?: boolean
}) {
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
                "group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <span className="absolute inset-0 rounded-xl ring-2 ring-primary/50 ring-offset-2 ring-offset-background" />
              )}
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
              isActive ? "text-foreground" : "text-muted-foreground",
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    setMobileMenuOpen(false)
    if (isGuest) {
      document.cookie = "guest=; path=/; max-age=0"
      window.location.href = "/login"
    } else {
      signOut().then(() => {
        window.location.href = "/login"
      })
    }
  }

  function handleNavClick() {
    setMobileMenuOpen(false)
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

          {/* Mobile Sidebar */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden h-9 w-9 p-0"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:w-80 flex flex-col p-0 gap-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
            >
              {/* Accessibility: Hidden Title and Description */}
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Main navigation menu with quick access to dashboard, bills, roommates, and settings
              </SheetDescription>

              {/* Header Section with Logo */}
              <div className="flex flex-col border-b px-6 py-5 bg-muted/30 shrink-0">
                <div className="flex items-center gap-3">
                  <Logo href="/dashboard" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">Navigate your bills</p>
              </div>

              {/* Navigation Items - scrollable */}
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                <NavLinks mobile onClick={handleNavClick} />
              </nav>

              {/* Bottom User Section - fixed at bottom */}
              <div className="border-t bg-muted/20 px-4 py-5 space-y-5 shrink-0">
                {/* Theme Toggle Row */}
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm font-medium">Appearance</span>
                  <ThemeToggle />
                </div>

                {/* User Profile Card */}
                <div className="flex items-center gap-3 rounded-xl bg-background p-3 border shadow-sm">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/10 shrink-0">
                    <AvatarFallback className="text-sm font-semibold bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {isGuest ? "Guest mode" : session?.user?.email}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  {isGuest ? (
                    <>
                      <Button
                        variant="outline"
                        size="default"
                        className="w-full justify-start gap-2 h-11 font-medium"
                        asChild
                      >
                        <Link href="/signup" className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          Create account
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="default"
                        className="w-full justify-start gap-2 h-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-medium"
                        onClick={handleLeave}
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                        Exit guest mode
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="default"
                      className="w-full justify-start gap-2 h-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-medium"
                      onClick={handleLeave}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
