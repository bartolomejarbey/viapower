import { DEFAULT_PROCESS, DEFAULT_WHY_US, type Offer } from "./schema";

const MANAGER = {
  name: "Ing. Viktor Kádek, M.Sc.",
  role: "Projektový manažer",
  phone: "724 678 904",
  email: "viktor.kadek@viapower.cz",
};

/** Flagship FVE sample — real data from the Viapower 9.9 kWp offer. */
export const SAMPLE_FVE: Offer = {
  id: "vzor-fve-medium",
  number: "CN-2026-0042",
  type: "FVE",
  subject: "Realizace FVE na klíč s garancí dotací.",
  investor: { name: "Vzorový zákazník", contact: "zakaznik@email.cz" },
  location: "Roztoky 39, Povrly",
  validUntil: "31. 3. 2026",
  createdAt: "2026-03-15",
  technology: {
    summary:
      "Hybridní 3-fázový systém o výkonu **9,9 kWp** (18 ks prémiových panelů AIKO 550 Wp) s bateriemi GoodWe Lynx 5.0D o celkové kapacitě **15 kWh** (3 moduly).\n\nSystém obsahuje asymetrický 3-fázový střídač GoodWe 10K ET-20 (2. generace) s tichým pasivním chlazením o výkonu 10 kW, který distribuuje vyrobenou energii v reálném čase tam, kde je právě potřeba. Roční výroba cca **11 MWh**.\n\nSoučástí je také domácí dobíjecí stanice GoodWe GW11K-HCA-20 (11 kW), integrovaná do aplikace GoodWe — možnost nabíjet z přetoků. V ceně je kompletní administrativní proces s ČEZ Distribucí.",
    bullets: [],
    annualProductionMWh: 11,
  },
  system: {
    powerKwp: 9.9,
    panels: { count: 18, brand: "AIKO Neostar 3P60", wattPeak: 550 },
    battery: { capacityKwh: 15, model: "GoodWe Lynx D", modules: 3 },
    inverter: { model: "GoodWe GW10K-ET-20", kw: 10 },
  },
  budget: {
    installedPowerKwp: 9.9,
    batteryKwh: 15,
    vatRate: 12,
    groups: [
      {
        title: "Hlavní materiál",
        items: [
          { name: "FV panely", detail: "AIKO Neostar 3P60 550 Wp", qty: 18, priceNoVat: 44712 },
          { name: "Střídač", detail: "GoodWe GW10K-ET-20", qty: 1, priceNoVat: 29163 },
          { name: "Baterie", detail: "GoodWe Lynx D – 15 kWh (3 moduly)", qty: 1, priceNoVat: 105612 },
          { name: "Konstrukční systém", detail: "Sedlová střecha – vlnitý plech", qty: 18, priceNoVat: 20431 },
        ],
      },
      {
        title: "Další materiál a práce",
        items: [
          { name: "Rozvaděč AC / BACK-UP automatický", detail: "", qty: 1, priceNoVat: 15433 },
          { name: "Rozvaděč DC – 2 string", detail: "", qty: 1, priceNoVat: 8330 },
          { name: "Kompletní kabeláž a další materiál", detail: "", qty: 1, priceNoVat: 13800 },
          { name: "Elektroinstalační práce", detail: "", qty: 1, priceNoVat: 18700 },
          { name: "Konstrukční práce", detail: "", qty: 18, priceNoVat: 20250 },
          { name: "Uvedení do provozu, zaškolení obsluhy a technická pomoc", detail: "", qty: 1, priceNoVat: 1700 },
          { name: "Revizní zpráva", detail: "", qty: 1, priceNoVat: 4500 },
          { name: "Realizační dokumentace", detail: "", qty: 1, priceNoVat: 4500 },
          { name: "Úprava odb. místa vč. materiálu dle podmínek PDS", detail: "", qty: 1, priceNoVat: 5200 },
          { name: "Doprava", detail: "", qty: 1, priceNoVat: 5000 },
          { name: "Dobíjecí stanice – wallbox GoodWe EV Charger HCA G2", detail: "GW11K-HCA-20", qty: 1, priceNoVat: 14400 },
        ],
      },
    ],
    included: ["Vypracování projektové dokumentace DSP", "Administrativa, vedení projektu, povolení distributora"],
  },
  addons: [
    { name: "Chytré řízení INFIGY", priceWithVat: 15000 },
    { name: "Dodatečná baterie GoodWe Lynx 5.0D (5 kWh)", priceWithVat: 33400 },
  ],
  process: DEFAULT_PROCESS.FVE,
  whyUs: DEFAULT_WHY_US,
  manager: MANAGER,
};

