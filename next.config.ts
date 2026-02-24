import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Enable React strict mode for better performance
  reactStrictMode: true,

  // Compress all assets
  compress: true,

  // Power optimization for production builds
  productionBrowserSourceMaps: false,

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'date-fns', '@base-ui/react'],
  },

  // Turbopack config
  turbopack: {},

  async headers() {
    return [
      {
        source: "/((?!dashboard|bill|settings|roommates|login|signup|api).*)",
        headers: [
          ...securityHeaders,
          {
            key: "X-Robots-Tag",
            value: "index, follow",
          },
        ],
      },
      {
        source: "/(dashboard|bill|settings|roommates)/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
      {
        source: "/(login|signup)",
        headers: [
          ...securityHeaders,
          {
            key: "X-Robots-Tag",
            value: "noindex",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: securityHeaders,
      },
      // Add compression headers for static assets
      {
        source: "/:all*(svg|jpg|jpeg|png|ico|webp)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:all*(js|css)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
