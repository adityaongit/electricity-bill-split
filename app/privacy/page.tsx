import Link from "next/link"
import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Shield, Lock, Eye, Database, User, Cookie, AlertCircle, Mail, Code } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

import { config } from "@/lib/config"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `${config.app.name} privacy policy - We respect your privacy and don't sell your data.`,
  alternates: {
    canonical: `${config.app.url}/privacy`,
  },
}

const sections = [
  {
    icon: Shield,
    title: "Our Commitment",
    content: `${config.app.name} is a free and open source tool. We believe in privacy by design. We do not sell your data to third parties, and we never will.`,
  },
  {
    icon: User,
    title: "Account Information",
    content: "When you create an account, we collect your email address and name. This is used solely for authentication and personalization.",
  },
  {
    icon: Database,
    title: "Bill Data",
    content: "Your electricity bill data, submeter readings, and roommate information are stored securely. This data is used only to calculate fair bill splits and provide bill history.",
  },
  {
    icon: Eye,
    title: "Usage Analytics",
    content: "We collect basic usage analytics to improve the service. This includes pages visited and features used. No personally identifiable information is shared.",
  },
  {
    icon: Lock,
    title: "Data Security",
    content: "We implement industry-standard security measures to protect your data. All data is encrypted in transit and at rest.",
  },
]

const rights = [
  "Access your personal data",
  "Correct inaccurate data",
  "Delete your account and associated data",
  "Opt-out of communications",
  "Export your data",
]

const thirdParty = [
  { name: "Vercel", desc: "Hosting infrastructure" },
  { name: "Auth.js", desc: "Authentication provider" },
]

const donts = [
  "Sell, trade, or rent your personal information",
  "Share data with advertisers",
  "Track you across other websites",
]

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <Breadcrumbs items={[{ name: "Privacy Policy", href: "/privacy" }]} />
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Your privacy is our priority. We believe in transparency, security, and giving you control over your data.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric", day: "numeric" })}
            </p>
          </div>

          {/* Main Cards */}
          <div className="grid gap-4 md:grid-cols-2 mb-12">
            {sections.map((section, i) => {
              const Icon = section.icon
              return (
                <Card key={i} className="border-muted/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">{section.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* We Don't Section */}
          <Card className="mb-12 border-destructive/20 bg-destructive/5">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                What We Don&apos;t Do
              </h3>
              <ul className="space-y-2">
                {donts.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-destructive" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="mb-12">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Your Rights
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {rights.map((right, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-sm">
                    <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary" />
                    {right}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Third Party Services */}
          <Card className="mb-12">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Third-Party Services</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We use third-party services for authentication and hosting:
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {thirdParty.map((service, i) => (
                  <div key={i} className="p-3 rounded-lg border border-border">
                    <p className="font-medium text-sm">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Open Source Badge */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <Code className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Open Source & Transparent</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {config.app.name} is open source. Our code is publicly available for review — anyone can verify how we handle data.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Questions? Contact us at{" "}
              <a href={`mailto:${config.social.email}`} className="text-primary hover:underline font-medium">
                {config.social.email}
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
