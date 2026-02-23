import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/bill/", "/settings/", "/roommates/"],
      },
    ],
    sitemap: "https://electricity-bill-split.vercel.app/sitemap.xml",
  }
}
