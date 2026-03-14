import { createOgImage, ogImageContentType, ogImageSize } from "@/lib/og"

export const size = ogImageSize
export const contentType = ogImageContentType
export const alt = "SplitWatt privacy policy preview"

export default function PrivacyOpenGraphImage() {
  return createOgImage({
    eyebrow: "Privacy Policy",
    title: "Privacy, stated plainly",
    description:
      "How SplitWatt handles account data, bill data, analytics, and user control across the product.",
    pathLabel: "splitwatt.app/privacy",
    stats: [
      { label: "Model", value: "Privacy-first" },
      { label: "Data", value: "No resale" },
      { label: "Access", value: "User control" },
    ],
  })
}
