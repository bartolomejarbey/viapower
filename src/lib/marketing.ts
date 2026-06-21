import "server-only";
import { getSettings } from "@/lib/cms";

/** Tracking tags injected client-side (consent-gated). */
export type MarketingTagsCfg = {
  gtm: string;
  ga4: string;
  googleAds: string;
  metaPixel: string;
  sklik: string;
  clarity: string;
  headHtml: string;
  bodyHtml: string;
};

/** Site-verification tokens rendered server-side in <head> (not cookies). */
export type Verification = {
  google: string;
  seznam: string;
  facebook: string;
};

export async function getMarketing(): Promise<{ tags: MarketingTagsCfg; verify: Verification }> {
  const s = await getSettings();
  const g = (k: string) => (typeof s[k] === "string" ? s[k].trim() : "");
  return {
    tags: {
      gtm: g("mkt.gtm"),
      ga4: g("mkt.ga4"),
      googleAds: g("mkt.googleAds"),
      metaPixel: g("mkt.metaPixel"),
      sklik: g("mkt.sklik"),
      clarity: g("mkt.clarity"),
      headHtml: g("mkt.headHtml"),
      bodyHtml: g("mkt.bodyHtml"),
    },
    verify: {
      google: g("verify.google"),
      seznam: g("verify.seznam"),
      facebook: g("verify.facebook"),
    },
  };
}
