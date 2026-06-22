"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Phone, Sun } from "lucide-react";
import type { Company } from "@/lib/company";
import { EASE } from "@/components/ui/motion";
import { ArrowSwap } from "@/components/ui/primitives";
import { tx } from "@/components/site/t";
import { formatCZK, formatNumber } from "@/lib/utils";
import { computeCalc, DEFAULT_CONFIG, type CalcConfig } from "@/lib/calc";

export function Hero({ t, company, cfg = DEFAULT_CONFIG }: { t?: Record<string, string>; company: Company; cfg?: CalcConfig }) {
  const line1 = tx(t, "hero.line1", "Energie, kterou");
  const accent = tx(t, "hero.accent", "si vyrábíte");
  const line2 = tx(t, "hero.line2", "sami.");
  const sub = tx(
    t,
    "hero.sub",
    "Fotovoltaika nové generace pro rodinné domy i firmy. Panely AIKO, baterie GoodWe, inteligentní řízení spotřeby — pod jednou střechou. Dotace až 160 000 Kč.",
  );
  const bgImage = tx(t, "hero.image", "/img/real/hero.webp");
  const reduce = useReducedMotion();
  const words = line1.split(" ");
  const rise = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.1 + i * 0.12, ease: EASE },
  });

  // ambient depth on scroll-out: only the background layers drift —
  // the hero composition itself is untouched and pixel-identical at rest
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const gridOpacity = useTransform(scrollYProgress, [0, 1], [0.6, 0.2]);

  return (
    <section ref={sectionRef} className="relative flex min-h-[calc(100vh-120px)] items-center overflow-hidden px-5 py-16 md:px-9">
      {/* fullscreen background photo — pre-extended upward so the drift never reveals an edge */}
      <motion.div className="absolute inset-x-0 -top-[10%] bottom-0 -z-30" style={reduce ? undefined : { y: bgY }} data-edit-img="hero.image">
        <Image src={bgImage} alt="" fill priority sizes="100vw" className="object-cover object-center" />
      </motion.div>
      <div className="absolute inset-0 -z-20 bg-base/55" />
      <div className="absolute inset-0 -z-20 bg-gradient-to-t from-base via-base/40 to-base/80" />
      <div className="absolute inset-0 -z-20 bg-gradient-to-r from-base via-base/30 to-transparent" />
      {/* grid + glow */}
      <motion.div
        className="bg-grid bg-grid-mask absolute inset-0 -z-10"
        style={reduce ? { opacity: 0.6 } : { opacity: gridOpacity }}
      />
      <motion.div
        className="pointer-events-none absolute -right-40 -top-48 -z-10"
        style={reduce ? undefined : { y: glowY }}
      >
        <div className="animate-glow h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle,rgba(192,15,10,0.32),transparent_60%)] blur-2xl" />
      </motion.div>
      <div aria-hidden className="aurora absolute -bottom-24 -left-32 -z-10 h-[520px] w-[520px] opacity-70" />

      <div className="mx-auto grid w-full max-w-[1400px] items-center gap-14 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <motion.span
            {...rise(0)}
            className="inline-flex items-center gap-3 border border-red bg-red-soft px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-red-bright"
          >
            <span className="animate-blink h-2 w-2 bg-red" aria-hidden />
            <span data-edit="hero.badge" suppressContentEditableWarning>
              {tx(t, "hero.badge", `Komplexní partner v energetice · est. ${company.founded}`)}
            </span>
          </motion.span>

          <h1 className="mt-7 text-[clamp(3.25rem,7vw,7rem)] font-bold leading-[0.95] tracking-[-0.03em] text-ink">
            <span className="block" data-edit="hero.line1" suppressContentEditableWarning>
              {words.map((w, i) => (
                <Fragment key={`${w}-${i}`}>
                  <motion.span {...rise(i + 1)} className="inline-block">
                    {w}
                  </motion.span>
                  {i < words.length - 1 ? " " : null}
                </Fragment>
              ))}
            </span>
            <span className="block">
              <motion.span {...rise(3)} className="relative mr-[0.25em] inline-block text-red">
                <span data-edit="hero.accent" suppressContentEditableWarning>{accent}</span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-[5px] origin-left bg-red"
                  initial={reduce ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, delay: 1.1, ease: EASE }}
                />
              </motion.span>
              <motion.span {...rise(4)} className="inline-block" data-edit="hero.line2" suppressContentEditableWarning>
                {line2}
              </motion.span>
            </span>
          </h1>

          <motion.p {...rise(5)} className="mt-7 max-w-xl text-[19px] leading-relaxed text-white/80" data-edit="hero.sub" suppressContentEditableWarning>
            {sub}
          </motion.p>

          <motion.div {...rise(6)} className="mt-9 flex flex-wrap items-center gap-3.5">
            <Link
              href="/poptavkovy-formular/"
              className="group relative inline-flex items-center gap-3 overflow-hidden border border-red bg-red px-7 py-4 font-mono text-[13px] font-bold uppercase tracking-[0.1em] text-white transition-colors duration-300 hover:border-white hover:text-red"
            >
              <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
              <span data-edit="hero.cta1" suppressContentEditableWarning>{tx(t, "hero.cta1", "Konzultace zdarma")}</span> <ArrowSwap />
            </Link>
            <Link
              href="/fotovoltaiky-pro-rodinne-domy-na-klic/"
              className="inline-flex items-center gap-3 border border-line-strong px-6 py-4 font-mono text-[13px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:border-white hover:bg-white/5"
            >
              <span data-edit="hero.cta2" suppressContentEditableWarning>{tx(t, "hero.cta2", "Balíčky FVE")}</span>
            </Link>
            <a href={company.phoneHref} className="ml-1 hidden items-center gap-2 font-mono text-[13px] text-white/80 hover:text-white sm:flex">
              <Phone size={15} className="text-red" /> {company.phone}
            </a>
          </motion.div>

          <motion.div {...rise(7)} className="mt-11 grid max-w-xl grid-cols-2 gap-y-6 border-t border-line pt-8 sm:grid-cols-4">
            {([1, 2, 3, 4] as const).map((n) => {
              const defaults = [
                ["instalací", "500", "+"],
                ["zkušeností", "15", " let"],
                ["hodnocení", "4,9", "/5"],
                ["dotace", "100", "%"],
              ][n - 1];
              return (
                <Metric
                  key={n}
                  k={`hero.m${n}`}
                  label={tx(t, `hero.m${n}.l`, defaults[0])}
                  value={tx(t, `hero.m${n}.v`, defaults[1])}
                  accent={tx(t, `hero.m${n}.a`, defaults[2])}
                />
              );
            })}
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: EASE }}
          className="relative hidden lg:block"
        >
          <HeroCalc t={t} cfg={cfg} />
        </motion.div>
      </div>
    </section>
  );
}

