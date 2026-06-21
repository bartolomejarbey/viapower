import { Stagger, StaggerItem } from "@/components/ui/motion";
import { SectionHeading, Accent } from "@/components/ui/primitives";
import { T, tx } from "@/components/site/t";

const STEPS: [string, string, string][] = [
  ["01", "Konzultace zdarma", "Probereme spotřebu, technický stav střechy a vaše plány. Připravíme předběžný návrh."],
  ["02", "Návrh & cenová nabídka", "Konkrétní nabídka FVE — výkon, cena, návratnost, dotace, harmonogram."],
  ["03", "Dotace & financování", "Připravíme žádost o dotaci. Poradíme s financováním nebo bezúročným úvěrem NZÚ."],
  ["04", "Montáž & provoz", "Profesionální instalace, revize, předání. Servisní dohled po celou životnost."],
];

export function Process({ t }: { t?: Record<string, string> }) {
  return (
    <section id="proces" className="relative overflow-hidden border-y border-line bg-surface px-5 py-28 md:px-9 md:py-32">
      <div aria-hidden className="aurora absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-70" />
      <div className="relative mx-auto max-w-[1400px]">
        <SectionHeading
          center
          eyebrow={<T k="pr.eb">{tx(t, "pr.eb", "jak postupujeme")}</T>}
          title={
            <>
              <T k="pr.t1">{tx(t, "pr.t1", "Od konzultace")}</T>{" "}
              <Accent>
                <T k="pr.acc">{tx(t, "pr.acc", "k provozu")}</T>
              </Accent>{" "}
              <T k="pr.t2">{tx(t, "pr.t2", "ve 4 krocích.")}</T>
            </>
          }
          sub={<T k="pr.sub">{tx(t, "pr.sub", "Maximálně 2 měsíce. Jedna firma, jedna smlouva, jedna odpovědnost.")}</T>}
        />
        <Stagger className="mt-14 grid border border-line-strong md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([n, dt, db], i) => (
            <StaggerItem
              key={n}
              className="border-b border-line last:border-b-0 md:max-lg:[&:nth-child(odd)]:border-r md:max-lg:[&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
            >
              <div className="group relative h-full overflow-hidden p-10 transition-colors hover:bg-red-soft">
                <span className="absolute left-0 top-0 h-[3px] w-full origin-left scale-x-0 bg-red transition-transform duration-300 group-hover:scale-x-100" />
                <span
                  aria-hidden
                  className="text-stroke-line pointer-events-none absolute -bottom-8 -right-3 select-none font-mono text-[130px] font-bold leading-none tracking-tighter transition-all duration-300 group-hover:-translate-y-1 group-hover:[-webkit-text-stroke-color:rgba(192,15,10,0.5)]"
                >
                  {n}
                </span>
                <div className="relative z-10">
                  <div className="font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-red-bright">{n}</div>
                  <T as="h4" k={`pr.s${i + 1}.t`} className="mt-4 block text-[22px] font-bold leading-tight text-ink">
                    {tx(t, `pr.s${i + 1}.t`, dt)}
                  </T>
                  <T as="p" k={`pr.s${i + 1}.b`} className="mt-3 block text-[14px] leading-relaxed text-ink-muted">
                    {tx(t, `pr.s${i + 1}.b`, db)}
                  </T>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
