"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Monitor } from "lucide-react";

/** Renders the heavy visual editor only on desktop; phones/tablets get a friendly notice. */
export function DesktopGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setOk(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (ok === null) return null; // avoid fl... mount only once we know the width
  if (!ok) {
    return (
      <div className="grid min-h-screen place-items-center bg-base px-6 text-center">
        <div className="max-w-sm">
          <span className="mx-auto mb-5 grid h-14 w-14 place-items-center border border-red bg-red-soft text-red"><Monitor size={24} /></span>
          <h1 className="text-[22px] font-bold text-ink">Editor jen na počítači</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">Vizuální editor a živá editace vyžadují větší obrazovku. Otevřete prosím tuto stránku na notebooku nebo počítači.</p>
          <Link href="/admin/stranky/" className="mt-6 inline-flex items-center gap-2 border border-line-strong px-4 py-2.5 text-[12px] font-bold uppercase tracking-wide text-ink-muted transition-colors hover:border-red hover:text-ink">Zpět do administrace</Link>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
