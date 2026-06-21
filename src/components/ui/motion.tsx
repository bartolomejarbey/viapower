"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { formatNumber, cn } from "@/lib/utils";

/** The one brand curve — mirror of --ease-vp in globals.css. Use everywhere. */
export const EASE = [0.2, 0.8, 0.2, 1] as const;
export const DUR = { fast: 0.2, base: 0.35, slow: 0.7 } as const;

const VIEWPORT = { once: true, margin: "-60px" } as const;

/** Scroll-into-view reveal. Respects prefers-reduced-motion. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ── reveal grammar ──────────────────────────────────────────── */

/** Red rule line that draws itself in (eyebrow tick). */
export function TickIn({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className={cn("block h-px origin-left bg-red-bright", className)}
      initial={reduce ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.6, ease: EASE }}
    />
  );
}

/**
 * Masked headline rise. The pt/-mt + pb/-mb pairs extend the clip window so
 * Czech caron caps (Š) and descenders (y, p) never clip at tight leading.
 * In-view detection lives on the mask wrapper — the translated child has
 * (near-)zero visible intersection, so observing it directly is flaky.
 */
export function MaskRise({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  return (
    <span ref={ref} className="-mb-[0.1em] -mt-[0.12em] block overflow-hidden pb-[0.1em] pt-[0.12em]">
      <motion.span
        className={cn("block", className)}
        initial={reduce ? false : { y: "105%" }}
        animate={inView || reduce ? { y: 0 } : undefined}
        transition={{ duration: 0.8, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** Soft fade-up for subs and small text. `inline` renders a span. */
export function FadeIn({
  children,
  delay = 0,
  y = 12,
  inline = false,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  inline?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const Tag = inline ? motion.span : motion.div;
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

/* ── stagger grammar: one 70ms cascade for every grid ────────── */

const staggerGroup = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function Stagger({
  className,
  amount = 0.15,
  children,
}: {
  className?: string;
  amount?: number;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-60px", amount }}
      variants={staggerGroup}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

/* ── showpieces ──────────────────────────────────────────────── */

/**
 * Hard-edged clip wipe (Grant band). Content counter-slides when `slide`.
 * In-view detection lives on the UNclipped wrapper — a fully clipped element
 * reports zero intersection, so observing the clipped node would never fire.
 */
export function ClipReveal({
  children,
  className,
  slide = false,
}: {
  children: ReactNode;
  className?: string;
  slide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const reduce = useReducedMotion();
  const go = inView || !!reduce;
  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
        animate={go ? { clipPath: "inset(0 0% 0 0)" } : undefined}
        transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
      >
        {slide ? (
          <motion.div
            initial={reduce ? false : { x: 32, opacity: 0 }}
            animate={go ? { x: 0, opacity: 1 } : undefined}
            transition={{ duration: 0.9, delay: 0.08, ease: EASE }}
          >
            {children}
          </motion.div>
        ) : (
          children
        )}
      </motion.div>
    </div>
  );
}

/** Scroll-scrubbed vertical drift. Desktop (lg+) only; off under reduced motion. */
export function ParallaxY({
  range = 16,
  className,
  children,
}: {
  range?: number;
  className?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = matchMedia("(min-width: 1024px)");
    const update = () => setEnabled(mq.matches && !reduce);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [reduce]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [range, -range]);

  return (
    <motion.div ref={ref} style={enabled ? { y } : undefined} className={className}>
      {children}
    </motion.div>
  );
}

/* ── numbers ─────────────────────────────────────────────────── */

/** Animated count-up that triggers on scroll. (Kept for legacy call sites.) */
export function Counter({
  to,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration = 1400,
  className,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVal(to);
      return;
    }
    let raf = 0;
    let startTs = 0;
    const tick = (now: number) => {
      if (!startTs) startTs = now;
      const p = Math.min((now - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatNumber(val, decimals)}
      {suffix}
    </span>
  );
}

const DIGITS = Array.from({ length: 10 }, (_, n) => n);

/**
 * Odometer digit-roll. Each digit is a stacked 0-9 column that springs to its
 * final position; non-digits (Czech decimal comma, spaces) stay static.
 * A sr-only twin carries the readable value for screen readers.
 */
export function DigitRoll({
  to,
  decimals = 0,
  suffix = "",
  prefix = "",
  className,
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const finalStr = formatNumber(to, decimals);
  const chars = [...(prefix + finalStr)];
  let digitIndex = 0;

  return (
    <span ref={ref} className={className}>
      <span aria-hidden className="inline-flex [font-variant-numeric:tabular-nums]">
        {chars.map((ch, i) => {
          if (!/\d/.test(ch)) {
            return (
              <span key={i} className="inline-block whitespace-pre">
                {ch}
              </span>
            );
          }
          const d = Number(ch);
          const idx = digitIndex++;
          const settled = { y: `${-d}em` };
          return (
            <span key={i} className="inline-block h-[1em] overflow-hidden">
              <motion.span
                className="block"
                initial={reduce ? settled : { y: 0 }}
                animate={inView || reduce ? settled : { y: 0 }}
                transition={
                  reduce ? { duration: 0 } : { type: "spring", stiffness: 90, damping: 24, delay: idx * 0.055 }
                }
              >
                {DIGITS.map((n) => (
                  <span key={n} className="block h-[1em] leading-[1em]">
                    {n}
                  </span>
                ))}
              </motion.span>
            </span>
          );
        })}
        {suffix && (
          <motion.span
            className="inline-block whitespace-pre"
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            animate={inView || reduce ? { opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: reduce ? 0 : digitIndex * 0.055 + 0.2 }}
          >
            {suffix}
          </motion.span>
        )}
      </span>
      <span className="sr-only">
        {prefix}
        {finalStr}
        {suffix}
      </span>
    </span>
  );
}
