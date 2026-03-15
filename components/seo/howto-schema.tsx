import { config } from "@/lib/config"

export function HowToSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? config.app.url

  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Split Electricity Bills with Roommates Using Submeter Readings",
    description:
      "Step-by-step guide to fairly calculate and split electricity bills among roommates based on individual submeter readings and days stayed.",
    image: `${baseUrl}/opengraph-image`,
    totalTime: "PT10M",
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "INR",
      value: "0",
    },
    supply: [
      {
        "@type": "HowToSupply",
        name: "Electricity bill with total units and amount",
      },
      {
        "@type": "HowToSupply",
        name: "Submeter readings for each area (hall, rooms)",
      },
    ],
    step: [
      {
        "@type": "HowToStep",
        name: "Add Bill Details",
        text: "Get your electricity bill and enter the total amount, total units consumed, and billing period dates. This establishes the total cost that needs to be split.",
        image: `${baseUrl}#step1`,
        url: `${baseUrl}#step1`,
      },
      {
        "@type": "HowToStep",
        name: "Add Submeters and Roommates",
        text: "Enter previous and current submeter readings for each area, then add the roommates living there and how many days they stayed. This lets the calculator combine real usage with occupancy-based common cost sharing.",
        image: `${baseUrl}#step2`,
        url: `${baseUrl}#step2`,
      },
      {
        "@type": "HowToStep",
        name: "Calculate and Share the Split",
        text: "SplitWatt calculates each person's electricity share and common area cost automatically. Export the final breakdown as a PDF or image and share it with roommates on WhatsApp.",
        image: `${baseUrl}#step3`,
        url: `${baseUrl}#step3`,
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
