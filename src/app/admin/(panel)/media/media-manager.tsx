"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, Copy, Trash2, Check } from "lucide-react";
import { btnPrimary } from "@/components/admin/ui";
import { deleteMedia, updateMediaAlt } from "./actions";

type Asset = { id: string; url: string; filename: string; alt: string };

export function MediaManager({ initial }: { initial: Asset[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");
  const [rowError, setRowError] = useState<Record<string, string>>({});
  const setErr = (id: string, msg: string) => setRowError((m) => ({ ...m, [id]: msg }));
  const clearErr = (id: string) => setRowError((m) => { const n = { ...m }; delete n[id]; return n; });
  const [, start] = useTransition();

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/media/", { method: "POST", body: fd });
        if (!res.ok) {
          const d = await res.json().catch(() => null);
          setError(
            res.status === 401 ? "Přihlášení vypršelo." :
            d?.error === "bad_type" ? "Nepodporovaný formát (jen JPG, PNG, WebP, GIF, AVIF)." :
            d?.error === "too_large" ? "Soubor je příliš velký (max 8 MB)." :
            "Nahrání se nezdařilo.",
          );
        }
      }
    } catch {
      setError("Nahrání se nezdařilo — zkontrolujte připojení.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
      start(() => router.refresh());
    }
  }

  return (
    <div>
      <div className="mb-8">
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
        <button onClick={() => inputRef.current?.click()} disabled={uploading} className={btnPrimary}>
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} Nahrát obrázky
        </button>
        {error && <p className="mt-3 text-[13px] font-semibold text-red-bright">{error}</p>}
      </div>
      {initial.length === 0 ? (
        <p className="text-ink-muted">Zatím žádná média. Nahrajte první obrázky.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {initial.map((a) => (
            <div key={a.id} className="border border-line-strong bg-card">
              <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: `url('${a.url}')` }} />
              <div className="p-3">
                <p className="truncate font-mono text-[11px] text-ink-muted" title={a.filename}>{a.filename}</p>
                <input
                  defaultValue={a.alt}
                  onBlur={(e) => { const v = e.target.value; if (v === a.alt) return; clearErr(a.id); start(async () => { try { await updateMediaAlt(a.id, v); } catch { setErr(a.id, "Uložení alt textu selhalo."); } }); }}
                  placeholder="Alt text (popis obrázku)"
                  aria-label={`Alt text pro ${a.filename}`}
                  className="mt-2 w-full border border-line-strong bg-base px-2 py-1.5 text-[12px] text-ink outline-none focus:border-red"
                />
                <div className="mt-2 flex items-center gap-1.5">
                  <button
                    onClick={() => { navigator.clipboard.writeText(a.url); setCopied(a.id); setTimeout(() => setCopied(""), 1200); }}
                    className="inline-flex items-center gap-1 border border-line-strong px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-ink-muted hover:text-ink"
                  >
                    {copied === a.id ? <Check size={11} /> : <Copy size={11} />} URL
                  </button>
                  <button onClick={() => { if (!confirm("Smazat tento obrázek?")) return; clearErr(a.id); start(async () => { try { await deleteMedia(a.id); } catch { setErr(a.id, "Smazání selhalo."); } }); }} className="ml-auto text-ink-dim hover:text-red-bright" aria-label="Smazat">
                    <Trash2 size={13} />
                  </button>
                </div>
                {rowError[a.id] && <p className="mt-2 text-[11px] font-semibold text-red-bright">{rowError[a.id]}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
