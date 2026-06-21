import { AnnouncementBar } from "@/components/site/announcement-bar";
import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";
import { JsonLd } from "@/components/site/json-ld";
import { AdminEditBar } from "@/components/site/admin-edit-bar";
import { Atmosphere } from "@/components/site/atmosphere";
import { CursorLight } from "@/components/site/cursor-light";
import { CookieConsent } from "@/components/site/cookie-consent";
import { MarketingTags } from "@/components/site/marketing-tags";
import { getNavPages, getSettings, setting } from "@/lib/cms";
import { getCompany } from "@/lib/company";
import { getMarketing } from "@/lib/marketing";
import type { Metadata } from "next";

/** Site-verification meta tags (Google/Seznam/Facebook) — server-rendered so crawlers see them. */
export async function generateMetadata(): Promise<Metadata> {
  const { verify } = await getMarketing();
  const other: Record<string, string> = {};
  if (verify.seznam) other["seznam-wmt"] = verify.seznam;
  if (verify.facebook) other["facebook-domain-verification"] = verify.facebook;
  return {
    verification: verify.google ? { google: verify.google } : undefined,
    other: Object.keys(other).length ? other : undefined,
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [navPages, settings, company, marketing] = await Promise.all([getNavPages(), getSettings(), getCompany(), getMarketing()]);
  const extraNav = navPages.map((p) => ({ label: p.navLabel || p.title, href: `/${p.slug}/` }));

  return (
    <>
      <JsonLd />
      <AnnouncementBar
        text={setting(settings, "announcement.text", "Poslední šance v roce 2026 — dotace až 160 000 Kč.")}
        ctaText={setting(settings, "announcement.ctaText", "Spočítat moji nabídku →")}
        ctaHref={setting(settings, "announcement.ctaHref", "/poptavkovy-formular/")}
      />
      <SiteNav extraNav={extraNav} phone={company.phone} phoneHref={company.phoneHref} cta={setting(settings, "nav.cta", "Konzultace")} ctaHref={setting(settings, "nav.ctaHref", "/poptavkovy-formular/")} />
      <main>{children}</main>
      <SiteFooter />
      <CursorLight />
      <Atmosphere />
      <CookieConsent />
      <MarketingTags {...marketing.tags} />
      <AdminEditBar />
    </>
  );
}
