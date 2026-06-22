"use client";

import { useEffect } from "react";
import { getCookieConsent } from "./cookie-consent";
import type { MarketingTagsCfg } from "@/lib/marketing";

type W = Window & {
  dataLayer?: unknown[];
  gtag?: (...a: unknown[]) => void;
  seznam_retargeting_id?: string | number;
};

// Module-level guards so the heavy work runs once even under React strict-mode
// double-invoke and across client-side navigations (the layout never unmounts).
let booted = false;
let tagsLoaded = false;

function ext(src: string) {
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  document.head.appendChild(s);
}

function inline(code: string) {
  const s = document.createElement("script");
  s.textContent = code;
  document.head.appendChild(s); // appended inline scripts execute synchronously
}

/** Inject admin-pasted HTML, re-creating <script> nodes so they actually run. */
function injectHtml(html: string, target: HTMLElement) {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  for (const node of Array.from(tpl.content.childNodes)) {
    if (node.nodeName === "SCRIPT") {
      const old = node as HTMLScriptElement;
      const s = document.createElement("script");
      for (const a of Array.from(old.attributes)) s.setAttribute(a.name, a.value);
      s.textContent = old.textContent;
      target.appendChild(s);
    } else {
      target.appendChild(node.cloneNode(true));
    }
  }
}

/**
 * Consent-aware marketing/analytics loader. Tag IDs live in CMS → Nastavení →
 * "Marketing a sledování". Google Consent Mode v2 defaults to DENIED; nothing
 * third-party loads until the visitor clicks "Přijmout vše" (which dispatches
 * the "vp-consent" event and flips consent to granted).
 */
export function MarketingTags(cfg: MarketingTagsCfg) {
  useEffect(() => {
    const w = window as W;

    if (!booted) {
      booted = true;
      // Consent Mode v2 default — must precede any Google tag.
      inline(
        "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}" +
          "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'," +
          "analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});",
      );
    }

    const loadAll = () => {
      if (tagsLoaded) return;
      tagsLoaded = true;

      w.gtag?.("consent", "update", {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
        analytics_storage: "granted",
      });

      const hasGtm = /^GTM-[A-Z0-9]+$/i.test(cfg.gtm);
      if (hasGtm) {
        // Google Tag Manager (master container). When GTM runs, the agency adds GA4 /
        // Ads / Meta / Sklik / Clarity INSIDE GTM — so we must NOT also load them here
        // (otherwise every hit is double-counted).
        inline(
          `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});` +
            `var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;` +
            `j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${cfg.gtm}');`,
        );
      } else {
        // Individual tags (used only when GTM is not configured).
        const gids = [cfg.ga4, cfg.googleAds].filter((id) => /^(G|AW)-[A-Z0-9]+$/i.test(id));
        if (gids.length) {
          ext(`https://www.googletagmanager.com/gtag/js?id=${gids[0]}`);
          w.gtag?.("js", new Date());
          gids.forEach((id) => w.gtag?.("config", id));
        }
        if (/^\d{6,}$/.test(cfg.metaPixel)) {
          inline(
            `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};` +
              `if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;` +
              `t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');` +
              `fbq('init','${cfg.metaPixel}');fbq('track','PageView');`,
          );
        }
        if (/^\d{4,}$/.test(cfg.sklik)) {
          w.seznam_retargeting_id = cfg.sklik;
          ext("https://c.seznam.cz/js/rc.js");
        }
        if (/^[a-z0-9]{6,15}$/i.test(cfg.clarity)) {
          inline(
            `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};` +
              `t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];` +
              `y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${cfg.clarity}");`,
          );
        }
      }
      // Admin-managed custom code (their responsibility; consent-gated for safety)
      if (cfg.headHtml.trim()) { try { injectHtml(cfg.headHtml, document.head); } catch {} }
      if (cfg.bodyHtml.trim()) { try { injectHtml(cfg.bodyHtml, document.body); } catch {} }
    };

    if (getCookieConsent() === "all") loadAll();
    const onConsent = (e: Event) => { if ((e as CustomEvent).detail === "all") loadAll(); };
    window.addEventListener("vp-consent", onConsent);
    return () => window.removeEventListener("vp-consent", onConsent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
