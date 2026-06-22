import { Hero } from "@/components/home/hero";
import { LogosMarquee } from "@/components/home/logos-marquee";
import { Stats } from "@/components/home/stats";
import { Why } from "@/components/home/why";
import { Packages } from "@/components/home/packages";
import { Services } from "@/components/home/services";
import { Gallery } from "@/components/home/gallery";
import { Grant } from "@/components/home/grant";
import { Process } from "@/components/home/process";
import { Faq } from "@/components/home/faq";
import { Contact } from "@/components/home/contact";
import { getPackagesPublic, getServicesPublic, getSettings } from "@/lib/cms";
import { getCompany } from "@/lib/company";
import { getCalcConfig } from "@/lib/calc.server";

// SEO title/description come from Nastavení → Web & SEO (root generateMetadata reads seo.*).

/** Package specs are untrusted JSON text — never let a malformed value crash the homepage. */
function safeSpecs(s: string): [string, string][] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? (v as [string, string][]) : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [packages, services, t, company, cfg] = await Promise.all([getPackagesPublic(), getServicesPublic(), getSettings(), getCompany(), getCalcConfig()]);

  return (
    <>
      <Hero t={t} company={company} cfg={cfg} />
      <LogosMarquee t={t} />
      <Stats t={t} company={company} />
      <Why t={t} />
      <Packages
        t={t}
        items={packages.map((p) => ({
          name: p.name,
          power: p.powerKwp,
          featured: p.featured,
          href: p.href,
          specs: safeSpecs(p.specs),
          battery: p.battery,
          panels: p.panels,
          priceFrom: p.priceFrom,
        }))}
      />
      <Services t={t} items={services.map((s) => ({ title: s.title, excerpt: s.excerpt, icon: s.icon, image: s.image, href: s.href }))} />
      <Gallery t={t} />
      <Grant t={t} />
      <Process t={t} />
      <Faq t={t} />
      <Contact t={t} company={company} />
    </>
  );
}
