import { ShieldCheck, Clock, Award, BadgeCheck, Layers, Wallet } from "lucide-react";
import { FadeIn, MaskRise, Stagger, StaggerItem } from "@/components/ui/motion";
import { GlowCards } from "@/components/ui/glow-card";
import { Eyebrow, Accent } from "@/components/ui/primitives";
import { T, tx } from "@/components/site/t";

const ICONS = [ShieldCheck, Clock, Award, BadgeCheck, Layers, Wallet];

const DEFAULTS: [string, string][] = [
  ["30 let záruka na panely", "Nadstandardní výkonová záruka 82,4 %."],
  ["Montáž do 2 měsíců", "Od podpisu po připojení do sítě."],
  ["15+ let zkušeností", "Stovky realizací po celé ČR."],
  ["Garance dotace", "100% úspěšnost při vyřizování NZÚ."],
  ["Vše pod jednou střechou", "FVE, baterie, TČ, wallbox i řízení."],
  ["Individuální financování", "Jen 20 % zálohy předem."],
];

export function Why({ t }: { t?: Record<string, string> }) {
  return (
    <section className="relative overflow-hidden px-5 py-28 md:px-9 md:py-32">
      <div aria-hidden className="aurora absolute -left-40 top-10 h-[520px] w-[520px]" />
      <div aria-hidden className="aurora aurora-2 absolute -right-32 bottom-0 h-[460px] w-[460px]" />
      <div className="relative mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <Eyebrow>
            <T k="why.eb">{tx(t, "why.eb", "proč Viapower")}</T>
          </Eyebrow>
          <h2 className="mt-5 text-[clamp(2.4rem,4.4vw,4rem)] font-bold leading-[1.0] text-ink">
            <MaskRise delay={0.15}>
              <T k="why.t1">{tx(t, "why.t1", "Nejsme jen montáž FVE. Jsme")}</T>{" "}
              <Accent>
                <T k="why.acc">{tx(t, "why.acc", "komplexní partner")}</T>
              </Accent>{" "}
              <T k="why.t2">{tx(t, "why.t2", "v energetice.")}</T>
            </MaskRise>
          </h2>
          <FadeIn delay={0.35}>
            <T
              as="p"
              k="why.sub"
              className="mt-5 block max-w-lg text-[18px] leading-relaxed text-ink-muted"
            >
              {tx(
                t,
                "why.sub",
                "Jsme váš energetický partner od návrhu po provoz. Vytváříme ucelená řešení, která propojují výrobu, akumulaci i chytré řízení spotřeby tak, aby dávala stabilní a spolehlivé výsledky.",
              )}
            </T>
          </FadeIn>
        </div>
        <GlowCards>
          <Stagger className="grid gap-3.5 sm:grid-cols-2">
            {DEFAULTS.map(([dt, dd], i) => {
              const Icon = ICONS[i];
              return (
                <StaggerItem key={i}>
                  <div
                    data-glow
                    className="brackets brackets-draw group flex h-full items-start gap-4 border border-line-strong bg-card p-5 transition-colors hover:border-red"
                  >
                    <span aria-hidden className="glow-ring" />
                    <span className="grid h-11 w-11 shrink-0 place-items-center border border-red bg-red-soft text-red">
                      <Icon size={20} />
                    </span>
                    <div>
                      <T as="h4" k={`why.a${i + 1}.t`} className="block text-[15.5px] font-bold text-ink">
                        {tx(t, `why.a${i + 1}.t`, dt)}
                      </T>
                      <T as="p" k={`why.a${i + 1}.d`} className="mt-1 block text-[13px] leading-relaxed text-ink-muted">
                        {tx(t, `why.a${i + 1}.d`, dd)}
                      </T>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </GlowCards>
      </div>
    </section>
  );
}
