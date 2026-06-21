import { z } from "zod";

export const OfferTypeEnum = z.enum(["FVE", "TC", "KLIMA", "COMBO"]);
export type OfferType = z.infer<typeof OfferTypeEnum>;

export const BudgetItemSchema = z.object({
  name: z.string(),
  detail: z.string().optional().default(""),
  qty: z.number().default(1),
  priceNoVat: z.number(), // Kč bez DPH
});
export type BudgetItem = z.infer<typeof BudgetItemSchema>;

export const BudgetGroupSchema = z.object({
  title: z.string(), // "Hlavní materiál", "Další materiál a práce"
  items: z.array(BudgetItemSchema),
});

export const OfferSchema = z.object({
  id: z.string(),
  number: z.string().optional().default(""),
  type: OfferTypeEnum.default("FVE"),
  subject: z.string(), // "Realizace FVE na klíč s garancí dotací."
  investor: z.object({
    name: z.string().default(""),
    contact: z.string().default(""), // email / phone
  }),
  location: z.string().default(""), // "Roztoky 39, Povrly"
  validUntil: z.string().default(""), // "31.3.2026"
  createdAt: z.string().default(""), // ISO

  technology: z.object({
    summary: z.string(), // rich paragraph(s), markdown allowed
    bullets: z.array(z.string()).optional().default([]),
    annualProductionMWh: z.number().optional(),
  }),

  system: z
    .object({
      powerKwp: z.number().optional(),
      panels: z.object({ count: z.number(), brand: z.string(), wattPeak: z.number() }).partial().optional(),
      battery: z.object({ capacityKwh: z.number(), model: z.string(), modules: z.number() }).partial().optional(),
      inverter: z.object({ model: z.string(), kw: z.number() }).partial().optional(),
    })
    .partial()
    .default({}),

  budget: z.object({
    installedPowerKwp: z.number().optional(),
    batteryKwh: z.number().optional(),
    groups: z.array(BudgetGroupSchema),
    included: z.array(z.string()).optional().default([]), // "V ceně zahrnuto"
    vatRate: z.number().default(12), // %
  }),

  addons: z.array(z.object({ name: z.string(), priceWithVat: z.number() })).optional().default([]),

  process: z.array(z.string()).default([]),
  whyUs: z.array(z.string()).default([]),

  manager: z.object({
    name: z.string(),
    role: z.string().default("Projektový manažer"),
    phone: z.string(),
    email: z.string(),
  }),
});

export type Offer = z.infer<typeof OfferSchema>;

export function computeTotals(budget: Offer["budget"]) {
  // priceNoVat is the LINE total (qty is shown for information only, as in the
  // original Viapower offers), so we sum line totals directly — no qty multiply.
  const subtotal = budget.groups.reduce(
    (sum, g) => sum + g.items.reduce((s, it) => s + it.priceNoVat, 0),
    0,
  );
  const vat = Math.round((subtotal * budget.vatRate) / 100);
  const total = subtotal + vat;
  return { subtotal: Math.round(subtotal), vat, total };
}

/** Default Viapower process steps per offer type. */
export const DEFAULT_PROCESS: Record<OfferType, string[]> = {
  FVE: [
    "Zkontrolujeme místo realizace",
    "Vypracujeme finální kalkulaci",
    "Podpis smlouvy",
    "Zajistíme za Vás povolení od distributora a akceptaci dotace",
    "FVE odborně nainstalujeme",
    "Zařídíme revizi a připojení do sítě",
    "Výplata dotace přímo na Váš účet",
  ],
  TC: [
    "Zkontrolujeme místo realizace",
    "Vypracujeme finální kalkulaci",
    "Podpis smlouvy",
    "Zajistíme za Vás povolení od distributora a akceptaci dotace",
    "TČ odborně nainstalujeme",
    "Zařídíme distribuční sazbu",
  ],
  KLIMA: ["Zkontrolujeme místo realizace", "Vypracujeme finální kalkulaci", "Podpis smlouvy", "Odborně nainstalujeme", "Předání a zaškolení"],
  COMBO: [
    "Zkontrolujeme místo realizace",
    "Vypracujeme finální kalkulaci",
    "Podpis smlouvy",
    "Zajistíme za Vás povolení a dotace",
    "Odborně nainstalujeme",
    "Revize a připojení do sítě",
  ],
};

export const DEFAULT_WHY_US: string[] = [
  "Zajistíme kompletní dodávku projektu na klíč, od A po Z",
  "Vyřídíme za Vás všechna povolení a zajistíme dotace",
  "Rádi Vám pomůžeme s přechodem na levnější elektřinu",
  "Zajistíme nejoptimálnější výkup přetoků z Vaší FVE",
  "Záruka na střídač 10 let",
  "Záruka na výkon panelů 30 let (min. 88,8 % původního výkonu)",
  "Mechanická záruka na panely 25 let",
  "Záruka na baterie 10 let",
  "Celým projektem Vás bude provázet projektový manažer",
];
