import { config } from "@/lib/config"

export function HowToSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? config.app.url

  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Split Electricity Bills with Roommates Using Submeter Readings",
    description:
      "Step-by-step guide to fairly calculate and split electricity bills among roommates based on individual submeter readings and days stayed.",
    image: `${baseUrl}/og-image.png`,
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
        name: "Gather Your Bill Details",
        text: "Get your electricity bill and note the total amount and total units consumed. You'll also need the billing period dates (from and to). This information is typically found on the first page of your electricity bill.",
        image: `${baseUrl}#step1`,
        url: `${baseUrl}#step1`,
      },
      {
        "@type": "HowToStep",
        name: "Record Submeter Readings",
        text: "For each area with a submeter (hall, rooms), write down both the previous reading and current reading. The difference between current and previous gives you units consumed by each area. Previous readings are usually from your last month's record.",
        image: `${baseUrl}#step2`,
        url: `${baseUrl}#step2`,
      },
      {
        "@type": "HowToStep",
        name: "List Roommates and Days Stayed",
        text: "For each area, list the roommates living there and how many days they stayed during the billing period. This handles partial occupancy fairly - someone staying for 15 days pays less of common costs than someone staying the full month.",
        image: `${baseUrl}#step3`,
        url: `${baseUrl}#step3`,
      },
      {
        "@type": "HowToStep",
        name: "Calculate the Split",
        text: "Enter all values into SplitWatt calculator. The tool automatically calculates each person's share including their personal consumption from their submeter plus their proportional share of common area costs (lights, fans in common spaces).",
        image: `${baseUrl}#step4`,
        url: `${baseUrl}#step4`,
      },
      {
        "@type": "HowToStep",
        name: "Share with Roommates",
        text: "Download the breakdown as a clean PDF or image showing all calculations and each person's share. Share directly via WhatsApp so everyone can see exactly how their share was calculated - no more arguments about bills!",
        image: `${baseUrl}#step5`,
        url: `${baseUrl}#step5`,
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
