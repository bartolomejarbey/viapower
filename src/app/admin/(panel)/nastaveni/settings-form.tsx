"use client";

import { useState, useTransition } from "react";
import { Save, Loader2, Check } from "lucide-react";
import { btnPrimary, inputCls, labelCls } from "@/components/admin/ui";
import { saveSettings } from "./actions";

type FieldDef = { key: string; label: string; type: "input" | "textarea"; group: string; help?: string; mono?: boolean };

const FIELDS: FieldDef[] = [
  { key: "announcement.text", label: "Text oznamovacího pruhu", type: "input", group: "Oznamovací pruh" },
  { key: "announcement.ctaText", label: "Text odkazu v pruhu", type: "input", group: "Oznamovací pruh" },
  { key: "announcement.ctaHref", label: "Cíl odkazu v pruhu (URL)", type: "input", group: "Oznamovací pruh" },
  { key: "hero.line1", label: "Nadpis – 1. řádek", type: "input", group: "Hero (úvodní sekce)" },
  { key: "hero.accent", label: "Nadpis – zvýrazněná část (červeně)", type: "input", group: "Hero (úvodní sekce)" },
  { key: "hero.line2", label: "Nadpis – zakončení", type: "input", group: "Hero (úvodní sekce)" },
  { key: "hero.sub", label: "Podnadpis", type: "textarea", group: "Hero (úvodní sekce)" },
  { key: "cta.title", label: "Nadpis závěrečné výzvy", type: "input", group: "Závěrečná výzva" },
  { key: "cta.sub", label: "Podnadpis závěrečné výzvy", type: "textarea", group: "Závěrečná výzva" },
  { key: "cb.btn", label: "Text tlačítka výzvy", type: "input", group: "Závěrečná výzva" },

  { key: "nav.cta", label: "Tlačítko v hlavičce", type: "input", group: "Navigace" },
  { key: "nav.ctaHref", label: "Cíl tlačítka v hlavičce (URL)", type: "input", group: "Navigace" },

  { key: "mq.label", label: "Pásmo referencí — popisek", type: "input", group: "Domovská stránka" },
  { key: "mq.clients", label: "Pásmo referencí — názvy (jeden na řádek)", type: "textarea", group: "Domovská stránka" },
  { key: "pkg.cta", label: "Tlačítko na kartě balíčku", type: "input", group: "Domovská stránka" },
  { key: "pkg.badge", label: "Štítek doporučeného balíčku", type: "input", group: "Domovská stránka" },

  { key: "form.title", label: "Nadpis formuláře", type: "input", group: "Poptávkový formulář" },
  { key: "form.submit", label: "Text odesílacího tlačítka", type: "input", group: "Poptávkový formulář" },
  { key: "form.successTitle", label: "Po odeslání — nadpis", type: "input", group: "Poptávkový formulář" },
  { key: "form.successText", label: "Po odeslání — text", type: "textarea", group: "Poptávkový formulář" },
  { key: "form.error", label: "Chybová hláška", type: "textarea", group: "Poptávkový formulář" },
  { key: "form.f.name", label: "Pole — Jméno", type: "input", group: "Poptávkový formulář" },
  { key: "form.f.phone", label: "Pole — Telefon", type: "input", group: "Poptávkový formulář" },
  { key: "form.f.email", label: "Pole — E-mail", type: "input", group: "Poptávkový formulář" },
  { key: "form.f.message", label: "Pole — Zpráva", type: "input", group: "Poptávkový formulář" },

  { key: "calc.consumption", label: "Nadpis „Vaše spotřeba“", type: "input", group: "Kalkulačka" },
  { key: "calc.question", label: "Otázka na spotřebu", type: "input", group: "Kalkulačka" },
  { key: "calc.recommended", label: "Štítek „Doporučená sestava“", type: "input", group: "Kalkulačka" },
  { key: "calc.cta", label: "Tlačítko kalkulačky", type: "input", group: "Kalkulačka" },
  { key: "calc.note", label: "Poznámka pod kalkulačkou", type: "textarea", group: "Kalkulačka" },
  { key: "calc.out.production", label: "Výstup — Roční výroba", type: "input", group: "Kalkulačka" },
  { key: "calc.out.savings", label: "Výstup — Úspora / rok", type: "input", group: "Kalkulačka" },
  { key: "calc.out.subsidy", label: "Výstup — Dotace", type: "input", group: "Kalkulačka" },
  { key: "calc.out.payback", label: "Výstup — Návratnost", type: "input", group: "Kalkulačka" },
  { key: "calc.netprice", label: "Výstup — Cena po dotaci", type: "input", group: "Kalkulačka" },
  { key: "herocalc.title", label: "Hero kalkulačka — nadpis", type: "input", group: "Kalkulačka" },
  { key: "herocalc.question", label: "Hero kalkulačka — otázka", type: "input", group: "Kalkulačka" },
  { key: "herocalc.savings", label: "Hero kalkulačka — Úspora ročně", type: "input", group: "Kalkulačka" },
  { key: "herocalc.subsidy", label: "Hero kalkulačka — Dotace", type: "input", group: "Kalkulačka" },
  { key: "herocalc.recommended", label: "Hero kalkulačka — Doporučená sestava", type: "input", group: "Kalkulačka" },
  { key: "herocalc.cta", label: "Hero kalkulačka — tlačítko", type: "input", group: "Kalkulačka" },
  { key: "herocalc.detail", label: "Hero kalkulačka — odkaz na podrobnou", type: "input", group: "Kalkulačka" },

  // Company facts — drive the header, footer, kontaktní sekce, CTA i strukturovaná data.
  { key: "company.phone", label: "Telefon", type: "input", group: "Firma a kontakt" },
  { key: "company.email", label: "E-mail", type: "input", group: "Firma a kontakt" },
  { key: "company.name", label: "Název (značka)", type: "input", group: "Firma a kontakt" },
  { key: "company.legalName", label: "Obchodní název (s.r.o.)", type: "input", group: "Firma a kontakt" },
  { key: "company.ico", label: "IČO", type: "input", group: "Firma a kontakt" },
  { key: "company.tagline", label: "Slogan", type: "input", group: "Firma a kontakt" },
  { key: "company.founded", label: "Rok založení", type: "input", group: "Firma a kontakt" },
  { key: "company.facebook", label: "Facebook (URL)", type: "input", group: "Firma a kontakt" },
  { key: "company.address.street", label: "Ulice a č.p.", type: "input", group: "Adresa sídla" },
  { key: "company.address.zip", label: "PSČ", type: "input", group: "Adresa sídla" },
  { key: "company.address.city", label: "Obec", type: "input", group: "Adresa sídla" },
  { key: "company.pm.name", label: "Jméno", type: "input", group: "Projektový manažer" },
  { key: "company.pm.role", label: "Pozice", type: "input", group: "Projektový manažer" },
  { key: "company.pm.phone", label: "Telefon", type: "input", group: "Projektový manažer" },
  { key: "company.pm.email", label: "E-mail", type: "input", group: "Projektový manažer" },
  { key: "company.stats.installations", label: "Realizací", type: "input", group: "Čísla (statistiky)" },
  { key: "company.stats.experienceYears", label: "Let zkušeností", type: "input", group: "Čísla (statistiky)" },
  { key: "company.stats.rating", label: "Hodnocení", type: "input", group: "Čísla (statistiky)" },
  { key: "company.stats.grantSuccess", label: "Úspěšnost dotací", type: "input", group: "Čísla (statistiky)" },

  // Marketing & analytics — managed by the client's marketing agency. Tags load
  // only after cookie consent (Přijmout vše) with Google Consent Mode v2.
  { key: "mkt.gtm", label: "Google Tag Manager", type: "input", group: "Marketing a sledování", mono: true, help: "ID kontejneru GTM-XXXXXXX. Přes GTM agentura spravuje všechny ostatní značky bez zásahu do webu." },
  { key: "mkt.ga4", label: "Google Analytics 4", type: "input", group: "Marketing a sledování", mono: true, help: "Měřicí ID G-XXXXXXXXXX (jen pokud neběží přes GTM)." },
  { key: "mkt.googleAds", label: "Google Ads", type: "input", group: "Marketing a sledování", mono: true, help: "Conversion ID AW-XXXXXXXXX." },
  { key: "mkt.metaPixel", label: "Meta / Facebook Pixel", type: "input", group: "Marketing a sledování", mono: true, help: "Číselné ID pixelu pro Facebook/Instagram reklamy a remarketing." },
  { key: "mkt.sklik", label: "Sklik retargeting (Seznam)", type: "input", group: "Marketing a sledování", mono: true, help: "Číselné retargeting ID ze Sklik účtu." },
  { key: "mkt.clarity", label: "Microsoft Clarity", type: "input", group: "Marketing a sledování", mono: true, help: "ID projektu pro heatmapy a nahrávky relací." },

  { key: "verify.google", label: "Google Search Console", type: "input", group: "Ověření webu", mono: true, help: "Ověřovací kód (obsah meta tagu google-site-verification)." },
  { key: "verify.seznam", label: "Seznam Webmaster", type: "input", group: "Ověření webu", mono: true, help: "Ověřovací kód pro Seznam (meta seznam-wmt)." },
  { key: "verify.facebook", label: "Ověření domény Facebook", type: "input", group: "Ověření webu", mono: true, help: "Kód facebook-domain-verification." },

  { key: "mkt.headHtml", label: "Vlastní kód do <head>", type: "textarea", group: "Vlastní kód (pokročilé)", mono: true, help: "Libovolné skripty/meta (Hotjar, LinkedIn, TikTok…). Vkládejte jen z důvěryhodných zdrojů — kód běží na celém webu." },
  { key: "mkt.bodyHtml", label: "Vlastní kód za <body>", type: "textarea", group: "Vlastní kód (pokročilé)", mono: true, help: "Skripty/noscript, které mají být na konci stránky." },
];

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const f of FIELDS) v[f.key] = initial[f.key] ?? "";
    return v;
  });

  const groups = [...new Set(FIELDS.map((f) => f.group))];

  function save() {
    start(async () => {
      await saveSettings(values);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    });
  }

  return (
    <div className="max-w-2xl">
      {groups.map((g) => (
        <div key={g} className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em] text-red-bright"><span className="h-1.5 w-1.5 bg-red" /> {g}</h2>
          <div className="border border-line-strong bg-card p-5">
            {FIELDS.filter((f) => f.group === g).map((f) => (
              <div key={f.key} className="mb-4 last:mb-0">
                <label className={labelCls}>{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea value={values[f.key]} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} rows={f.group === "Vlastní kód (pokročilé)" ? 5 : 3} className={f.mono ? `${inputCls} font-mono text-[12px]` : inputCls} spellCheck={false} />
                ) : (
                  <input value={values[f.key]} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} className={f.mono ? `${inputCls} font-mono text-[13px]` : inputCls} spellCheck={false} />
                )}
                {f.help && <p className="mt-1.5 text-[11.5px] leading-snug text-ink-dim">{f.help}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={save} disabled={pending} className={btnPrimary}>
        {pending ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />} {saved ? "Uloženo" : "Uložit změny"}
      </button>
    </div>
  );
}
