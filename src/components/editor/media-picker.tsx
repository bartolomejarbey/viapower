"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";

type Asset = { id: string; url: string; filename: string };

/** Modal media library: pick an existing image or upload a new one. */
export function MediaPicker({ onPick, onClose }: { onPick: (url: string) => void; onClose: () => void }) {
  const [assets, setAssets] = useState<Asset[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const errMsg = (res: Response, code?: string) =>
    res.status === 401 ? "Přihlášení vypršelo. Přihlaste se znovu."
      : code === "bad_type" ? "Nepodporovaný formát — povolené jsou JPG, PNG, WebP, GIF, AVIF."
      : code === "too_large" ? "Soubor je příliš velký (max 8 MB)."
      : code === "no_file" ? "Nevybrali jste žádný soubor."
      : "Nahrání se nezdařilo. Zkuste to prosím znovu.";

  const load = () =>
    fetch("/api/admin/media/")
      .then((r) => r.json())
      .then((d) => setAssets(d.assets ?? []))
      .catch(() => setAssets([]));

  useEffect(() => {
    load();
  }, []);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    let picked = false;
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/media/", { method: "POST", body: fd });
        const d = await res.json().catch(() => null);
        if (!res.ok || !d?.asset?.url) {
          setError(errMsg(res, d?.error));
          continue;
        }
        if (files.length === 1) {
          onPick(d.asset.url);
          picked = true;
          return;
        }
      }
    } catch {
      setError("Nahrání se nezdařilo — zkontrolujte připojení.");
    } finally {
      setUploading(false);
      if (!picked) load();
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[80vh] w-full max-w-3xl flex-col border border-line-strong bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-ink">Vybrat obrázek</span>
          <div className="flex items-center gap-2">
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => onFiles(e.target.files)} />
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 bg-red px-3.5 py-2 text-[11.5px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-red-dark disabled:opacity-60"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Nahrát
            </button>
            <button onClick={onClose} className="grid h-9 w-9 place-items-center text-ink-muted hover:text-ink" aria-label="Zavřít">
              <X size={18} />
            </button>
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
                <button
                  key={a.id}
                  onClick={() => onPick(a.url)}
                  className="group overflow-hidden border border-line-strong transition-colors hover:border-red"
                  title={a.filename}
                >
                  <span className="block aspect-video bg-cover bg-center transition-transform duration-300 group-hover:scale-105" style={{ backgroundImage: `url('${a.url}')` }} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
