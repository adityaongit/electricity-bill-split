import { createOgImage, ogImageContentType, ogImageSize } from "@/lib/og"

export const size = ogImageSize
export const contentType = ogImageContentType
export const alt = "SplitWatt terms of service preview"

export default function TermsOpenGraphImage() {
  return createOgImage({
    eyebrow: "Terms of Service",
    title: "Clear terms for a free tool",
    description:
      "Usage terms, disclaimers, and responsibilities for SplitWatt's open source electricity bill splitter.",
    pathLabel: "splitwatt.app/terms",
    stats: [
      { label: "License", value: "Open source" },
      { label: "Audience", value: "Personal use" },
      { label: "Focus", value: "Fair utility splits" },
    ],
  })
}
