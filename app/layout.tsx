import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { Providers } from "@/components/providers"
import { JsonLd } from "@/components/seo/json-ld"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://electricity-bill-split.vercel.app"),
  title: {
    default: "Electricity Bill Splitter | Calculate & Share Utility Costs Fairly - SplitWatt",
    template: "%s | SplitWatt - Electricity Bill Splitter",
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
  authors: [{ name: "SplitWatt" }],
  creator: "SplitWatt",
  publisher: "SplitWatt",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/favicons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/favicons/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://electricity-bill-split.vercel.app",
    siteName: "SplitWatt - Electricity Bill Splitter",
    title: "Electricity Bill Splitter | Calculate & Share Utility Costs Fairly",
    description:
      "Split your electricity bills fairly with roommates based on submeter readings. Calculate individual shares with our free utility bill calculator.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SplitWatt - Electricity Bill Splitter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Electricity Bill Splitter | Calculate & Share Utility Costs Fairly - SplitWatt",
    description: "Split your electricity bills fairly with roommates based on submeter readings. Calculate individual shares with our free utility bill calculator.",
    images: ["/twitter-og.png"],
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
    google: "raoATIK68dRpqbuNs0ZX2Z9FLbtb0B06EK8rBhykNng",
  },
  alternates: {
    canonical: "https://electricity-bill-split.vercel.app",
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
        <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#4361ee" />
        <JsonLd />
        {/* Umami Analytics */}
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="d9d991ea-389d-402a-b258-371603776da2"
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
