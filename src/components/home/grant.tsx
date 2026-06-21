import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ClipReveal } from "@/components/ui/motion";
import { T, tx } from "@/components/site/t";

export function Grant({ t }: { t?: Record<string, string> }) {
  return (
    <section id="dotace" className="px-5 py-28 md:px-9 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <ClipReveal slide>
          <div className="relative grid items-center gap-12 overflow-hidden border border-red bg-gradient-to-br from-red-dark to-red p-9 md:grid-cols-[1.3fr_1fr] md:p-16">
            <div className="pointer-events-none absolute -left-24 -top-24 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_60%)]" />
            <div aria-hidden className="text-stroke-faint pointer-events-none absolute -bottom-12 right-4 select-none text-[260px] font-bold leading-none tracking-tighter [-webkit-text-stroke-color:rgba(255,255,255,0.14)]">
              {tx(t, "gr.num", "160")}{tx(t, "gr.numS", "k")}
            </div>
            <div className="relative">
              <span className="inline-flex items-center gap-2.5 border border-white/35 bg-white/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                <T k="gr.badge">{tx(t, "gr.badge", "Poslední šance 2026")}</T>
              </span>
              <T as="h3" k="gr.title" className="mt-5 block text-[clamp(2rem,3.6vw,3.25rem)] font-bold leading-[1.05] text-white">
                {tx(t, "gr.title", "Až 160 000 Kč na fotovoltaiku. Vyřídíme za vás.")}
              </T>
              <T as="p" k="gr.text" className="mt-4 block max-w-lg text-[17px] leading-relaxed text-white/90">
                {tx(
                  t,
                  "gr.text",
                  "Od roku 2027 se dotace sníží na 120 000 Kč. Garantujeme získání u všech projektů, které splní podmínky NZÚ. Vyřízení žádosti je součástí ceny.",
                )}
              </T>
              <Link
                href="/kalkulacka/"
                className="group mt-8 inline-flex items-center gap-3 border border-base bg-base px-6 py-4 text-[12.5px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:border-white hover:bg-transparent"
              >
                <T k="gr.btn">{tx(t, "gr.btn", "Spočítat moji dotaci")}</T>{" "}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="brackets [&::before]:border-white [&::after]:border-white relative border border-white/25 bg-black/30 p-10 text-center backdrop-blur-sm">
              <T as="div" k="gr.label" className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/85">
                {tx(t, "gr.label", "Max. dotace 2026")}
              </T>
              <div className="mt-4 text-[clamp(4.5rem,9vw,7.5rem)] font-bold leading-[0.85] tracking-tighter text-white [text-shadow:0_0_30px_rgba(255,255,255,0.3)]">
                <T k="gr.num">{tx(t, "gr.num", "160")}</T>
                <span className="text-[0.4em] font-semibold">
                  <T k="gr.numS">{tx(t, "gr.numS", "k")}</T>
                </span>
              </div>
              <T as="div" k="gr.unit" className="mt-2 block text-[12px] uppercase tracking-[0.1em] text-white/70">
                {tx(t, "gr.unit", "Kč · garance vyřízení")}
              </T>
            </div>
          </div>
        </ClipReveal>
      </div>
    </section>
  );
}
