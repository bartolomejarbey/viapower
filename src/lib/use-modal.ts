"use client";

import { useEffect } from "react";

/** Modal a11y: Escape closes + focus is restored to the trigger on unmount. */
export function useModalKeys(onClose: () => void) {
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [onClose]);
}
