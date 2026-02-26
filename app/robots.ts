import type { MetadataRoute } from "next"
import { config } from "@/lib/config"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? config.app.url

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/bill/", "/settings/", "/roommates/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
