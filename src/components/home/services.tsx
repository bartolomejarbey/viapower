import Link from "next/link";
import { Home, Building2, Thermometer, Plug, Wind, Cpu, Sun, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { SectionHeading, Accent } from "@/components/ui/primitives";
import { T, tx } from "@/components/site/t";

const ICONS: Record<string, LucideIcon> = { Home, Building2, Thermometer, Plug, Wind, Cpu, Sun };

export type ServiceItem = { title: string; excerpt: string; icon: string; href: string };

// hairline dividers: right edge except row-last, bottom edge except last row
const CELL =
  "border-b border-line max-sm:[&:last-child]:border-b-0 sm:max-lg:[&:nth-child(odd)]:border-r sm:max-lg:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:not(:nth-child(3n))]:border-r lg:[&:nth-last-child(-n+3)]:border-b-0";

export function Services({ items, t }: { items: ServiceItem[]; t?: Record<string, string> }) {
  return (
    <section id="sluzby" className="leak-top border-y border-line bg-surface px-5 py-28 md:px-9 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <SectionHeading
          eyebrow={<T k="sv.eb">{tx(t, "sv.eb", "kompletní portfolio služeb")}</T>}
          title={
            <>
              <T k="sv.t1">{tx(t, "sv.t1", "Více než jen")}</T>{" "}
              <Accent>
                <T k="sv.acc">{tx(t, "sv.acc", "fotovoltaika.")}</T>
              </Accent>
            </>
          }
          sub={<T k="sv.sub">{tx(t, "sv.sub", "Energetika je propojený systém. Proto pod jednou střechou nabízíme všechno — od panelů po inteligentní řízení spotřeby.")}</T>}
        />
        <Stagger className="mt-14 grid border border-line-strong sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s, i) => {
            const Icon = ICONS[s.icon] ?? Sun;
            // Only render a real link when the href is a valid internal path —
            // a malformed/empty href must never become a dead card or "#" no-op.
            const valid = typeof s.href === "string" && s.href.startsWith("/");
            const inner = (
              <>
                <div className="mb-5 flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center border border-red bg-red-soft text-red">
                    <Icon size={22} />
                  </span>
                  {valid && (
                    <ArrowUpRight
                      size={20}
                      className="text-ink-dim transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-red-bright"
                    />
                  )}
                </div>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-red-bright">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h4 className="mt-2 text-[22px] font-bold leading-tight text-ink">{s.title}</h4>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-muted">{s.excerpt}</p>
              </>
            );
            return (
              <StaggerItem key={s.href + i} className={CELL}>
                {valid ? (
                  <Link href={s.href} className="group flex h-full flex-col p-9 transition-colors hover:bg-red-soft">{inner}</Link>
                ) : (
                  <div className="flex h-full flex-col p-9">{inner}</div>
                )}
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
