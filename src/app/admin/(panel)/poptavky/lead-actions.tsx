"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteLead } from "./actions";

export function DeleteLeadButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState(false);
  return (
    <span className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Opravdu smazat tuto poptávku? Tuto akci nelze vrátit.")) return;
          setError(false);
          start(async () => {
            try { await deleteLead(id); } catch { setError(true); }
          });
        }}
        className="inline-flex items-center gap-1.5 border border-red/40 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wide text-red-bright transition-colors hover:bg-red hover:text-white disabled:opacity-60"
      >
        {pending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Smazat
      </button>
      {error && <span className="font-mono text-[10.5px] text-red-bright">Smazání selhalo</span>}
    </span>
  );
}
