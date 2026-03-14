import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { Providers } from "@/components/providers"
import { JsonLd } from "@/components/seo/json-ld"
import { config } from "@/lib/config"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(config.app.url),
  title: {
    default: `Electricity Bill Splitter | Calculate & Share Utility Costs Fairly - ${config.app.name}`,
    template: `%s | ${config.app.name} - Electricity Bill Splitter`,
  },
  description:
    "Split your electricity bills fairly with roommates based on submeter readings. Calculate individual shares with our free utility bill calculator.",
  keywords: [
    "electricity bill splitter",
    "utility bill calculator",
    "roommate bill sharing",
    "submeter readings calculator",
    "flatmates bill split",
  ],
  authors: [{ name: config.app.author }],
  creator: config.app.author,
  publisher: config.app.author,
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "64x64 32x32 24x24 16x16", type: "image/x-icon" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: config.app.url,
    siteName: `${config.app.name} - Electricity Bill Splitter`,
    title: "Electricity Bill Splitter | Calculate & Share Utility Costs Fairly",
    description:
      "Split your electricity bills fairly with roommates based on submeter readings. Calculate individual shares with our free utility bill calculator.",
  },
  twitter: {
    card: "summary_large_image",
    title: `Electricity Bill Splitter | Calculate & Share Utility Costs Fairly - ${config.app.name}`,
    description: "Split your electricity bills fairly with roommates based on submeter readings. Calculate individual shares with our free utility bill calculator.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: config.analytics.googleVerification,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#AD4119" />
        {/* Capture beforeinstallprompt early — before React mounts */}
        <script dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            window.__pwaPrompt = e;
          });
        `}} />
        {/* Preconnect to Umami for analytics - only external resource needed */}
        <link rel="preconnect" href="https://cloud.umami.is" />
        <JsonLd />
        {/* Umami Analytics */}
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id={config.analytics.umamiWebsiteId}
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
