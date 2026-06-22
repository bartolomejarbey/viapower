import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root (a stray lockfile lives in the home dir).
  turbopack: { root: __dirname },
  // Original WordPress URLs all end with "/"; preserve them exactly for SEO.
  trailingSlash: true,
  // Headless-Chromium deps are native/binary server packages — never bundle them.
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  // @sparticuz/chromium loads its bundled Chromium from bin/ via a runtime path
  // the file tracer can't follow, so it's missing from the lambda by default.
  // Force the whole package into the PDF route's serverless function bundle.
  // ('*' matches the single [id] segment; picomatch does not cross '/'.)
  outputFileTracingIncludes: {
    "/api/nabidky/*/pdf": ["./node_modules/@sparticuz/chromium/**"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.viapower.cz" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lhpwcnsgdcjnqopioqgc.supabase.co" },
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
