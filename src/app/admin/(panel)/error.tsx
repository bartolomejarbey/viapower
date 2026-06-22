"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid min-h-[60vh] place-items-center p-8 text-center">
      <div className="max-w-sm">
        <span className="mx-auto mb-5 grid h-14 w-14 place-items-center border border-red bg-red-soft text-red"><AlertTriangle size={24} /></span>
        <h1 className="text-[22px] font-bold text-ink">Něco se nepovedlo</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">Při načítání stránky nastala chyba. Zkuste to prosím znovu — pokud potíže přetrvávají, obnovte stránku.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="border border-red bg-red px-4 py-2.5 text-[12px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-dark">Zkusit znovu</button>
          <Link href="/admin/" className="border border-line-strong px-4 py-2.5 text-[12px] font-bold uppercase tracking-wide text-ink-muted transition-colors hover:border-red hover:text-ink">Zpět na přehled</Link>
        </div>
      </div>
    </div>
  );
}
