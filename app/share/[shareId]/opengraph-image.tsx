import { formatCurrency, formatDateShort } from "@/lib/utils"
import { createOgImage, ogImageContentType, ogImageSize } from "@/lib/og"
import { getSharePreviewData } from "@/lib/share-preview"

export const size = ogImageSize
export const contentType = ogImageContentType
export const alt = "Shared SplitWatt bill preview"

interface ShareOgImageProps {
  params: Promise<{
    shareId: string
  }>
}

export default async function ShareOpenGraphImage({ params }: ShareOgImageProps) {
  const { shareId } = await params
  const preview = await getSharePreviewData(shareId)

  if (!preview) {
    return createOgImage({
      eyebrow: "Shared Bill",
      title: "Shared bill not available",
      description:
        "This SplitWatt share link is missing or has expired.",
      pathLabel: `splitwatt.app/share/${shareId}`,
      stats: [
        { label: "Status", value: "Expired" },
        { label: "Access", value: "Unavailable" },
        { label: "Share", value: shareId.toUpperCase() },
      ],
    })
  }

  return createOgImage({
    eyebrow: "Shared Bill",
    title: `${formatCurrency(preview.totalBill)} electricity split`,
    description: `${formatDateShort(preview.billingPeriod.from)} to ${formatDateShort(preview.billingPeriod.to)}`,
    pathLabel: `splitwatt.app/share/${shareId}`,
    stats: [
      { label: "Total bill", value: formatCurrency(preview.totalBill) },
      { label: "Total units", value: `${preview.totalUnits}` },
      { label: "Roommates", value: `${preview.roommateCount}` },
    ],
  })
}
