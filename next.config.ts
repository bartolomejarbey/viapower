import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root (a stray lockfile lives in the home dir).
  turbopack: { root: __dirname },
  // Original WordPress URLs all end with "/"; preserve them exactly for SEO.
  trailingSlash: true,
  // Playwright is a native server dep — keep it out of the bundle.
  serverExternalPackages: ["playwright", "playwright-core"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.viapower.cz" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // 301 map for consolidated legacy URLs is appended here during migration.
  async redirects() {
    return [];
  },
  // Baseline security headers (safe defaults — no strict CSP to avoid breaking
  // Next/framer inline styles; tighten with a nonce-based CSP if needed later).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
