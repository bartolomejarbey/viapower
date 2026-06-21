import type { Metadata } from "next";
import { fontDisplay } from "@/lib/fonts";
import { company } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(company.url),
  title: {
    default: "Viapower — Fotovoltaika, baterie a tepelná čerpadla na klíč",
    template: "%s · Viapower",
  },
  description:
    "Inteligentní fotovoltaika, baterie, tepelná čerpadla a elektromobilita. Kompletní řešení pro rodinné domy i firmy. 15+ let zkušeností, stovky realizací, garantovaná dotace až 160 000 Kč.",
  keywords: [
    "fotovoltaika",
    "fotovoltaická elektrárna",
    "FVE na klíč",
    "baterie GoodWe",
    "tepelná čerpadla",
    "wallbox",
    "dotace NZÚ",
    "Viapower",
  ],
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    siteName: "Viapower",
    url: company.url,
  },
  twitter: {
    card: "summary_large_image",
    title: "Viapower — Fotovoltaika, baterie a tepelná čerpadla na klíč",
    description: "Kompletní řešení energetiky pro rodinné domy i firmy. Garantovaná dotace až 160 000 Kč.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport = {
  themeColor: "#08090b",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="cs" className={fontDisplay.variable}>
      <body className="min-h-screen bg-base font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
