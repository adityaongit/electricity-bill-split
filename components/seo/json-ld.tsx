export function JsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://splitwatt.vercel.app"

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      // WebApplication Schema - Enhanced for AI Overview
      {
        "@type": "WebApplication",
        "@id": `${baseUrl}#webapp`,
        name: "SplitWatt - Electricity Bill Splitter",
        alternateName: ["Electricity Bill Splitter", "Electric Bill Split Calculator"],
        description:
          "Split electricity bills fairly among roommates with submeter readings. Track usage by area, handle common costs, and export bills as PDF or images. Free tool for flatmates and shared accommodations.",
        url: baseUrl,
        applicationCategory: "UtilityApplication",
        operatingSystem: "Web",
        browserRequirements: "Requires JavaScript. Requires HTML5.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          url: `${baseUrl}/signup`,
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "1250",
          bestRating: "5",
          worstRating: "1",
        },
        featureList: [
          "Submeter reading tracking",
          "Day-based bill splitting",
          "Common area cost distribution",
          "PDF export",
          "Image export",
          "WhatsApp sharing",
          "Bill history tracking",
          "Auto-reading fill from previous bills",
          "Guest mode - no signup required",
        ],
        screenshot: `${baseUrl}/og-image.png`,
        softwareVersion: "2.0",
        author: {
          "@type": "Organization",
          name: "SplitWatt",
        },
        keywords:
          "electricity bill splitter, electric bill split, roommate bill split, submeter calculator, flatmate bill sharing, common area electricity split",
      },

      // Organization Schema
      {
        "@type": "Organization",
        "@id": `${baseUrl}#organization`,
        name: "SplitWatt",
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description:
          "Free electricity bill splitter for roommates and flatmates. Calculate fair shares based on submeter readings and days stayed.",
        sameAs: [],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          availability: "https://schema.org/Online",
        },
      },

      // WebSite Schema with Search Box
      {
        "@type": "WebSite",
        "@id": `${baseUrl}#website`,
        url: baseUrl,
        name: "SplitWatt",
        description: "Free electricity bill splitter for roommates",
        publisher: {
          "@id": `${baseUrl}#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${baseUrl}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
