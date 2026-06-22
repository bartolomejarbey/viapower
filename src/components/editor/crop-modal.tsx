"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Check, X, ZoomIn, Loader2 } from "lucide-react";
import { useModalKeys } from "@/lib/use-modal";

type Aspect = { label: string; value: number | undefined };
const ASPECTS: Aspect[] = [
  { label: "Volné", value: undefined },
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "1:1", value: 1 },
];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function cropToBlob(src: string, area: Area, mime: string): Promise<Blob> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width);
  canvas.height = Math.round(area.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas ctx");
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);
  const type = mime === "image/png" ? "image/png" : "image/jpeg";
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), type, 0.92),
  );
}

/** Crop / center / move / zoom an image before upload. Returns the cropped Blob. */
export function CropModal({ src, mime, onConfirm, onUseOriginal, onCancel }: {
  src: string;
  mime: string;
  onConfirm: (blob: Blob) => void;
  onUseOriginal: () => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  useModalKeys(onCancel);

  const onComplete = useCallback((_: Area, px: Area) => setArea(px), []);

  async function confirm() {
    if (!area) { onUseOriginal(); return; }
    setBusy(true);
    try {
      const blob = await cropToBlob(src, area, mime);
      onConfirm(blob);
    } catch {
      onUseOriginal();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col border border-line-strong bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-ink">Upravit obrázek</span>
          <button onClick={onCancel} className="grid h-9 w-9 place-items-center text-ink-muted hover:text-ink" aria-label="Zavřít"><X size={18} /></button>
        </div>

        <div className="relative h-[52vh] min-h-72 bg-base">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onComplete}
            restrictPosition={false}
            showGrid
          />
        </div>

        <div className="border-t border-line px-5 py-4">
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-ink-dim">Poměr:</span>
            {ASPECTS.map((a) => (
              <button key={a.label} onClick={() => setAspect(a.value)} className={`border px-2.5 py-1 text-[11.5px] font-bold ${aspect === a.value ? "border-red text-red-bright" : "border-line-strong text-ink-muted hover:text-ink"}`}>{a.label}</button>
            ))}
          </div>
          <div className="mb-4 flex items-center gap-3">
            <ZoomIn size={15} className="shrink-0 text-ink-dim" />
            <input type="range" min={1} max={4} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-red" aria-label="Přiblížení" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={confirm} disabled={busy} className="inline-flex items-center gap-2 bg-red px-4 py-2.5 text-[12px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-dark disabled:opacity-60">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Oříznout a nahrát
            </button>
            <button onClick={onUseOriginal} disabled={busy} className="border border-line-strong px-4 py-2.5 text-[12px] font-bold uppercase tracking-wide text-ink-muted transition-colors hover:border-white hover:text-ink disabled:opacity-60">
              Použít celý obrázek
            </button>
            <span className="ml-auto text-[11.5px] text-ink-dim">Táhněte pro posun · kolečko/posuvník přiblíží</span>
          </div>
        </div>
      </div>
    </div>
  );
}
