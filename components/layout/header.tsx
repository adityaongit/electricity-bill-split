"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/layout/logo";
import { PwaInstallButton } from "@/components/pwa-install-prompt";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dragStartRef = useRef(0);
  const dragCurrentRef = useRef(0);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMenu = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setMobileOpen(false);
      setIsClosing(false);
      setDragOffset(0);
    }, 200);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartRef.current = e.touches[0].clientY;
    dragCurrentRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentY = e.touches[0].clientY;
    dragCurrentRef.current = currentY;
    const diff = currentY - dragStartRef.current;

    // Only allow dragging down
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // Close if dragged down more than 100px
    if (dragOffset > 100) {
      closeMenu();
    } else {
      // Spring back
      setDragOffset(0);
    }
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    closeMenu();

    setTimeout(() => {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 200);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              How It Works
            </Link>
            <Link
              href="#faq"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              FAQ
            </Link>
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="shrink-0">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="shrink-0">
                Get Started
              </Button>
            </Link>
          </nav>

          {/* Mobile right actions */}
          <div className="md:hidden flex items-center gap-2">
            <PwaInstallButton />
            <button
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Sheet */}
      {mobileOpen && !isClosing && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50 md:hidden transition-opacity duration-200"
            style={{ opacity: 1 - Math.min(dragOffset / 300, 0.8) }}
            onClick={closeMenu}
          />

          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            <div
              ref={sheetRef}
              className="bg-background rounded-t-3xl border-t shadow-2xl will-change-transform"
              style={{
                transform: `translateY(${dragOffset}px)`,
                transition: isDragging
                  ? "none"
                  : "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Handle */}
              <button
                className="w-full flex justify-center pt-4 pb-2 active:scale-95 transition-transform"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
              </button>

              {/* Menu Content */}
              <nav className="px-6 pb-6 space-y-1">
                <a
                  href="#features"
                  onClick={(e) => handleNavClick(e, "#features")}
                  className="block px-4 py-4 rounded-xl hover:bg-muted transition-colors text-lg font-medium cursor-pointer"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  onClick={(e) => handleNavClick(e, "#how-it-works")}
                  className="block px-4 py-4 rounded-xl hover:bg-muted transition-colors text-lg font-medium cursor-pointer"
                >
                  How It Works
                </a>
                <a
                  href="#faq"
                  onClick={(e) => handleNavClick(e, "#faq")}
                  className="block px-4 py-4 rounded-xl hover:bg-muted transition-colors text-lg font-medium cursor-pointer"
                >
                  FAQ
                </a>

                <div className="flex items-center justify-between px-4 py-4">
                  <span className="text-lg font-medium">Theme</span>
                  <ThemeToggle />
                </div>

                <div className="pt-4 mt-4 border-t space-y-3">
                  <Link href="/login" className="block" onClick={closeMenu}>
                    <Button variant="outline" className="w-full" size="default">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup" className="block" onClick={closeMenu}>
                    <Button className="w-full" size="default">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}
