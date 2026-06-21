import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { GlowCards } from "@/components/ui/glow-card";
import { SectionHeading, Accent } from "@/components/ui/primitives";
import { T, tx } from "@/components/site/t";
import { cn } from "@/lib/utils";

export type PackageItem = {
  name: string;
  power: string;
  featured: boolean;
  href: string;
  specs: [string, string][];
  battery?: string;
  panels?: string;
  priceFrom?: number | null;
};

const czk = (n: number) => new Intl.NumberFormat("cs-CZ").format(n) + " Kč";

export function Packages({ items, t }: { items: PackageItem[]; t?: Record<string, string> }) {
  return (
    <section id="balicky" className="px-5 py-28 md:px-9 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <SectionHeading
          center
          eyebrow={<T k="pk.eb">{tx(t, "pk.eb", "balíčky FVE pro rodinné domy")}</T>}
          title={
            <>
              <T k="pk.t1">{tx(t, "pk.t1", "Šetříte od")}</T>{" "}
              <Accent>
                <T k="pk.acc">{tx(t, "pk.acc", "prvního dne.")}</T>
              </Accent>
            </>
          }
          sub={<T k="pk.sub">{tx(t, "pk.sub", "Tři kompletní sestavy od GoodWe a AIKO. Záruka 30 let na panely, montáž do 2 měsíců, garantovaná dotace.")}</T>}
        />
        <GlowCards>
          <Stagger className="mt-16 grid gap-4 lg:grid-cols-3">
            {items.map((p) => (
              <StaggerItem key={p.name} className="h-full">
                <div
                  data-glow
                  className={cn(
                    "brackets group relative h-full border p-9 transition-all duration-300 hover:-translate-y-1.5",
                    p.featured
                      ? "border-red bg-elevated"
                      : "brackets-draw border-line-strong bg-card hover:border-red hover:bg-elevated",
                  )}
                >
                  <span aria-hidden className="glow-ring" />
                  <span className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-red-bright">
                    <span className="h-2 w-2 bg-red" /> {p.name}
                    {p.featured && <span className="ml-1 text-ink-dim">· {tx(t, "pkg.badge", "doporučujeme")}</span>}
                  </span>
                  <div className="mt-3.5 text-[46px] font-bold leading-none tracking-tight text-ink">
                    {p.power}
                    <span className="ml-1 font-mono text-[16px] font-medium text-ink-muted">kWp</span>
                  </div>
                  {p.priceFrom ? (
                    <div className="mt-1 font-mono text-[13px] text-ink-muted">{tx(t, "pkg.priceFrom", "od")} <span className="font-semibold text-ink">{czk(p.priceFrom)}</span></div>
                  ) : null}
                  <ul className="mt-7 border-t border-line pt-5">
                    {p.battery ? (
                      <li className="flex items-center justify-between border-b border-dashed border-line py-2.5 font-mono text-[13.5px] text-ink-muted"><span>Baterie</span><span className="font-semibold text-ink">{p.battery}</span></li>
                    ) : null}
                    {p.panels ? (
                      <li className="flex items-center justify-between border-b border-dashed border-line py-2.5 font-mono text-[13.5px] text-ink-muted"><span>Panely</span><span className="font-semibold text-ink">{p.panels}</span></li>
                    ) : null}
                    {p.specs.map(([k, v]) => (
                      <li
                        key={k}
                        className="flex items-center justify-between border-b border-dashed border-line py-2.5 font-mono text-[13.5px] text-ink-muted last:border-0"
                      >
                        <span>{k}</span>
                        <span className="font-semibold text-ink">{v}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={p.href || "/poptavkovy-formular/"}
                    className={cn(
                      "mt-7 flex items-center justify-between border px-4.5 py-3.5 font-mono text-[11.5px] font-bold uppercase tracking-[0.12em] transition-colors",
                      p.featured
                        ? "border-red bg-red text-white hover:bg-white hover:text-red"
                        : "border-line-strong text-ink hover:border-red hover:bg-red hover:text-white",
                    )}
                  >
                    {tx(t, "pkg.cta", "Více informací")} <ArrowRight size={14} />
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </GlowCards>
      </div>
    </section>
  );
}
