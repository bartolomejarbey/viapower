import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const SERVICES = [
  { slug: "fve-rodinne-domy", title: "FVE pro rodinné domy", icon: "Home", href: "/fotovoltaiky-pro-rodinne-domy-na-klic/", excerpt: "Tři kompletní balíčky podle spotřeby — od MINI po ULTRA. Soběstačnost až 7 měsíců v roce. Panely AIKO 550 Wp, baterie a střídače GoodWe." },
  { slug: "fve-firmy", title: "FVE pro firmy a obce", icon: "Building2", href: "/fotovoltaiky-pro-firmy/", excerpt: "Velké instalace pro firmy, obce i SVJ. Mountfield, ZŠ Koloděje, CB Auto — partneři, pro které jsme realizovali stovky projektů." },
  { slug: "tepelna-cerpadla", title: "Tepelná čerpadla", icon: "Thermometer", href: "/viapower-tepelna-cerpadla-2/", excerpt: "Tři varianty realizace. Vyšší komfort, nižší účty za topení. Skvělá synergie s vlastní fotovoltaikou." },
  { slug: "wallbox", title: "Wallbox & elektromobilita", icon: "Plug", href: "/wallbox/", excerpt: "Wallboxy a inteligentní dobíjení elektromobilů. Nabíjejte si auto z vlastních panelů — až o 70 % levnější jízda." },
  { slug: "klimatizace", title: "Klimatizace", icon: "Wind", href: "/klimatizace/", excerpt: "Účinné chlazení i přitápění. Ideální doplněk k fotovoltaice — chladíte z vlastní energie." },
  { slug: "infigy", title: "INFIGY — chytré řízení", icon: "Cpu", href: "/infigy/", excerpt: "Inteligentní řízení spotřeby, které propojí FVE, baterii i tepelné čerpadlo. Ostrovní režim při výpadku sítě." },
];

const PACKAGES = [
  { name: "Viapower Mini", powerKwp: "4,95", battery: "5", panels: "9", priceFrom: 219000, featured: false, href: "/fotovoltaiky-pro-rodinne-domy-na-klic/maly-vykon/", order: 0, specs: JSON.stringify([["Výkon FVE", "4,95 kWp"], ["Baterie", "5 kWh"], ["Panely AIKO", "9 ks · 550 Wp"], ["Záruka panely", "30 let"]]) },
  { name: "Viapower Medium", powerKwp: "9,9", battery: "10", panels: "18", priceFrom: 349000, featured: true, href: "/fotovoltaiky-pro-rodinne-domy-na-klic/stredni-vykon/", order: 1, specs: JSON.stringify([["Výkon FVE", "9,9 kWp"], ["Baterie", "10 kWh"], ["Panely AIKO", "18 ks · 550 Wp"], ["Záruka panely", "30 let"]]) },
  { name: "Viapower Ultra", powerKwp: "16,5", battery: "15", panels: "30", priceFrom: 489000, featured: false, href: "/fotovoltaiky-pro-rodinne-domy-na-klic/velky-vykon/", order: 2, specs: JSON.stringify([["Výkon FVE", "16,5 kWp"], ["Baterie", "15 kWh"], ["Panely AIKO", "30 ks · 550 Wp"], ["Záruka panely", "30 let"]]) },
];

const SETTINGS: Record<string, unknown> = {
  "announcement.text": "Poslední šance v roce 2026 — dotace až 160 000 Kč.",
  "announcement.ctaText": "Spočítat moji nabídku →",
  "hero.line1": "Energie, kterou",
  "hero.accent": "si vyrábíte",
  "hero.line2": "sami.",
  "hero.sub": "Fotovoltaika nové generace pro rodinné domy i firmy. Panely AIKO, baterie GoodWe, inteligentní řízení spotřeby — pod jednou střechou. Dotace až 160 000 Kč.",
  "cta.title": "Spočítáme vaši úsporu.",
  "cta.sub": "Konzultace zdarma a bez závazku. Ozveme se vám do 24 hodin.",
};

async function main() {
  const email = process.env.ADMIN_EMAIL || "info@viapower.cz";
  const password = process.env.ADMIN_PASSWORD || "viapower-admin";
  await db.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash: bcrypt.hashSync(password, 10), name: "Administrátor", role: "admin" },
  });
  console.log("✓ admin user:", email);

  for (const [i, s] of SERVICES.entries()) {
    await db.service.upsert({ where: { slug: s.slug }, update: { ...s, order: i }, create: { ...s, order: i } });
  }
  console.log("✓ services:", SERVICES.length);

  if ((await db.pricePackage.count()) === 0) {
    await db.pricePackage.createMany({ data: PACKAGES });
    console.log("✓ packages:", PACKAGES.length);
  }

  for (const [key, value] of Object.entries(SETTINGS)) {
    await db.setting.upsert({ where: { key }, update: {}, create: { key, value: JSON.stringify(value) } });
  }
  console.log("✓ settings:", Object.keys(SETTINGS).length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
