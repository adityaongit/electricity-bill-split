import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Mail, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { config } from "@/lib/config"
import { XIcon, DiscordIcon } from "@/components/icons"

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with the ${config.app.name} team - Free and open source electricity bill splitter.`,
  alternates: {
    canonical: `${config.app.url}/contact`,
  },
}

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <Breadcrumbs items={[{ name: "Contact", href: "/contact" }]} />
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">Get in Touch</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Have questions, feedback, or want to contribute? We&apos;d love to hear from you. {config.app.name} is free and open source, built by the community.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 mb-12">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      For general inquiries and support
                    </p>
                    <a
                      href={`mailto:${config.social.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {config.social.email}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Github className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">GitHub</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Report issues or contribute code
                    </p>
                    <a
                      href={config.social.repository}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View on GitHub
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <XIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">X</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Follow for updates and tips
                    </p>
                    <a
                      href={config.social.x}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      @adityaonbird
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <DiscordIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Discord</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Join our community chat
                    </p>
                    <a
                      href={config.social.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Join Server
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-12">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Common Questions</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Is {config.app.name} really free?</h4>
                  <p className="text-muted-foreground">
                    Yes! {config.app.name} is and will always be free to use. Being open source means anyone can verify our code and contribute.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Can I contribute?</h4>
                  <p className="text-muted-foreground">
                    Absolutely! Check out our GitHub repository. We welcome bug reports, feature requests, and code contributions.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">How is my data used?</h4>
                  <p className="text-muted-foreground">
                    Your data is only used to calculate bill splits and provide history. We don&apos;t sell your data to third parties. See our Privacy Policy for details.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Ready to split bills fairly?
            </p>
            <Button size="lg" asChild>
              <a href="/signup">Get Started Free</a>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
