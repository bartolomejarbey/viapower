"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { EASE } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

export type FaqItem = { q: string; a: string };

export function FaqAccordion({
  items,
  startOpen = 0,
  editPrefix,
}: {
  items: FaqItem[];
  startOpen?: number;
  /** When set, question/answer texts become on-site live-editable. */
  editPrefix?: string;
}) {
  const [open, setOpen] = useState<number>(startOpen);
  const reduce = useReducedMotion();

  return (
    <div className="mx-auto max-w-3xl border-y border-line-strong">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={cn("relative border-b border-line last:border-0", isOpen && "bg-card")}>
            {/* red rail grows with the open panel */}
            <motion.span
              aria-hidden
              className="absolute left-0 top-0 h-full w-[2px] origin-top bg-red"
              animate={{ scaleY: isOpen ? 1 : 0 }}
              transition={reduce ? { duration: 0 } : { duration: 0.3, ease: EASE }}
            />
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-6 text-left transition-colors hover:text-red-bright"
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${i}`}
              id={`faq-btn-${i}`}
            >
              <span className="flex items-center gap-4 text-[17px] font-semibold text-ink">
                <span className="font-mono text-[11.5px] tracking-wide text-red">Q{String(i + 1).padStart(2, "0")}</span>
                <span data-edit={editPrefix ? `${editPrefix}.${i}.q` : undefined} suppressContentEditableWarning>
                  {it.q}
                </span>
              </span>
              <motion.span
                className="shrink-0 text-red"
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 22 }}
              >
                <Plus size={22} />
              </motion.span>
            </button>
            <motion.div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-btn-${i}`}
              aria-hidden={!isOpen}
              initial={false}
              animate={{ height: isOpen ? "auto" : 0 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 36, mass: 0.8 }}
              style={{ overflow: "hidden" }}
            >
              <motion.p
                className="px-5 pb-6 text-[15px] leading-relaxed text-ink-muted sm:pl-[4.5rem]"
                animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -6 }}
                transition={reduce ? { duration: 0 } : { duration: 0.25, delay: isOpen ? 0.06 : 0 }}
              >
                <span data-edit={editPrefix ? `${editPrefix}.${i}.a` : undefined} suppressContentEditableWarning>
                  {it.a}
                </span>
              </motion.p>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
