import Link from "next/link"
import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { FileText, UserCheck, AlertTriangle, Scale, Gift, Code, Mail, Ban, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "SplitWatt terms of service - Free and open source electricity bill splitter.",
  alternates: {
    canonical: "https://electricity-bill-split.vercel.app/terms",
  },
}

const sections = [
  {
    icon: Shield,
    title: "Agreement to Terms",
    content: "By accessing or using SplitWatt, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.",
  },
  {
    icon: FileText,
    title: "About SplitWatt",
    content: "SplitWatt is a free and open source tool for splitting electricity bills among roommates. The service is provided \"as is\" without any warranties.",
  },
  {
    icon: UserCheck,
    title: "Eligibility",
    content: "You must be at least 13 years old to use this service. By using SplitWatt, you represent that you are of legal age to form a binding contract.",
  },
]

const accountResponsibilities = [
  "Maintaining the confidentiality of your account credentials",
  "All activities that occur under your account",
  "Notifying us of unauthorized access",
  "Complying with these terms",
]

const acceptableUse = [
  "Use the service for any illegal purpose",
  "Attempt to gain unauthorized access to our systems",
  "Interfere with or disrupt the service",
  "Use automated tools to access the service excessively",
  "Impersonate any person or entity",
]

const disclaimers = [
  "Uninterrupted or error-free operation",
  "Accuracy of calculations",
  "Security of data transmission",
  "Freedom from viruses or harmful code",
]

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <Breadcrumbs items={[{ name: "Terms of Service", href: "/terms" }]} />
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
              <FileText className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Terms of Service</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Simple, fair terms for a free and open source tool built for roommates.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric", day: "numeric" })}
            </p>
          </div>

          {/* Main Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-12">
            {sections.map((section, i) => {
              const Icon = section.icon
              return (
                <Card key={i} className="border-muted/50">
                  <CardContent className="p-5">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{section.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Account Responsibilities */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Account Responsibilities
              </h3>
              <p className="text-sm text-muted-foreground mb-3">You are responsible for:</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {accountResponsibilities.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-muted/30">
                    <div className="flex-shrink-0 w-1 h-1 rounded-full bg-foreground" />
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card className="mb-8 border-destructive/20">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Ban className="h-5 w-5 text-destructive" />
                Unacceptable Activities
              </h3>
              <p className="text-sm text-muted-foreground mb-3">You agree not to:</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {acceptableUse.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-destructive/5">
                    <div className="flex-shrink-0 w-1 h-1 rounded-full bg-destructive" />
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data & Calculations */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Data and Calculations Disclaimer
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                SplitWatt provides bill splitting calculations based on the data you input. While we strive for accuracy,
                we make no guarantees about the correctness of calculations. Always verify results before making payments.
              </p>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Disclaimer of Warranties</h3>
              <p className="text-sm text-muted-foreground mb-3">SplitWatt is provided \"as is\" without warranties. We do not guarantee:</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {disclaimers.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-muted/30">
                    <div className="flex-shrink-0 w-1 h-1 rounded-full bg-muted-foreground" />
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Intellectual Property</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                SplitWatt is open source software licensed under the MIT License. You may view, modify, and distribute the code.
                The SplitWatt name and logo are trademarks and may not be used without permission.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Scale className="h-5 w-5 text-amber-500" />
                Limitation of Liability
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To the fullest extent permitted by law, SplitWatt and its contributors shall not be liable for any indirect,
                incidental, special, or consequential damages resulting from your use of the service.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Termination</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for violation of these terms.
                You may also delete your account at any time from the settings page.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Governing Law</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                These terms are governed by the laws of India. Any disputes shall be resolved in the courts of India.
              </p>
            </CardContent>
          </Card>

          {/* Free Forever Badge */}
          <Card className="bg-primary/5 border-primary/20 mb-8">
            <CardContent className="p-6 text-center">
              <Gift className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Free & Open Source Forever</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                SplitWatt is and will remain free to use. Our code is transparent, auditable, and community-driven.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              For questions about these terms, contact us at{" "}
              <a href="mailto:hello@splitwatt.app" className="text-primary hover:underline font-medium">
                hello@splitwatt.app
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
