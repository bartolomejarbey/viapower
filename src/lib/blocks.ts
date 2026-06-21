// Single source of truth for the section/block model. Imported by BOTH the
// public SectionRenderer and the visual editor, so they never drift.
// Pure data + registry — no server/client-only imports.

export type Btn = { label: string; href: string };
export type BlockBg = "base" | "surface";

export type IconName =
  | "Sun" | "Home" | "Building2" | "Thermometer" | "Plug" | "Wind" | "Cpu"
  | "ShieldCheck" | "Clock" | "Award" | "BadgeCheck" | "Layers" | "Wallet"
  | "Zap" | "BatteryCharging" | "PiggyBank" | "TrendingUp" | "Leaf" | "Wrench"
  | "FileCheck" | "Phone" | "Mail" | "MapPin" | "Users" | "Sparkles";

export const ICON_NAMES: IconName[] = [
  "Sun", "Home", "Building2", "Thermometer", "Plug", "Wind", "Cpu", "ShieldCheck", "Clock", "Award",
  "BadgeCheck", "Layers", "Wallet", "Zap", "BatteryCharging", "PiggyBank", "TrendingUp", "Leaf", "Wrench",
  "FileCheck", "Phone", "Mail", "MapPin", "Users", "Sparkles",
];

export type FeatureItem = { icon: IconName; title: string; text: string };
export type StepItem = { title: string; text: string };
export type StatItem = { value: string; label: string; desc: string };
export type GalleryItem = { image: string; label: string; title: string };
export type TestimonialItem = { text: string; author: string };
export type FaqItemData = { q: string; a: string };
export type PackageItemData = { name: string; tagline: string; specs: [string, string][]; href: string; featured: boolean };

export type BlockDataMap = {
  hero: { eyebrow: string; title: string; accent: string; sub: string; image: string; primary: Btn; secondary: Btn };
  heading: { eyebrow: string; title: string; accent: string; sub: string; align: "left" | "center"; bg: BlockBg };
  richtext: { html: string; bg: BlockBg };
  features: { eyebrow: string; title: string; accent: string; sub: string; columns: number; items: FeatureItem[]; bg: BlockBg };
  steps: { eyebrow: string; title: string; accent: string; sub: string; items: StepItem[]; bg: BlockBg };
  stats: { items: StatItem[]; bg: BlockBg };
  imagetext: { eyebrow: string; title: string; accent: string; html: string; image: string; side: "left" | "right"; button: Btn; bg: BlockBg };
  gallery: { eyebrow: string; title: string; accent: string; items: GalleryItem[]; bg: BlockBg };
  testimonials: { eyebrow: string; title: string; accent: string; items: TestimonialItem[]; bg: BlockBg };
  faq: { eyebrow: string; title: string; accent: string; items: FaqItemData[]; bg: BlockBg };
  pricing: { eyebrow: string; title: string; accent: string; sub: string; items: PackageItemData[]; bg: BlockBg };
  cta: { title: string; text: string; buttonLabel: string; buttonHref: string; bg: BlockBg };
  logos: { label: string; items: string[]; bg: BlockBg };
  leadform: { eyebrow: string; title: string; accent: string; sub: string; bg: BlockBg };
  spacer: { size: "s" | "m" | "l" };
};

export type BlockType = keyof BlockDataMap;

export type AnyBlock = { id: string; type: BlockType; data: Record<string, unknown> };

export type BlockDef = {
  type: BlockType;
  label: string;
  group: "Hlavní" | "Obsah" | "Sociální důkaz" | "Akce";
  icon: string; // lucide name shown in palette
  make: () => Record<string, unknown>;
};

const lorem = "<p>Sem napište text. Klikněte a pište přímo na stránce.</p>";

