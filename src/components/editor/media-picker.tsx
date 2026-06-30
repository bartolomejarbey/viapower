"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { CropModal } from "@/components/editor/crop-modal";
import { useModalKeys } from "@/lib/use-modal";

type Asset = { id: string; url: string; filename: string };

/** Modal media library: pick an existing image or upload a new one (with crop). */
export function MediaPicker({ onPick, onClose }: { onPick: (url: string) => void; onClose: () => void }) {
  const [assets, setAssets] = useState<Asset[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [crop, setCrop] = useState<{ url: string; name: string; mime: string; original: File } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const errMsg = (res: Response, code?: string) =>
    res.status === 401 ? "Přihlášení vypršelo. Přihlaste se znovu."
      : code === "bad_type" ? "Nepodporovaný formát — povolené jsou JPG, PNG, WebP, GIF, AVIF."
      : code === "too_large" ? "Soubor je příliš velký (max 8 MB)."
      : code === "storage_failed" ? "Nahrání do úložiště selhalo. Zkuste to znovu."
      : "Nahrání se nezdařilo. Zkuste to prosím znovu.";

  const load = () =>
    fetch("/api/admin/media/").then((r) => r.json()).then((d) => setAssets(d.assets ?? [])).catch(() => setAssets([]));

  useEffect(() => { load(); }, []);
  useModalKeys(() => { if (crop) closeCrop(); else onClose(); }); // Esc: close crop first, else the picker

  async function uploadBlob(blob: Blob, name: string): Promise<boolean> {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", blob, name);
      const res = await fetch("/api/admin/media/", { method: "POST", body: fd });
      const d = await res.json().catch(() => null);
      if (!res.ok || !d?.asset?.url) { setError(errMsg(res, d?.error)); return false; }
      onPick(d.asset.url);
      return true;
    } catch {
      setError("Nahrání se nezdařilo — zkontrolujte připojení.");
      return false;
    } finally {
      setUploading(false);
    }
  }

  function onFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    // open the crop tool first (center / crop / move / zoom)
    setCrop({ url: URL.createObjectURL(file), name: file.name, mime: file.type, original: file });
  }

  function closeCrop() {
    if (crop) URL.revokeObjectURL(crop.url);
    setCrop(null);
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[80vh] w-full max-w-3xl flex-col border border-line-strong bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-ink">Vybrat obrázek</span>
          <div className="flex items-center gap-2">
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" hidden onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
            <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 bg-red px-3.5 py-2 text-[11.5px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-red-dark disabled:opacity-60">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Nahrát
            </button>
            <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center text-ink-muted hover:text-ink" aria-label="Zavřít"><X size={18} /></button>
          </div>
        </div>
        {error && <p className="border-b border-red/40 bg-red-soft px-5 py-2.5 text-[12.5px] font-semibold text-red-bright">{error}</p>}
        <div className="flex-1 overflow-y-auto p-5">
          {assets === null ? (
            <p className="text-[14px] text-ink-muted">Načítám…</p>
          ) : assets.length === 0 ? (
            <p className="text-[14px] text-ink-muted">Knihovna je prázdná — nahrajte první obrázek.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {assets.map((a) => (
                <button type="button" key={a.id} onClick={() => onPick(a.url)} className="group overflow-hidden border border-line-strong transition-colors hover:border-red" title={a.filename}>
                  <span className="block aspect-video bg-cover bg-center transition-transform duration-300 group-hover:scale-105" style={{ backgroundImage: `url('${a.url}')` }} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {crop && (
        <CropModal
          src={crop.url}
          mime={crop.mime}
          onConfirm={async (blob) => { const ok = await uploadBlob(blob, crop.name); closeCrop(); if (!ok) load(); }}
          onUseOriginal={async () => { const f = crop.original; closeCrop(); const ok = await uploadBlob(f, f.name); if (!ok) load(); }}
          onCancel={closeCrop}
        />
      )}
    </div>
  );
}
