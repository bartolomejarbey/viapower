"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const PATTERNS = [
  [40, 55, 70, 60, 85, 95, 75, 65],
  [30, 50, 45, 70, 60, 80, 90, 72],
  [55, 48, 72, 62, 80, 68, 92, 78],
  [35, 60, 50, 78, 68, 88, 82, 95],
];

/** Decorative production-style micro bar graphic; draws in on scroll. */
export function MiniBars({ pattern = 0, className }: { pattern?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const bars = PATTERNS[pattern % PATTERNS.length];

  return (
    <div ref={ref} aria-hidden className={cn("flex h-7 items-end gap-[3px]", className)}>
      {bars.map((h, i) => (
        <motion.span
          key={i}
          className="flex-1 bg-gradient-to-t from-red-dark/60 to-red/80"
          style={{ height: `${h}%`, transformOrigin: "bottom" }}
          initial={reduce ? { scaleY: 1 } : { scaleY: 0 }}
          animate={inView || reduce ? { scaleY: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 + i * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
        />
      ))}
    </div>
  );
}
