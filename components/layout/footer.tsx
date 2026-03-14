import Link from "next/link"
import { Github, Mail } from "lucide-react"
import { Logo } from "@/components/layout/logo"
import { XIcon, DiscordIcon } from "@/components/icons"
import { config } from "@/lib/config"

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
                  href={config.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </a>
                <a
                  href={config.social.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="X"
                >
                  <XIcon className="h-4 w-4" />
                  <span className="sr-only">X</span>
                </a>
                <a
                  href={config.social.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="Discord"
                >
                  <DiscordIcon className="h-4 w-4" />
                  <span className="sr-only">Discord</span>
                </a>
                <a
                  href={`mailto:${config.social.email}`}
                  className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="Email"
                >
                  <Mail className="h-4 w-4" />
                  <span className="sr-only">Email</span>
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
                    href="/#features"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#faq"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact
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
                    href="/#how-it-works"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sitemap.xml"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sitemap
                  </Link>
                </li>
                <li>
                  <a
                    href={config.social.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <a
                    href={`${config.social.repository}/issues`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Report an Issue
                  </a>
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
                  &copy; {new Date().getFullYear()} {config.app.name}. Free and open source.
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
