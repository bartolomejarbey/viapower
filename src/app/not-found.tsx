import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-base px-6 text-center">
      <div>
        <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-red-bright">Chyba 404</div>
        <h1 className="mt-4 text-[clamp(3rem,9vw,7rem)] font-bold leading-none tracking-tighter text-ink">
          Stránka <span className="text-red">nenalezena.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[17px] text-ink-muted">
          Tahle stránka neexistuje nebo byla přesunuta. Zkuste to z hlavní stránky.
        </p>
        <Link
          href="/"
          className="group mt-8 inline-flex items-center gap-2.5 border border-red bg-red px-7 py-4 font-mono text-[12.5px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-dark"
        >
          <ArrowLeft size={15} /> Zpět na hlavní stránku
        </Link>
      </div>
    </main>
  );
}
