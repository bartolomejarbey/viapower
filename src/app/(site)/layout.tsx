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
import { primaryNav, type NavLink } from "@/config/site";
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
  // Build the nested menu: CMS pages slot under their chosen parent group; null-parent pages become top-level items.
  const childrenByParent = new Map<string, { label: string; href: string }[]>();
  const topLevel: NavLink[] = [];
  for (const p of navPages) {
    const item = { label: p.navLabel || p.title, href: `/${p.slug}/` };
    if (p.navParent) childrenByParent.set(p.navParent, [...(childrenByParent.get(p.navParent) ?? []), item]);
    else topLevel.push(item);
  }
  const nav: NavLink[] = [
    ...primaryNav.map((n) => {
      const extra = childrenByParent.get(n.href);
      return extra ? { ...n, children: [...(n.children ?? []), ...extra] } : n;
    }),
    ...topLevel,
  ];

  return (
    <>
      <JsonLd />
      <AnnouncementBar
        text={setting(settings, "announcement.text", "Poslední šance v roce 2026 — dotace až 160 000 Kč.")}
        ctaText={setting(settings, "announcement.ctaText", "Spočítat moji nabídku →")}
        ctaHref={setting(settings, "announcement.ctaHref", "/poptavkovy-formular/")}
      />
      <SiteNav nav={nav} phone={company.phone} phoneHref={company.phoneHref} cta={setting(settings, "nav.cta", "Konzultace")} ctaHref={setting(settings, "nav.ctaHref", "/poptavkovy-formular/")} logo={company.logo} logoLight={company.logoLight} />
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
