import "server-only";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/cms";
import { DEFAULT_PACKAGES, num, type CalcConfig } from "@/lib/calc";

/** Effective calculator config — constants from Settings, packages from the Ceník (CMS-editable). */
export async function getCalcConfig(): Promise<CalcConfig> {
  const [s, rows] = await Promise.all([
    getSettings(),
    // Only published packages — mirror getPackagesPublic() so the "publikováno"
    // toggle hides a package from the calculator exactly as it does the homepage.
    db.pricePackage.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
  ]);
  const packages = rows
    .map((p) => ({ name: p.name, kwp: num(p.powerKwp, 0), battery: num(p.battery, 0), price: p.priceFrom ?? 0 }))
    .filter((p) => p.kwp > 0 && p.price > 0)
    .sort((a, b) => a.kwp - b.kwp);

  return {
    priceKwh: num(s["calc.priceKwh"], 6.5),
    yieldKwp: num(s["calc.yieldKwp"], 1000),
    selfConsumption: Math.min(1, num(s["calc.selfConsumption"], 0.7)),
    feedIn: num(s["calc.feedIn"], 2),
    subsidyUnder: num(s["calc.subsidyUnder"], 160000),
    subsidyOver: num(s["calc.subsidyOver"], 120000),
    subsidyThreshold: num(s["calc.subsidyThreshold"], 10),
    packages: packages.length ? packages : DEFAULT_PACKAGES,
  };
}
