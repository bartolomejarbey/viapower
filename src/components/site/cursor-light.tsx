"use client";

import { useEffect, useRef } from "react";

/**
 * Site-wide ambient cursor light — a soft red glow that follows the pointer
 * on the dark canvas (screen blend, very low alpha, so text is unaffected).
 * Desktop pointers only; off under reduced motion. rAF-throttled, zero React state.
 */
export function CursorLight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let raf = 0;
    let dirty = false;

    const apply = () => {
      el.style.setProperty("--cx", `${x}px`);
      el.style.setProperty("--cy", `${y}px`);
      dirty = false;
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      el.classList.add("on");
      if (!dirty) {
        dirty = true;
        raf = requestAnimationFrame(apply);
      }
    };
    const onLeave = () => el.classList.remove("on");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} aria-hidden className="cursor-light" />;
}
