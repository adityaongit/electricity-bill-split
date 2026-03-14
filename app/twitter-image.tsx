import { createOgImage, ogImageContentType, ogImageSize } from "@/lib/og"

export const size = ogImageSize
export const contentType = ogImageContentType
export const alt = "SplitWatt electricity bill splitter preview"

export default function TwitterImage() {
  return createOgImage({
    eyebrow: "Electricity Bill Splitter",
    title: "Split electricity bills fairly",
    description:
      "Track submeter readings, distribute common units, and share clean bill breakdowns with roommates.",
    pathLabel: "splitwatt.app",
    stats: [
      { label: "Built for", value: "Roommates" },
      { label: "Exports", value: "PDF + Image" },
      { label: "Math", value: "Submeter-aware" },
    ],
  })
}
