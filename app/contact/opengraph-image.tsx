import { createOgImage, ogImageContentType, ogImageSize } from "@/lib/og"

export const size = ogImageSize
export const contentType = ogImageContentType
export const alt = "SplitWatt contact page preview"

export default function ContactOpenGraphImage() {
  return createOgImage({
    eyebrow: "Contact",
    title: "Reach the SplitWatt team",
    description:
      "Support, feedback, community links, and contribution paths for the electricity bill splitter project.",
    pathLabel: "splitwatt.app/contact",
    stats: [
      { label: "Email", value: "Support" },
      { label: "GitHub", value: "Open source" },
      { label: "Community", value: "Discord + X" },
    ],
  })
}
