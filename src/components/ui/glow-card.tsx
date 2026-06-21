"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Cursor-tracked ember border for card grids. One delegated pointermove
 * listener; writes --mx/--my straight to the hovered [data-glow] card
 * (no React state per move). Cards render a `.glow-ring` child themselves.
 * Desktop pointers only — touch gets nothing.
 */
export function GlowCards({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const onMove = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>("[data-glow]");
      if (!card || !el.contains(card)) return;
      // fresh rect each event — cards translate on hover, cached rects go stale
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };

    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
