"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const KEY = "vp-cookie-consent";

/** Read the stored consent ("all" | "essential" | null). */
export function getCookieConsent(): "all" | "essential" | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)vp-cookie-consent=([^;]+)/);
  return (m?.[1] as "all" | "essential") ?? null;
}

function store(choice: "all" | "essential") {
  // 6-month cookie + localStorage mirror, so the banner stays dismissed.
  document.cookie = `${KEY}=${choice}; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax`;
  try { localStorage.setItem(KEY, choice); } catch {}
  window.dispatchEvent(new CustomEvent("vp-consent", { detail: choice }));
}

/**
 * GDPR / ePrivacy cookie consent banner. Essential cookies (admin session) are
 * always allowed; analytics/marketing scripts should gate on getCookieConsent() === "all".
 */
export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Cookie is only readable client-side after mount — showing the banner here
    // is the intended pattern (avoids an SSR/CSR hydration mismatch).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!getCookieConsent()) setOpen(true);
  }, []);

  if (!open) return null;

  const choose = (c: "all" | "essential") => { store(c); setOpen(false); };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-line bg-elevated/98 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-9">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center border border-red bg-red-soft text-red">
            <Cookie size={18} />
          </span>
          <p className="max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">
            Používáme nezbytné cookies pro fungování webu a volitelné cookies pro analýzu návštěvnosti a marketing.
            Kliknutím na „Přijmout vše“ souhlasíte s jejich používáním. Více v{" "}
            <Link href="/zasady-cookies-eu/" className="text-red-bright underline underline-offset-2 hover:text-red">
              zásadách cookies
            </Link>.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <button
            onClick={() => choose("essential")}
            className="border border-line-strong px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-ink-muted transition-colors hover:border-white hover:text-ink"
          >
            Jen nezbytné
          </button>
          <button
            onClick={() => choose("all")}
            className="bg-red px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-red-dark"
          >
            Přijmout vše
          </button>
        </div>
      </div>
    </div>
  );
}
