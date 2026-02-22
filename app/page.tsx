import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { faqs } from "@/components/seo/faq-schema"
import { FaqAccordion } from "@/components/faq-accordion"
import {
  BarChart3,
  Home,
  CalendarDays,
  FileText,
  RefreshCw,
  ScrollText,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Split electricity bills
              <span className="text-primary/70"> fairly</span> among roommates
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Use submeter readings to calculate each roommate&apos;s share accurately.
              Handle common area costs, track billing history, and export results in seconds.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button size="lg" className="min-w-[180px]">
                  Start Splitting Free
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="min-w-[180px]">
                  See How It Works
                </Button>
              </Link>

            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold">Everything you need to split bills</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              No more spreadsheets or arguments. SplitWatt handles the math so you can focus on living.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" /> Submeter Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Enter readings for each area (hall, room) and let the system calculate
                  individual consumption automatically.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-primary" /> Common Area Split
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Common units (difference between bill and submeters) are distributed
                  proportionally based on days stayed.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" /> Day-Based Sharing
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Going on vacation? Each person&apos;s share adjusts based on the number
                  of days they actually stayed.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> PDF & Image Export
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Download a clean PDF or image of the bill breakdown. Share it with
                  roommates via WhatsApp in one tap.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-primary" /> Auto Reading Shift
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Previous readings auto-fill from your last bill. No more flipping
                  through old photos to find meter numbers.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ScrollText className="h-5 w-5 text-primary" /> Bill History
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  All your bills saved in one place. Track spending trends and look up
                  past calculations anytime.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold">How it works</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              Three simple steps to fair electricity bills.
            </p>

            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                  1
                </div>
                <h3 className="mt-4 text-lg font-semibold">Add roommates</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Set up your flat and add roommates to their respective areas.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                  2
                </div>
                <h3 className="mt-4 text-lg font-semibold">Enter bill details</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Input the total bill, units, and submeter readings. See the split live.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                  3
                </div>
                <h3 className="mt-4 text-lg font-semibold">Share results</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Export as PDF, download as image, or share directly on WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-bold">Ready to split bills the fair way?</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Free forever for personal use. No credit card required.
            </p>
            <div className="mt-8">
              <Link href="/signup">
                <Button size="lg" className="min-w-[200px]">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section - Critical for SEO & AI Overview */}
        <section id="faq" className="border-t bg-muted/20 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
              Everything you need to know about splitting electricity bills fairly.
            </p>

            <FaqAccordion faqs={faqs.slice(0, 6)} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
