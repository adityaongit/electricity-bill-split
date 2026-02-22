// UI FAQs with formatted answers for display
const faqs = [
  {
    question: "How do I split electricity bills with roommates?",
    answer: `To split electricity bills fairly with roommates:

1. Enter your total bill amount and units from your electricity bill
2. Add submeter readings for each area (hall, rooms)
3. Add roommates with their days stayed in each area
4. The calculator automatically distributes common units proportionally

You can then export the results as PDF or share via WhatsApp.`,
    plainAnswer:
      "To split electricity bills fairly with roommates: 1) Enter your total bill amount and units from your electricity bill, 2) Add submeter readings for each area (hall, rooms), 3) Add roommates with their days stayed in each area, 4) The calculator automatically distributes common units proportionally and shows each person's exact share. You can then export the results as PDF or share via WhatsApp.",
  },
  {
    question: "How is common area electricity calculated?",
    answer: `Common area electricity is the difference between your total bill units and the sum of all submeter readings.

This common amount is distributed among all roommates proportionally based on days stayed.

Example: If someone stayed 15 days while others stayed 30, they pay half the share of common costs.`,
    plainAnswer:
      "Common area electricity is calculated as the difference between your total bill units and the sum of all submeter readings. This common unit amount is then distributed among all roommates proportionally based on the number of days each person stayed. For example, if someone stayed for 15 days while others stayed for 30, they pay half the share of common costs.",
  },
  {
    question: "What are submeter readings?",
    answer: `Submeter readings are measurements from individual electricity meters installed in different areas of your flat — like the hall, hallway, and individual rooms.

These meters track exactly how much electricity each area consumes. By comparing current and previous readings, you calculate the exact units used by each area for fair bill splitting.`,
    plainAnswer:
      "Submeter readings are measurements from individual electricity meters installed in different areas of your flat - like the hall/hallway and individual rooms. These meters track exactly how much electricity each area consumes. By comparing current and previous readings, you calculate the exact units used by each area for fair bill splitting.",
  },
  {
    question: "How do you calculate electricity bill per person?",
    answer: `Electricity bill per person is calculated as:

1. Find each person's consumed units from their submeter (current - previous reading)
2. Calculate their share of common units based on days stayed
3. Convert total units to amount using the bill's unit rate
4. Allocate common area costs proportionally

Final Amount = (Person's Units × Rate) + (Person's Common Share × Common Rate)`,
    plainAnswer:
      "Electricity bill per person is calculated by: 1) Finding each person's consumed units from their submeter (current - previous reading), 2) Calculating their share of common units based on days stayed, 3) Converting total units to amount using the bill's unit rate, 4) Allocating common area costs proportionally. The final amount = (person's units × rate) + (person's common share × common rate).",
  },
  {
    question: "Is SplitWatt free to use?",
    answer: `Yes, SplitWatt is completely free for personal bill splitting.

• Create an account to save your flats and bill history
• Or use guest mode without signing up
• Export bills as PDF or images
• Share with roommates on WhatsApp

All features are free — no credit card required.`,
    plainAnswer:
      "Yes, SplitWatt is completely free to use for personal bill splitting. You can create an account to save your flats and bill history, or use guest mode without signing up. Export bills as PDF or images and share with roommates on WhatsApp - all free.",
  },
  {
    question: "What if a roommate was absent for some days?",
    answer: `SplitWatt handles partial occupancy perfectly.

Simply enter the number of days each person actually stayed in the flat. Their share of common area costs adjusts automatically.

Example: Someone staying 15 days pays half the common costs of someone staying 30 days, but pays full for their personal room consumption.`,
    plainAnswer:
      "SplitWatt handles partial occupancy perfectly. When adding roommates, simply enter the number of days each person actually stayed in the flat. The calculator automatically adjusts their share of common area costs proportionally. For example, someone staying 15 days pays half the common costs of someone staying 30 days, but pays full for their personal room consumption.",
  },
  {
    question: "What is the formula for splitting electricity bills?",
    answer: `The electricity bill split formula:

Personal Units = Current Reading - Previous Reading

Common Units = Total Bill Units - Sum of all submeter units

Person's Common Share = Common Units × (Days Stayed ÷ Total Days in Period)

Final Amount = (Personal Units × Unit Rate) + (Person's Common Share × Common Rate)`,
    plainAnswer:
      "The electricity bill split formula is: For each person: Personal Units = (Current Reading - Previous Reading) for their area. Total Units in Area = Sum of all personal units in that area. Common Units = Total Bill Units - Sum of all submeter units. Person's Common Share = Common Units × (Days Stayed / Total Days in Period × People in Area). Final Amount = (Personal Units × Unit Rate) + (Person's Common Share × Common Unit Rate).",
  },
  {
    question: "How do I handle electricity bill split for paying guests?",
    answer: `For paying guests (PG), use the same submeter-based approach:

• Track each room's consumption separately via submeters
• Common areas (corridor, kitchen, living room) distributed among all occupants
• Based on days stayed per person

PG operators can use SplitWatt to generate individual bills for each room/bed instantly.`,
    plainAnswer:
      "For paying guests (PG), use the same submeter-based approach. Track each room's consumption separately via submeters. Common areas like corridor, kitchen, and living room usage is distributed among all occupants based on days stayed. PG operators can use SplitWatt to generate individual bills for each room/bed instantly.",
  },
]

// Schema uses plainAnswer for structured data
export function FaqSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.plainAnswer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Export FAQs for use in UI components
export { faqs }
