import Link from "next/link"
import { Github, Twitter, Mail } from "lucide-react"
import { Logo } from "@/components/layout/logo"

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
    >
      <title>Discord</title>
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer
      className="mt-auto border-t"
      style={
        {
          "--background": "oklch(0.1908 0.002 106.59)",
          "--foreground": "oklch(0.8074 0.0142 93.0137)",
          "--card": "oklch(0.2679 0.0036 106.6427)",
          "--card-foreground": "oklch(0.9818 0.0054 95.0986)",
          "--popover": "oklch(0.3085 0.0035 106.6039)",
          "--popover-foreground": "oklch(0.9211 0.0040 106.4781)",
          "--primary": "oklch(0.6724 0.1308 38.7559)",
          "--primary-foreground": "oklch(1.0000 0 0)",
          "--secondary": "oklch(0.9818 0.0054 95.0986)",
          "--secondary-foreground": "oklch(0.3085 0.0035 106.6039)",
          "--muted": "oklch(0.2213 0.0038 106.7070)",
          "--muted-foreground": "oklch(0.7713 0.0169 99.0657)",
          "--accent": "oklch(0.2130 0.0078 95.4245)",
          "--accent-foreground": "oklch(0.9663 0.0080 98.8792)",
          "--destructive": "oklch(0.6368 0.2078 25.3313)",
          "--destructive-foreground": "oklch(1.0000 0 0)",
          "--border": "oklch(0.3618 0.0101 106.8928)",
          "--input": "oklch(0.4336 0.0113 100.2195)",
          "--ring": "oklch(0.6724 0.1308 38.7559)",
        } as React.CSSProperties
      }
    >
      <div className="bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            {/* Brand Column */}
            <div className="col-span-2 sm:col-span-1">
              <div className="mb-4">
                <Logo />
              </div>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                Free and open source electricity bill splitter for roommates. Fair splits based on submeter readings.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://github.com"
                  className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
                <a
                  href="https://twitter.com"
                  className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href="https://discord.com"
                  className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="Discord"
                >
                  <DiscordIcon className="h-4 w-4" />
                </a>
                <a
                  href="mailto:hello@splitwatt.app"
                  className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="Email"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/signup"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Get Started
                  </Link>
                </li>
                <li>
                  <Link
                    href="#features"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/bill/history"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Bill History
                  </Link>
                </li>
                <li>
                  <Link
                    href="/roommates"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Roommates
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#how-it-works"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="#faq"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} SplitWatt. Free and open source.
              </p>
              <p className="text-sm text-muted-foreground">
                Built for roommates everywhere
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
