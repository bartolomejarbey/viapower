"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, ArrowLeft } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface to the console / any monitoring; never expose internals to the user.
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-base px-6 text-center">
      <div>
        <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-red-bright">Něco se pokazilo</div>
        <h1 className="mt-4 text-[clamp(2.6rem,8vw,6rem)] font-bold leading-none tracking-tighter text-ink">
          Nastala <span className="text-red">chyba.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[17px] text-ink-muted">
          Omlouváme se — stránku se nepodařilo načíst. Zkuste to prosím znovu, nebo nás kontaktujte.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="group inline-flex items-center gap-2.5 border border-red bg-red px-7 py-4 font-mono text-[12.5px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-dark"
          >
            <RotateCcw size={15} /> Zkusit znovu
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 border border-line-strong px-6 py-4 font-mono text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-muted transition-colors hover:border-white hover:text-ink"
          >
            <ArrowLeft size={15} /> Hlavní stránka
          </Link>
        </div>
      </div>
    </main>
  );
}
