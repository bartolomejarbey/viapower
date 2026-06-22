import type { Metadata } from "next";
import { fontDisplay } from "@/lib/fonts";
import { getSettings } from "@/lib/cms";
import { getCompany } from "@/lib/company";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const [t, company] = await Promise.all([getSettings(), getCompany()]);
  const get = (k: string, fb: string) => {
    const v = t[k];
    return v != null && String(v).trim() !== "" ? String(v) : fb;
  };
  const title = get("seo.title", "Viapower — Fotovoltaika, baterie a tepelná čerpadla na klíč");
  const description = get("seo.description", "Inteligentní fotovoltaika, baterie, tepelná čerpadla a elektromobilita. Kompletní řešení pro rodinné domy i firmy. 15+ let zkušeností, stovky realizací, garantovaná dotace až 160 000 Kč.");
  const ogRaw = get("og.image", "");
  const ogImages = ogRaw ? [{ url: ogRaw.startsWith("http") ? ogRaw : `${company.url}${ogRaw}` }] : undefined;

  return {
    metadataBase: new URL(company.url),
    title: { default: title, template: `%s · ${company.name}` },
    description,
    keywords: ["fotovoltaika", "fotovoltaická elektrárna", "FVE na klíč", "baterie GoodWe", "tepelná čerpadla", "wallbox", "dotace NZÚ", company.name],
    openGraph: { type: "website", locale: "cs_CZ", siteName: company.name, url: company.url, title, description, ...(ogImages ? { images: ogImages } : {}) },
    twitter: { card: "summary_large_image", title, description, ...(ogImages ? { images: ogImages } : {}) },
    robots: { index: true, follow: true },
    alternates: { canonical: "/" },
  };
}

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
