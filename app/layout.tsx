import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { JsonLd } from "@/components/seo/json-ld"
import { FaqSchema } from "@/components/seo/faq-schema"
import { HowToSchema } from "@/components/seo/howto-schema"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://splitwatt.vercel.app"),
  title: {
    default: "Electricity Bill Splitter - Free Calculator for Roommates | SplitWatt",
    template: "%s | SplitWatt",
  },
  description:
    "Split electricity bills fairly using submeter readings. Free calculator for roommates with common areas, day-based sharing, and PDF/WhatsApp export.",
  keywords: [
    "electricity bill splitter",
    "electric bill split",
    "roommate bill split",
    "submeter calculator",
    "flatmate bill sharing",
    "common area electricity split",
    "electricity bill calculator",
    "roommate utility split",
    "paying guest bill split",
  ],
  authors: [{ name: "SplitWatt" }],
  creator: "SplitWatt",
  publisher: "SplitWatt",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://splitwatt.vercel.app",
    siteName: "SplitWatt",
    title: "Electricity Bill Splitter - Free Calculator for Roommates",
    description:
      "Split electricity bills fairly with submeter readings. Free, instant, no signup required.",
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
    title: "Electricity Bill Splitter - Free for Roommates",
    description: "Fair bill splitting with submeter readings. Export to PDF/WhatsApp.",
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
    canonical: "https://splitwatt.vercel.app",
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
        <JsonLd />
        <FaqSchema />
        <HowToSchema />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
