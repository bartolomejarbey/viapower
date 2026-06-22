// Pure calculator model — safe to import from client AND server (no server-only deps).

export type CalcPkg = { name: string; kwp: number; battery: number; price: number };
export type CalcConfig = {
  priceKwh: number;        // Kč / kWh (cena elektřiny)
  yieldKwp: number;        // kWh / kWp / rok (výnos)
  selfConsumption: number; // 0–1 podíl vlastní spotřeby
  feedIn: number;          // Kč / kWh výkupní cena přetoků
  subsidyUnder: number;    // dotace do prahu (Kč)
  subsidyOver: number;     // dotace nad práh (Kč)
  subsidyThreshold: number; // práh kWp pro výši dotace
  packages: CalcPkg[];
};

export const DEFAULT_PACKAGES: CalcPkg[] = [
  { name: "Viapower Mini", kwp: 4.95, battery: 5, price: 219000 },
  { name: "Viapower Medium", kwp: 9.9, battery: 10, price: 349000 },
  { name: "Viapower Ultra", kwp: 16.5, battery: 15, price: 489000 },
];

export const DEFAULT_CONFIG: CalcConfig = {
  priceKwh: 6.5,
  yieldKwp: 1000,
  selfConsumption: 0.7,
  feedIn: 2,
  subsidyUnder: 160000,
  subsidyOver: 120000,
  subsidyThreshold: 10,
  packages: DEFAULT_PACKAGES,
};

/** Parse a possibly-Czech-formatted numeric string ("9,9 kWp" → 9.9). */
export function num(v: unknown, fallback: number): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : fallback;
  const n = parseFloat(String(v ?? "").replace(",", ".").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** The shared, corrected calculation. Savings can never exceed the actual bill (self-use)
 *  plus realistic feed-in revenue for surplus — the previous model overstated savings. */
export function computeCalc(monthly: number, cfg: CalcConfig) {
  const packages = cfg.packages.length ? cfg.packages : DEFAULT_PACKAGES;
  const annualBill = monthly * 12;
  const annualConsumption = annualBill / cfg.priceKwh;
  const neededKwp = annualConsumption / cfg.yieldKwp;
  const pkg = packages.find((p) => p.kwp >= neededKwp) ?? packages[packages.length - 1];
  const production = pkg.kwp * cfg.yieldKwp;
  // self-used energy offsets the grid price, but you can't self-consume more than you actually use
  const selfUsed = Math.min(production * cfg.selfConsumption, annualConsumption);
  const savingsSelf = selfUsed * cfg.priceKwh; // ≤ annualBill by construction
  const surplus = Math.max(0, production - selfUsed);
  const savingsSurplus = surplus * cfg.feedIn;
  const annualSavings = Math.round(savingsSelf + savingsSurplus);
  const subsidy = pkg.kwp <= cfg.subsidyThreshold ? cfg.subsidyUnder : cfg.subsidyOver;
  const netPrice = Math.max(0, pkg.price - subsidy);
  const payback = annualSavings > 0 ? netPrice / annualSavings : 0;
  return { annualBill, annualConsumption, pkg, production, annualSavings, subsidy, netPrice, payback };
}
