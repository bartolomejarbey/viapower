// Single source of truth for company facts + default navigation.
// (The CMS can later override nav/services from the database; this is the seed.)

export const company = {
  name: "Viapower",
  legalName: "VIAPOWER s.r.o.",
  url: "https://www.viapower.cz",
  tagline: "Komplexní partner v energetice",
  ico: "117 37 565",
  address: {
    street: "Baumanova 48",
    city: "Horoušany",
    zip: "250 82",
    country: "Česká republika",
  },
  phone: "+420 705 117 664",
  phoneHref: "tel:+420705117664",
  email: "info@viapower.cz",
  facebook: "https://www.facebook.com/viapowerFVE/",
  founded: 2009,
  projectManager: {
    name: "Ing. Viktor Kádek, M.Sc.",
    role: "Projektový manažer",
    phone: "724 678 904",
    phoneHref: "tel:+420724678904",
    email: "viktor.kadek@viapower.cz",
  },
  stats: {
    installations: "500+",
    experienceYears: "15",
    rating: "4,9/5",
    grantSuccess: "100%",
  },
} as const;

export type NavLink = { label: string; href: string; children?: { label: string; href: string; desc?: string }[] };

export const primaryNav: NavLink[] = [
  {
    label: "Služby",
    href: "/fotovoltaiky-pro-rodinne-domy-na-klic/",
    children: [
      { label: "FVE pro rodinné domy", href: "/fotovoltaiky-pro-rodinne-domy-na-klic/", desc: "Balíčky Mini · Medium · Ultra" },
      { label: "FVE pro firmy a obce", href: "/fotovoltaiky-pro-firmy/", desc: "Velké instalace na klíč" },
      { label: "Tepelná čerpadla", href: "/viapower-tepelna-cerpadla-2/", desc: "NIBE · nižší účty za topení" },
      { label: "Wallbox & elektromobilita", href: "/wallbox/", desc: "Nabíjení z vlastních panelů" },
      { label: "Klimatizace", href: "/klimatizace/", desc: "Chlazení i přitápění" },
      { label: "INFIGY — chytré řízení", href: "/infigy/", desc: "Inteligentní řízení spotřeby" },
    ],
  },
  { label: "Reference", href: "/reference/" },
  { label: "Kalkulačka", href: "/kalkulacka/" },
  { label: "O nás", href: "/o-nas/" },
  { label: "Servis", href: "/servis/" },
  { label: "Kontakt", href: "/viapower-pobocka-cechy-kontakt/" },
];

/** Top-level menu items that have a dropdown — usable as a parent ("rodina") for CMS pages. */
export const navGroups: { key: string; label: string }[] = primaryNav
  .filter((n) => n.children?.length)
  .map((n) => ({ key: n.href, label: n.label }));

export const footerNav: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Služby",
    links: [
      { label: "FVE pro rodinné domy", href: "/fotovoltaiky-pro-rodinne-domy-na-klic/" },
      { label: "FVE pro firmy", href: "/fotovoltaiky-pro-firmy/" },
      { label: "Tepelná čerpadla", href: "/viapower-tepelna-cerpadla-2/" },
      { label: "Wallbox & elektromobilita", href: "/wallbox/" },
      { label: "Klimatizace", href: "/klimatizace/" },
    ],
  },
  {
    title: "Firma",
    links: [
      { label: "O nás", href: "/o-nas/" },
      { label: "Reference", href: "/reference/" },
      { label: "Kalkulačka", href: "/kalkulacka/" },
      { label: "Kariéra", href: "/kariera-volne-pozice/" },
      { label: "Servis", href: "/servis/" },
      { label: "Aktuality", href: "/aktuality/" },
    ],
  },
  {
    title: "Kontakt",
    links: [
      { label: "Pobočka Čechy", href: "/viapower-pobocka-cechy-kontakt/" },
      { label: "Pobočka Morava", href: "/viapower-pobocka-morava-kontakt/" },
      { label: "Poptávkový formulář", href: "/poptavkovy-formular/" },
    ],
  },
];

export const logoPath = "/brand/logo-cerne.webp";
