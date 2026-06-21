"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sun, BatteryCharging, PiggyBank, TrendingUp } from "lucide-react";
import { formatCZK, formatNumber } from "@/lib/utils";

const PRICE_PER_KWH = 6.5; // Kč
const YIELD_PER_KWP = 1000; // kWh / kWp / rok (ČR)
const SELF_CONSUMPTION = 0.7;

type Pkg = { name: string; kwp: number; battery: number; price: number };
const PACKAGES: Pkg[] = [
  { name: "Viapower Mini", kwp: 4.95, battery: 5, price: 219000 },
  { name: "Viapower Medium", kwp: 9.9, battery: 10, price: 349000 },
  { name: "Viapower Ultra", kwp: 16.5, battery: 15, price: 489000 },
];

export function Calculator({ t }: { t?: Record<string, string> }) {
  const c = (k: string, f: string) => t?.[k] ?? f;
  const [monthly, setMonthly] = useState(3500);

  const result = useMemo(() => {
    const annualConsumption = (monthly * 12) / PRICE_PER_KWH;
    const neededKwp = annualConsumption / YIELD_PER_KWP;
    const pkg = PACKAGES.find((p) => p.kwp >= neededKwp) ?? PACKAGES[PACKAGES.length - 1];
    const production = pkg.kwp * YIELD_PER_KWP;
    const annualSavings = Math.round(production * SELF_CONSUMPTION * PRICE_PER_KWH);
    const subsidy = pkg.kwp <= 10 ? 160000 : 120000;
    const netPrice = pkg.price - subsidy;
    const payback = annualSavings > 0 ? netPrice / annualSavings : 0;
    return { annualConsumption, pkg, production, annualSavings, subsidy, netPrice, payback };
  }, [monthly]);

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      {/* input */}
      <div className="brackets border border-line-strong bg-card p-7 md:p-9">
        <h3 className="flex items-center gap-2 font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-red-bright">
          <span className="h-2 w-2 bg-red" /> {c("calc.consumption", "Vaše spotřeba")}
        </h3>
        <p className="mt-5 text-[15px] text-ink-muted">{c("calc.question", "Kolik měsíčně platíte za elektřinu?")}</p>
        <div className="mt-3 text-[44px] font-bold leading-none tracking-tight text-ink">
          {formatCZK(monthly)}
          <span className="ml-1 text-[18px] font-medium text-ink-muted">/ měsíc</span>
        </div>
        <input
          type="range"
          min={1000}
          max={12000}
          step={250}
          value={monthly}
          onChange={(e) => setMonthly(Number(e.target.value))}
          className="mt-7 w-full accent-red"
        />
        <div className="mt-2 flex justify-between font-mono text-[11px] text-ink-dim">
          <span>1 000 Kč</span>
          <span>12 000 Kč</span>
        </div>
        <p className="mt-6 border-t border-line pt-5 font-mono text-[12px] text-ink-dim">
          Odhadovaná roční spotřeba ≈ <span className="text-ink">{formatNumber(Math.round(result.annualConsumption))} kWh</span>
        </p>
      </div>

      {/* output */}
      <div className="flex flex-col gap-4">
        <div className="brackets border border-red bg-elevated p-7">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-red-bright">{c("calc.recommended", "Doporučená sestava")}</span>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <span className="text-[30px] font-bold tracking-tight text-ink">{result.pkg.name}</span>
            <span className="font-mono text-[14px] text-ink-muted">
              {formatNumber(result.pkg.kwp, 2)} kWp · {result.pkg.battery} kWh
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Out icon={Sun} label={c("calc.out.production", "Roční výroba")} value={`${formatNumber(result.production)} kWh`} />
          <Out icon={PiggyBank} label={c("calc.out.savings", "Úspora / rok")} value={formatCZK(result.annualSavings)} accent />
          <Out icon={BatteryCharging} label={c("calc.out.subsidy", "Dotace NZÚ")} value={formatCZK(result.subsidy)} accent />
          <Out icon={TrendingUp} label={c("calc.out.payback", "Návratnost")} value={`${formatNumber(result.payback, 1)} let`} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border border-line-strong bg-card p-5">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-dim">{c("calc.netprice", "Cena po dotaci (odhad)")}</span>
            <div className="text-[26px] font-bold tracking-tight text-ink">{formatCZK(result.netPrice)}</div>
          </div>
          <Link
            href="/poptavkovy-formular/"
            className="group inline-flex items-center gap-2.5 border border-red bg-red px-5 py-3.5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-dark"
          >
            {c("calc.cta", "Přesná nabídka")} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <p className="font-mono text-[11px] leading-relaxed text-ink-dim">
          {c("calc.note", "* Orientační výpočet. Přesnou nabídku připravíme po konzultaci podle spotřeby, střechy a lokality.")}
        </p>
      </div>
    </div>
  );
}

function Out({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="border border-line-strong bg-card p-5">
      <Icon size={18} className={accent ? "text-red" : "text-ink-muted"} />
      <div className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-dim">{label}</div>
      <div className={`mt-1 text-[20px] font-bold tracking-tight ${accent ? "text-red-bright" : "text-ink"}`}>{value}</div>
    </div>
  );
}