function Metric({ k, label, value, accent }: { k: string; label: string; value: string; accent: string }) {
  return (
    <div className="flex flex-col">
      <span className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-dim" data-edit={`${k}.l`} suppressContentEditableWarning>
        {label}
      </span>
      <span className="text-[28px] font-bold leading-none tracking-tight text-ink">
        <span data-edit={`${k}.v`} suppressContentEditableWarning>{value}</span>
        <span className="text-red" data-edit={`${k}.a`} suppressContentEditableWarning>{accent}</span>
      </span>
    </div>
  );
}

/* compact savings calculator — the hero's working instrument */
function HeroCalc({ t, cfg }: { t?: Record<string, string>; cfg: CalcConfig }) {
  const [monthly, setMonthly] = useState(3500);
  const { pkg, annualSavings, subsidy } = computeCalc(monthly, cfg);

  return (
    <div className="brackets border border-line-strong bg-card/95 p-7 shadow-[var(--shadow-glow)] backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-red-bright">
          <span className="h-2 w-2 bg-red" />
          {tx(t, "herocalc.title", "Spočítejte si úsporu")}
        </span>
        <Sun size={16} className="text-ink-dim" />
      </div>

      <p className="mt-5 text-[14px] text-ink-muted">{tx(t, "herocalc.question", "Kolik měsíčně platíte za elektřinu?")}</p>
      <div className="mt-1.5 text-[40px] font-bold leading-none tracking-tight text-ink">
        {formatCZK(monthly)}
        <span className="ml-1 text-[15px] font-medium text-ink-muted">/ měsíc</span>
      </div>
      <input
        type="range"
        min={1000}
        max={12000}
        step={250}
        value={monthly}
        onChange={(e) => setMonthly(Number(e.target.value))}
        className="mt-5 w-full accent-red"
        aria-label="Měsíční platba za elektřinu"
      />

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-5">
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-dim">{tx(t, "herocalc.savings", "Úspora ročně")}</span>
          <span className="mt-1 block text-[22px] font-bold tracking-tight text-red-bright">{formatCZK(annualSavings)}</span>
        </div>
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-dim">{tx(t, "herocalc.subsidy", "Dotace NZÚ")}</span>
          <span className="mt-1 block text-[22px] font-bold tracking-tight text-ink">{formatCZK(subsidy)}</span>
        </div>
      </div>
      <p className="mt-3 text-[12.5px] text-ink-muted">
        {tx(t, "herocalc.recommended", "Doporučená sestava:")} <span className="font-semibold text-ink">{pkg.name}</span> · {formatNumber(pkg.kwp, 2)} kWp
      </p>

      <Link
        href="/poptavkovy-formular/"
        className="group mt-5 flex w-full items-center justify-center gap-2.5 bg-red px-5 py-3.5 text-[12.5px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-dark"
      >
        {tx(t, "herocalc.cta", "Chci přesnou nabídku")} <ArrowSwap size={13} />
      </Link>
      <Link href="/kalkulacka/" className="group/link mt-3 block text-center text-[12px] text-ink-muted transition-colors hover:text-ink">
        <span className="u-draw pb-0.5">{tx(t, "herocalc.detail", "Podrobná kalkulačka s návratností")}</span>
      </Link>
    </div>
  );
}
