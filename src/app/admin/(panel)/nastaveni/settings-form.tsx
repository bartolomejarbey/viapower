"use client";

import { useState, useTransition } from "react";
import { Save, Loader2, Check, ImagePlus, X } from "lucide-react";
import { btnPrimary, inputCls, labelCls } from "@/components/admin/ui";
import { MediaPicker } from "@/components/editor/media-picker";
import { saveSettings } from "./actions";

type FieldDef = { key: string; label: string; type: "input" | "textarea" | "image"; group: string; help?: string; mono?: boolean };

const FIELDS: FieldDef[] = [
  // ── Images & brand — the client can now swap every key image from here ──
  { key: "brand.logo", label: "Logo (tmavé, pro světlé pozadí)", type: "image", group: "Logo a obrázky", help: "Hlavní logo. Použije se v hlavičce, patičce i v PDF nabídky." },
  { key: "brand.logoLight", label: "Logo (světlé, pro tmavé pozadí)", type: "image", group: "Logo a obrázky", help: "Volitelné. Pokud necháte prázdné, použije se hlavní logo." },
  { key: "hero.image", label: "Hero — obrázek na pozadí", type: "image", group: "Logo a obrázky", help: "Velký obrázek na úvodní sekci domovské stránky." },
  { key: "company.image", label: "Fotka firmy / „O nás“", type: "image", group: "Logo a obrázky" },
  { key: "og.image", label: "Náhled pro sdílení (OG / sociální sítě)", type: "image", group: "Logo a obrázky", help: "Obrázek, který se ukáže při sdílení odkazu na Facebook, LinkedIn apod. Ideálně 1200×630 px." },
  { key: "app.icon", label: "Ikona webu (favicon / PWA)", type: "image", group: "Logo a obrázky", help: "Malá ikona v záložce prohlížeče. Ideálně čtvercový PNG." },
  { key: "ref.image", label: "Reference — obrázek záhlaví", type: "image", group: "Záhlaví podstránek" },
  { key: "car.image", label: "Kariéra — obrázek záhlaví", type: "image", group: "Záhlaví podstránek" },
  { key: "svc.image", label: "Služby — obrázek záhlaví", type: "image", group: "Záhlaví podstránek" },

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
  { key: "form.consent", label: "Text souhlasu se zpracováním údajů (GDPR)", type: "textarea", group: "Poptávkový formulář", help: "Zobrazí se u zaškrtávacího políčka pod formulářem." },
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

  // Calculator constants/formulas — the client can tune the maths here.
  { key: "calc.priceKwh", label: "Cena elektřiny (Kč/kWh)", type: "input", group: "Kalkulačka — výpočty", help: "Výchozí 6,5. Použije se pro odhad spotřeby i úspory." },
  { key: "calc.yieldKwp", label: "Roční výnos (kWh na 1 kWp)", type: "input", group: "Kalkulačka — výpočty", help: "Výchozí 1000 (ČR)." },
  { key: "calc.selfConsumption", label: "Podíl vlastní spotřeby (0–1)", type: "input", group: "Kalkulačka — výpočty", help: "Výchozí 0,7 (s baterií). Kolik výroby zákazník reálně spotřebuje." },
  { key: "calc.feedIn", label: "Výkupní cena přetoků (Kč/kWh)", type: "input", group: "Kalkulačka — výpočty", help: "Výchozí 2. Cena za přebytky prodané do sítě." },
  { key: "calc.subsidyUnder", label: "Dotace do prahu (Kč)", type: "input", group: "Kalkulačka — výpočty", help: "Výchozí 160000." },
  { key: "calc.subsidyOver", label: "Dotace nad práh (Kč)", type: "input", group: "Kalkulačka — výpočty", help: "Výchozí 120000." },
  { key: "calc.subsidyThreshold", label: "Práh výkonu pro dotaci (kWp)", type: "input", group: "Kalkulačka — výpočty", help: "Výchozí 10. Do tohoto výkonu platí vyšší dotace." },

  // SEO — site-wide title/description (with current strings as fallback).
  { key: "seo.title", label: "Titulek webu (SEO)", type: "input", group: "SEO" },
  { key: "seo.description", label: "Popis webu (SEO)", type: "textarea", group: "SEO" },
  { key: "company.url", label: "Adresa webu (URL)", type: "input", group: "SEO", help: "Např. https://www.viapower.cz — řídí kanonické odkazy a náhledy." },

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

const groupId = (g: string) => "g-" + g.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();

function ImageSettingField({ value, onChange, onPick }: { value: string; onChange: (v: string) => void; onPick: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onPick}
        className="grid h-20 w-32 shrink-0 place-items-center overflow-hidden border border-line-strong bg-cover bg-center text-ink-dim transition-colors hover:border-red"
        style={value ? { backgroundImage: `url('${value}')` } : undefined}
        aria-label="Vybrat obrázek"
      >
        {!value && <ImagePlus size={20} />}
      </button>
      <div className="flex flex-col gap-1.5">
        <button type="button" onClick={onPick} className="inline-flex w-fit items-center gap-1.5 border border-line-strong px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-muted transition-colors hover:border-red hover:text-ink">
          <ImagePlus size={13} /> {value ? "Změnit" : "Vybrat obrázek"}
        </button>
        {value && (
          <button type="button" onClick={() => onChange("")} className="inline-flex w-fit items-center gap-1.5 text-[11px] text-ink-dim transition-colors hover:text-red-bright">
            <X size={12} /> Odebrat
          </button>
        )}
      </div>
    </div>
  );
}

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [picker, setPicker] = useState<string | null>(null); // field key whose picker is open
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const f of FIELDS) v[f.key] = initial[f.key] ?? "";
    return v;
  });

  const set = (key: string, val: string) => setValues((p) => ({ ...p, [key]: val }));
  const groups = [...new Set(FIELDS.map((f) => f.group))];

  function save() {
    setError("");
    start(async () => {
      try {
        await saveSettings(values);
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
      } catch {
        setError("Uložení se nezdařilo. Zkuste to prosím znovu — možná vypršelo přihlášení.");
      }
    });
  }

  return (
    <div className="max-w-2xl">
      {/* Jump nav — non-technical users can reach any section without endless scrolling. */}
      <nav className="sticky top-0 z-10 -mx-8 mb-6 flex flex-wrap gap-1.5 border-b border-line bg-base/95 px-8 py-3 backdrop-blur">
        {groups.map((g) => (
          <a key={g} href={`#${groupId(g)}`} className="border border-line-strong px-2.5 py-1 text-[11px] text-ink-muted transition-colors hover:border-red hover:text-ink">{g}</a>
        ))}
      </nav>

      {groups.map((g) => (
        <div key={g} id={groupId(g)} className="mb-8 scroll-mt-20">
          <h2 className="mb-4 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em] text-red-bright"><span className="h-1.5 w-1.5 bg-red" /> {g}</h2>
          <div className="border border-line-strong bg-card p-5">
            {FIELDS.filter((f) => f.group === g).map((f) => (
              <div key={f.key} className="mb-4 last:mb-0">
                <label className={labelCls}>{f.label}</label>
                {f.type === "image" ? (
                  <ImageSettingField value={values[f.key]} onChange={(v) => set(f.key, v)} onPick={() => setPicker(f.key)} />
                ) : f.type === "textarea" ? (
                  <textarea value={values[f.key]} onChange={(e) => set(f.key, e.target.value)} rows={f.group === "Vlastní kód (pokročilé)" ? 5 : 3} className={f.mono ? `${inputCls} font-mono text-[12px]` : inputCls} spellCheck={false} />
                ) : (
                  <input value={values[f.key]} onChange={(e) => set(f.key, e.target.value)} className={f.mono ? `${inputCls} font-mono text-[13px]` : inputCls} spellCheck={false} />
                )}
                {f.help && <p className="mt-1.5 text-[11.5px] leading-snug text-ink-dim">{f.help}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="sticky bottom-0 -mx-8 flex items-center gap-3 border-t border-line bg-base/95 px-8 py-4 backdrop-blur">
        <button onClick={save} disabled={pending} className={btnPrimary}>
          {pending ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />} {saved ? "Uloženo" : "Uložit změny"}
        </button>
        {error && <span className="text-[12.5px] font-semibold text-red-bright">{error}</span>}
      </div>

      {picker && (
        <MediaPicker
          onPick={(url) => { set(picker, url); setPicker(null); }}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}
