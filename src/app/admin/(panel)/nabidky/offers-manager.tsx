"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Eye, Download, FileSpreadsheet, Trash2, Pencil, PenLine } from "lucide-react";
import { createManualOffer } from "./actions";

type OfferRow = { id: string; number: string; type: string; subject: string; investor: { name: string }; createdAt: string };

export function OffersManager({ initial }: { initial: OfferRow[] }) {
  const router = useRouter();
  const [, start] = useTransition();

  async function remove(id: string) {
    if (!confirm("Opravdu smazat tuto nabídku?")) return;
    try {
      const res = await fetch(`/api/nabidky/${id}/`, { method: "DELETE" });
      if (res.ok) start(() => router.refresh());
      else alert(res.status === 400 ? "Vzorové nabídky nelze smazat." : "Smazání se nezdařilo.");
    } catch {
      alert("Smazání se nezdařilo — zkontrolujte připojení.");
    }
  }

  return (
    <div>
      {/* Two ways to create a new offer: smart chat (recommended) or fully manual. */}
      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        <Link href="/admin/nabidky/chat/" className="group flex items-center justify-between gap-4 border border-red bg-red-soft p-5 transition-colors hover:bg-red/15">
          <span className="flex items-center gap-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center bg-red text-white"><Sparkles size={20} /></span>
            <span>
              <span className="block text-[15px] font-bold text-ink">Vytvořit přes chat</span>
              <span className="block text-[12.5px] text-ink-muted">Asistent se doptá na vše potřebné a sestaví nabídku. Nejrychlejší cesta.</span>
            </span>
          </span>
          <Pencil size={16} className="text-red-bright transition-transform group-hover:translate-x-1" />
        </Link>

        <form action={createManualOffer}>
          <button type="submit" className="group flex w-full items-center justify-between gap-4 border border-line-strong bg-card p-5 text-left transition-colors hover:border-red">
            <span className="flex items-center gap-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center border border-line-strong text-ink-muted"><PenLine size={20} /></span>
              <span>
                <span className="block text-[15px] font-bold text-ink">Vytvořit ručně</span>
                <span className="block text-[12.5px] text-ink-muted">Prázdná nabídka — vyplníte všechna pole sami v editoru.</span>
              </span>
            </span>
            <Pencil size={16} className="text-ink-dim transition-transform group-hover:translate-x-1" />
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-3">
        {initial.map((o) => (
          <div key={o.id} className="flex flex-wrap items-center justify-between gap-4 border border-line-strong bg-card p-5">
            <div className="flex items-center gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center border border-red bg-red-soft text-red"><FileSpreadsheet size={20} /></span>
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-[16px] font-bold text-ink">{o.subject}</span>
                  <span className="border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-red-bright">{o.type}</span>
                </div>
                <span className="font-mono text-[12px] text-ink-muted">{o.number} · {o.investor?.name || "—"} · {o.createdAt}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/admin/nabidky/${o.id}/`} className="inline-flex items-center gap-1.5 border border-line-strong px-3 py-2 font-mono text-[11px] uppercase tracking-wide text-ink-muted transition-colors hover:border-red hover:text-ink">
                <Pencil size={13} /> Upravit
              </Link>
              <a href={`/nabidka/${o.id}/`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 border border-line-strong px-3 py-2 font-mono text-[11px] uppercase tracking-wide text-ink-muted transition-colors hover:border-white hover:text-ink">
                <Eye size={13} /> Náhled
              </a>
              <a href={`/api/nabidky/${o.id}/pdf/`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-red px-3 py-2 font-mono text-[11px] uppercase tracking-wide text-white transition-colors hover:bg-red-dark">
                <Download size={13} /> PDF
              </a>
              {!o.id.startsWith("vzor-") && (
                <button onClick={() => remove(o.id)} aria-label="Smazat nabídku" className="inline-flex items-center gap-1.5 border border-red/40 px-3 py-2 font-mono text-[11px] uppercase tracking-wide text-red-bright transition-colors hover:bg-red hover:text-white">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