/** Tepelné čerpadlo sample — NIBE SPLIT (illustrative budget). */
export const SAMPLE_TC: Offer = {
  id: "vzor-tc-nibe",
  number: "CN-2026-0043",
  type: "TC",
  subject: "Realizace tepelného čerpadla NIBE",
  investor: { name: "Vzorový zákazník", contact: "zakaznik@email.cz" },
  location: "Bezručova 287, Jesenice u Rakovníka",
  validUntil: "15. 6. 2026",
  createdAt: "2026-05-15",
  technology: {
    summary:
      "**NIBE SPLIT HBS 20** je inteligentní a kompaktní tepelné čerpadlo vzduch/voda s invertorovým řízením. Venkovní modul AMS 20 je připojen chladivovým potrubím k hydroboxu NIBE HBS 20 uvnitř objektu. Tepelné čerpadlo se automaticky přizpůsobuje požadavkům na výkon vašeho domu po celý rok a nabízí i efektivní funkci chlazení.",
    bullets: [
      "Topný výkon 10 kW",
      "Výstupní teplota vody až 58 °C i při −20 °C venkovní teplotě",
      "Max. výstupní teplota vody s elektrokotlem 65 °C",
      "SCOP až 5,33 (7 °C / 35 °C)",
      "Energetická účinnost A++",
      "Kompresor MITSUBISHI s plynulou regulací výkonu 1,5 – 10 kW",
      "Provozní rozsah topení až do −25 °C",
    ],
  },
  system: { powerKwp: undefined, inverter: { model: "NIBE SPLIT HBS 20", kw: 10 } },
  budget: {
    vatRate: 12,
    groups: [
      {
        title: "Hlavní materiál",
        items: [
          { name: "Tepelné čerpadlo NIBE SPLIT HBS 20", detail: "venkovní modul AMS 20 + hydrobox HBS 20", qty: 1, priceNoVat: 189000 },
          { name: "Akumulační nádrž + příslušenství", detail: "", qty: 1, priceNoVat: 28000 },
        ],
      },
      {
        title: "Další materiál a práce",
        items: [
          { name: "Montáž a instalace", detail: "", qty: 1, priceNoVat: 34000 },
          { name: "Uvedení do provozu, zaškolení", detail: "", qty: 1, priceNoVat: 4500 },
          { name: "Doprava", detail: "", qty: 1, priceNoVat: 3500 },
        ],
      },
    ],
    included: ["Vyřízení levnějšího distribučního tarifu pro TČ", "Administrativa a vedení projektu"],
  },
  addons: [],
  process: DEFAULT_PROCESS.TC,
  whyUs: [
    "Zajistíme kompletní dodávku projektu na klíč, od A po Z",
    "Vyřídíme za Vás všechna povolení a zajistíme dotace, pokud jsou aplikovatelné",
    "Rádi Vám pomůžeme s přechodem na levnější elektřinu",
    "Celým projektem Vás bude provázet Váš projektový manažer",
    "Vyřídíme za Vás levnější distribuční tarif pro tepelné čerpadlo",
  ],
  manager: MANAGER,
};

export const SAMPLE_OFFERS: Offer[] = [SAMPLE_FVE, SAMPLE_TC];