export const BLOCK_DEFS: BlockDef[] = [
  {
    type: "hero", label: "Hero (úvodní pás)", group: "Hlavní", icon: "LayoutTemplate",
    make: () => ({ eyebrow: "", title: "Nadpis stránky", accent: "", sub: "Krátký podnadpis stránky.", image: "/img/real/install-7.jpg", primary: { label: "Konzultace zdarma", href: "/poptavkovy-formular/" }, secondary: { label: "", href: "" } }),
  },
  {
    type: "heading", label: "Nadpis sekce", group: "Obsah", icon: "Heading",
    make: () => ({ eyebrow: "", title: "Nadpis sekce", accent: "", sub: "", align: "left", bg: "base" }),
  },
  {
    type: "richtext", label: "Text", group: "Obsah", icon: "Type",
    make: () => ({ html: lorem, bg: "base" }),
  },
  {
    type: "imagetext", label: "Obrázek + text", group: "Obsah", icon: "Columns2",
    make: () => ({ eyebrow: "", title: "Nadpis", accent: "", html: lorem, image: "", side: "left", button: { label: "", href: "" }, bg: "base" }),
  },
  {
    type: "features", label: "Mřížka výhod", group: "Obsah", icon: "LayoutGrid",
    make: () => ({ eyebrow: "", title: "Proč si vybrat nás", accent: "", sub: "", columns: 3, bg: "surface", items: [
      { icon: "ShieldCheck", title: "Výhoda jedna", text: "Krátký popis výhody." },
      { icon: "Clock", title: "Výhoda dvě", text: "Krátký popis výhody." },
      { icon: "Award", title: "Výhoda tři", text: "Krátký popis výhody." },
    ] }),
  },
  {
    type: "steps", label: "Postup (timeline)", group: "Obsah", icon: "ListOrdered",
    make: () => ({ eyebrow: "", title: "Jak to probíhá", accent: "", sub: "", bg: "base", items: [
      { title: "Krok jedna", text: "Popis kroku." },
      { title: "Krok dvě", text: "Popis kroku." },
      { title: "Krok tři", text: "Popis kroku." },
    ] }),
  },
  {
    type: "stats", label: "Statistiky", group: "Sociální důkaz", icon: "BarChart3",
    make: () => ({ bg: "surface", items: [
      { value: "500+", label: "realizace", desc: "Nainstalovaných systémů" },
      { value: "15", label: "zkušenosti", desc: "Let v oboru" },
      { value: "4,9/5", label: "hodnocení", desc: "Průměrné hodnocení" },
      { value: "100%", label: "úspěšnost", desc: "Při vyřizování dotací" },
    ] }),
  },
  {
    type: "pricing", label: "Balíčky / ceník", group: "Obsah", icon: "Package",
    make: () => ({ eyebrow: "", title: "Naše balíčky", accent: "", sub: "", bg: "base", items: [
      { name: "Balíček", tagline: "Krátký popis", specs: [["Parametr", "Hodnota"]], href: "/poptavkovy-formular/", featured: false },
    ] }),
  },
  {
    type: "gallery", label: "Galerie realizací", group: "Sociální důkaz", icon: "Images",
    make: () => ({ eyebrow: "", title: "Naše realizace", accent: "", bg: "surface", items: [
      { image: "/img/real/install-7.jpg", label: "realizace", title: "Popisek realizace" },
      { image: "/img/real/install-5.jpg", label: "realizace", title: "Popisek realizace" },
      { image: "/img/real/tremosna.jpg", label: "realizace", title: "Popisek realizace" },
    ] }),
  },
  {
    type: "testimonials", label: "Reference / recenze", group: "Sociální důkaz", icon: "Quote",
    make: () => ({ eyebrow: "", title: "Co říkají zákazníci", accent: "", bg: "base", items: [
      { text: "Skvělá zkušenost, vše proběhlo hladce.", author: "Jméno zákazníka" },
    ] }),
  },
  {
    type: "faq", label: "Časté dotazy", group: "Obsah", icon: "MessagesSquare",
    make: () => ({ eyebrow: "", title: "Časté dotazy", accent: "", bg: "base", items: [
      { q: "Otázka?", a: "Odpověď." },
    ] }),
  },
  {
    type: "logos", label: "Loga / důvěra", group: "Sociální důkaz", icon: "Building2",
    make: () => ({ label: "Důvěřují nám", bg: "surface", items: ["Partner 1", "Partner 2", "Partner 3", "Partner 4"] }),
  },
  {
    type: "cta", label: "Výzva k akci", group: "Akce", icon: "Megaphone",
    make: () => ({ title: "Máte zájem?", text: "Ozveme se vám do 24 hodin.", buttonLabel: "Konzultace zdarma", buttonHref: "/poptavkovy-formular/", bg: "surface" }),
  },
  {
    type: "leadform", label: "Poptávkový formulář", group: "Akce", icon: "MailPlus",
    make: () => ({ eyebrow: "nezávazná poptávka", title: "Spočítáme vaši úsporu.", accent: "", sub: "Zanechte nám kontakt, ozveme se do 24 hodin.", bg: "surface" }),
  },
  {
    type: "spacer", label: "Mezera", group: "Obsah", icon: "MoveVertical",
    make: () => ({ size: "m" }),
  },
];

export const BLOCK_DEF = Object.fromEntries(BLOCK_DEFS.map((d) => [d.type, d])) as Record<BlockType, BlockDef>;

/** Background class for a section band. */
export function bgClass(bg: BlockBg | undefined): string {
  switch (bg) {
    case "surface": return "bg-surface border-y border-line";
    default: return "bg-base";
  }
}

export function parseBlockData(s: string): Record<string, unknown> {
  try {
    return JSON.parse(s) as Record<string, unknown>;
  } catch {
    return {};
  }
}
