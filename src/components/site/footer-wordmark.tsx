"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from "framer-motion";

const WORDMARK_CLS =
  "block translate-y-[12%] whitespace-nowrap text-center font-bold leading-[0.78] tracking-[-0.04em] text-[clamp(4rem,15vw,13rem)]";

/**
 * Footer finale: hollow VIAPOWER wordmark whose dark-red fill wipes in,
 * completing exactly as the footer bottom meets the viewport bottom.
 * Two stacked copies + compositor clip-path — no background-size animation.
 */
export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const rest = useTransform(scrollYProgress, [0.2, 1], [100, 0]);
  const clipPath = useMotionTemplate`inset(0 ${rest}% 0 0)`;

  return (
    <div ref={ref} aria-hidden className="pointer-events-none relative -mb-8 mt-14 select-none overflow-hidden">
      <span className={`text-stroke-faint ${WORDMARK_CLS}`}>VIAPOWER</span>
      {!reduce && (
        <motion.span style={{ clipPath }} className={`absolute inset-0 text-red-dark ${WORDMARK_CLS}`}>
          VIAPOWER
        </motion.span>
      )}
    </div>
  );
}
