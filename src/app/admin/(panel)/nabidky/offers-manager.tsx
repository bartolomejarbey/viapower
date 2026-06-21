"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Loader2, Eye, Download, FileSpreadsheet, Trash2, Pencil } from "lucide-react";
import { btnPrimary, inputCls, labelCls } from "@/components/admin/ui";

type OfferRow = { id: string; number: string; type: string; subject: string; investor: { name: string }; createdAt: string };

export function OffersManager({ initial }: { initial: OfferRow[] }) {
  const router = useRouter();
  const [, start] = useTransition();
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  async function generate() {
    if (!brief.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/nabidky/generate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });
      const data = await res.json();
      if (data.ok) {
        setBrief("");
        start(() => router.refresh());
      } else {
        setError(data.error || "Generování selhalo.");
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link href="/admin/nabidky/chat/" className="group mb-4 flex items-center justify-between gap-4 border border-red bg-red-soft p-5 transition-colors hover:bg-red/15">
        <span className="flex items-center gap-3.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center bg-red text-white"><Sparkles size={20} /></span>
          <span>
            <span className="block text-[15px] font-bold text-ink">Vytvořit nabídku přes chat</span>
            <span className="block text-[12.5px] text-ink-muted">Asistent se doptá na vše potřebné a upozorní, co chybí. Nejrychlejší cesta k nabídce.</span>
          </span>
        </span>
        <Pencil size={16} className="text-red-bright transition-transform group-hover:translate-x-1" />
      </Link>

      <div className="mb-8 border border-line-strong bg-card p-5">
        <label className={labelCls}>Nebo zadání jedním textem (popis zakázky, výkon, lokalita, ceny…)</label>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={4}
          className={inputCls}
          placeholder="Např. FVE 9,9 kWp s baterií 10 kWh pro pana Nováka, Čakovičky. 18 panelů AIKO, střídač GoodWe. Cena cca 320 000 Kč bez DPH."
        />
        <div className="mt-3 flex items-center gap-3">
          <button onClick={generate} disabled={loading} className={btnPrimary}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />} Vygenerovat nabídku
          </button>
          <span className="font-mono text-[11px] text-ink-dim">Vytvoří strukturovanou nabídku a uloží ji jako PDF k náhledu.</span>
        </div>
        {error && <p className="mt-3 font-mono text-[12px] text-red-bright">{error}</p>}
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
