"use client";

import type { ComponentType } from "react";
import {
  Plus, Trash2, ImagePlus, ArrowUp, ArrowDown, X,
  Sun, Home, Building2, Thermometer, Plug, Wind, Cpu, ShieldCheck, Clock, Award,
  BadgeCheck, Layers, Wallet, Zap, BatteryCharging, PiggyBank, TrendingUp, Leaf, Wrench,
  FileCheck, Phone, Mail, MapPin, Users, Sparkles,
} from "lucide-react";
import { arrayMove } from "@dnd-kit/sortable";
import { RichText } from "@/components/admin/rich-text";
import { ICON_NAMES, normalizeLogos, getLayout, isCenter, type BlockType } from "@/lib/blocks";
import { cn } from "@/lib/utils";

export type Data = Record<string, unknown>;
type SetFn = (key: string, value: unknown) => void;
type PickImage = (assign: (url: string) => void) => void;

const s = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const list = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

const ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  Sun, Home, Building2, Thermometer, Plug, Wind, Cpu, ShieldCheck, Clock, Award,
  BadgeCheck, Layers, Wallet, Zap, BatteryCharging, PiggyBank, TrendingUp, Leaf, Wrench,
  FileCheck, Phone, Mail, MapPin, Users, Sparkles,
};

/* inline editable text — looks like the rendered text, edits in place */
function Txt({ value, onChange, placeholder, className, area, ariaLabel }: { value: string; onChange: (v: string) => void; placeholder: string; className?: string; area?: boolean; ariaLabel?: string }) {
  const cls = cn("w-full resize-none bg-transparent outline-none placeholder:text-ink-dim/50 focus:outline-none", className);
  const label = ariaLabel ?? placeholder;
  return area ? (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={label} rows={2} className={cls} />
  ) : (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={label} className={cls} />
  );
}

function ImageField({ url, onPick, onClear, className, label = "Vybrat obrázek" }: { url: string; onPick: () => void; onClear?: () => void; className?: string; label?: string }) {
  return (
    <div className={cn("group relative", className)}>
      <button type="button" onClick={onPick} className="block h-full w-full overflow-hidden border border-dashed border-line-strong bg-card text-ink-muted transition-colors hover:border-red">
        {url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-[12px] font-bold uppercase tracking-wide text-white opacity-0 transition-opacity group-hover:opacity-100">Vyměnit</span>
          </>
        ) : (
          <span className="flex h-full min-h-32 w-full flex-col items-center justify-center gap-2">
            <ImagePlus size={22} />
            <span className="text-[12px] font-semibold uppercase tracking-wide">{label}</span>
          </span>
        )}
      </button>
      {url && onClear && (
        <button type="button" onClick={onClear} aria-label="Odebrat obrázek" className="absolute right-1.5 top-1.5 z-10 grid h-6 w-6 place-items-center border border-line-strong bg-elevated text-ink-dim transition-colors hover:text-red-bright">
          <X size={12} />
        </button>
      )}
    </div>
  );
}

function SectionHead({ d, set }: { d: Data; set: SetFn }) {
  const center = isCenter(getLayout(d), d.align === "center");
  const ctr = center ? " text-center" : "";
  return (
    <div className={cn("mb-5", center && "mx-auto max-w-3xl text-center")}>
      <Txt value={s(d.eyebrow)} onChange={(v) => set("eyebrow", v)} placeholder="Nadpisek (volitelné)" className={`text-[11.5px] font-semibold uppercase tracking-[0.18em] text-red-bright${ctr}`} />
      <Txt value={s(d.title)} onChange={(v) => set("title", v)} placeholder="Nadpis sekce…" className={`mt-2 text-[clamp(1.8rem,3vw,2.4rem)] font-bold leading-tight text-ink${ctr}`} />
      {("accent" in d) && (
        <Txt value={s(d.accent)} onChange={(v) => set("accent", v)} placeholder="Zvýrazněná část nadpisu (červeně, volitelné)" className={`text-[clamp(1.4rem,2.4vw,1.9rem)] font-bold leading-tight text-red-bright${ctr}`} />
      )}
      {("sub" in d) && (
        <Txt area value={s(d.sub)} onChange={(v) => set("sub", v)} placeholder="Podnadpis (volitelné)" className={`mt-3 text-[16px] leading-relaxed text-ink-muted${ctr}`} />
      )}
    </div>
  );
}

function ItemControls({ items, onChange, make, label = "Přidat" }: { items: unknown[]; onChange: (v: unknown[]) => void; make: () => unknown; label?: string }) {
  return (
    <div className="mt-4 flex gap-2">
      <button type="button" onClick={() => onChange([...items, make()])} className="inline-flex items-center gap-1.5 border border-line-strong px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-muted hover:border-red hover:text-ink">
        <Plus size={13} /> {label}
      </button>
    </div>
  );
}

/* per-item chrome: move up / down / remove — visible on touch (resting opacity-40) */
function ItemChrome({ i, count, onMove, onRemove }: { i: number; count: number; onMove: (from: number, to: number) => void; onRemove: () => void }) {
  const btn = "grid h-6 w-6 place-items-center border border-line-strong bg-elevated text-ink-dim transition-colors disabled:opacity-30";
  return (
    <div className="absolute right-2 top-2 z-10 flex items-center gap-1 opacity-40 transition-opacity group-hover/item:opacity-100">
      <button type="button" onClick={() => onMove(i, i - 1)} disabled={i === 0} aria-label="Posunout nahoru" className={cn(btn, "hover:text-ink")}><ArrowUp size={12} /></button>
      <button type="button" onClick={() => onMove(i, i + 1)} disabled={i === count - 1} aria-label="Posunout dolů" className={cn(btn, "hover:text-ink")}><ArrowDown size={12} /></button>
      <button type="button" onClick={onRemove} aria-label="Odebrat" className={cn(btn, "hover:text-red-bright")}><Trash2 size={12} /></button>
    </div>
  );
}

/** Inline-editable canvas rendering of any block. */
export function EditableSection({ type, data, onChange, onPickImage }: { type: BlockType; data: Data; onChange: (d: Data) => void; onPickImage: PickImage }) {
  const d = data;
  const set: SetFn = (k, v) => onChange({ ...d, [k]: v });
  const setItem = (key: string, i: number, patch: Data) => {
    const items = list<Data>(d[key]);
    set(key, items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  };
  const removeItem = (key: string, i: number) => set(key, list<Data>(d[key]).filter((_, j) => j !== i));
  const moveItem = (key: string) => (from: number, to: number) => {
    const items = list<Data>(d[key]);
    if (to < 0 || to >= items.length) return;
    set(key, arrayMove(items, from, to));
  };

  switch (type) {
    case "hero": {
      const primary = (d.primary as Data) ?? {};
      const secondary = (d.secondary as Data) ?? {};
      const hasSecondary = s(secondary.label).trim() !== "";
      return (
        <div className="relative overflow-hidden border border-line-strong p-8" style={d.image ? { backgroundImage: `linear-gradient(90deg, rgba(8,9,11,.9), rgba(8,9,11,.5)), url('${s(d.image)}')`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
          {/* image control — same affordance as imagetext/gallery */}
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
            <button type="button" onClick={() => onPickImage((u) => set("image", u))} className="inline-flex items-center gap-1.5 border border-line-strong bg-elevated/90 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-muted backdrop-blur hover:border-red hover:text-ink">
              <ImagePlus size={13} /> {d.image ? "Vyměnit obrázek" : "Obrázek pozadí"}
            </button>
            {!!d.image && (
              <button type="button" onClick={() => set("image", "")} aria-label="Odebrat obrázek" className="grid h-7 w-7 place-items-center border border-line-strong bg-elevated/90 text-ink-dim backdrop-blur hover:text-red-bright"><X size={13} /></button>
            )}
          </div>
          <Txt value={s(d.eyebrow)} onChange={(v) => set("eyebrow", v)} placeholder="Nadpisek" className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-red-bright" />
          <Txt value={s(d.title)} onChange={(v) => set("title", v)} placeholder="Velký nadpis stránky…" className="mt-3 text-[clamp(2.2rem,4.5vw,3.6rem)] font-bold leading-[1.0] text-ink" />
          <Txt value={s(d.accent)} onChange={(v) => set("accent", v)} placeholder="Zvýrazněná část (červeně, volitelné)" className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold leading-tight text-red-bright" />
          <Txt area value={s(d.sub)} onChange={(v) => set("sub", v)} placeholder="Podnadpis" className="mt-4 max-w-2xl text-[18px] leading-relaxed text-white/80" />
          <div className="mt-5 flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-1 bg-red px-4 py-2.5 text-[12px] font-bold uppercase tracking-wide text-white">
              <Txt value={s(primary.label)} onChange={(v) => set("primary", { ...primary, label: v })} placeholder="Tlačítko 1" className="w-36 text-white placeholder:text-white/60" />
            </span>
            <span className={cn("inline-flex items-center gap-1 border border-line-strong px-4 py-2.5 text-[12px] font-bold uppercase tracking-wide text-white", !hasSecondary && "opacity-50")}>
              <Txt value={s(secondary.label)} onChange={(v) => set("secondary", { ...secondary, label: v })} placeholder="Tlačítko 2 (volit.)" className="w-36 text-white placeholder:text-white/40" />
            </span>
          </div>
        </div>
      );
    }

    case "heading":
      return <SectionHead d={d} set={set} />;

    case "richtext":
      return <RichText value={s(d.html)} onChange={(v) => set("html", v)} />;

    case "imagetext": {
      const right = d.side === "right";
      return (
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div className={cn(right && "md:order-2")}>
            <ImageField url={s(d.image)} onPick={() => onPickImage((u) => set("image", u))} onClear={() => set("image", "")} className="aspect-[4/3]" />
          </div>
          <div>
            <Txt value={s(d.eyebrow)} onChange={(v) => set("eyebrow", v)} placeholder="Nadpisek" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-red-bright" />
            <Txt value={s(d.title)} onChange={(v) => set("title", v)} placeholder="Nadpis…" className="mt-2 text-[1.6rem] font-bold text-ink" />
            <Txt value={s(d.accent)} onChange={(v) => set("accent", v)} placeholder="Zvýrazněná část (červeně, volitelné)" className="text-[1.4rem] font-bold leading-tight text-red-bright" />
            <div className="mt-3"><RichText value={s(d.html)} onChange={(v) => set("html", v)} /></div>
          </div>
        </div>
      );
    }

    case "features": {
      const items = list<Data>(d.items);
      const cols = Number(d.columns) || 3;
      return (
        <div>
          <SectionHead d={d} set={set} />
          <div className={cn("grid gap-3 sm:grid-cols-2", cols >= 3 ? "lg:grid-cols-3" : "lg:grid-cols-2")}>
            {items.map((it, i) => {
              const Icon = ICONS[s(it.icon, "Sparkles")] ?? Sparkles;
              return (
                <div key={i} className="group/item relative border border-line-strong bg-card p-4 pr-20">
                  <ItemChrome i={i} count={items.length} onMove={moveItem("items")} onRemove={() => removeItem("items", i)} />
                  <div className="mb-2 flex items-center gap-2">
                    <span className="grid h-8 w-8 shrink-0 place-items-center border border-red bg-red-soft text-red"><Icon size={16} /></span>
                    <select aria-label="Ikona výhody" value={s(it.icon, "Sparkles")} onChange={(e) => setItem("items", i, { icon: e.target.value })} className="border border-line-strong bg-base px-2 py-1 text-[11px] text-ink-muted">
                      {ICON_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <Txt value={s(it.title)} onChange={(v) => setItem("items", i, { title: v })} placeholder="Nadpis výhody" className="text-[15px] font-bold text-ink" />
                  <Txt area value={s(it.text)} onChange={(v) => setItem("items", i, { text: v })} placeholder="Popis…" className="mt-1 text-[13px] text-ink-muted" />
                </div>
              );
            })}
          </div>
          <ItemControls items={items} onChange={(v) => set("items", v)} make={() => ({ icon: "Sparkles", title: "Nová výhoda", text: "" })} />
        </div>
      );
    }

    case "steps": {
      const items = list<Data>(d.items);
      return (
        <div>
          <SectionHead d={d} set={set} />
          <div className="flex flex-col gap-2">
            {items.map((it, i) => (
              <div key={i} className="group/item relative flex items-start gap-3 border border-line-strong bg-card p-3 pl-4 pr-24">
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center border border-red text-[12px] font-bold text-red-bright">{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1">
                  <ItemChrome i={i} count={items.length} onMove={moveItem("items")} onRemove={() => removeItem("items", i)} />
                  <Txt value={s(it.title)} onChange={(v) => setItem("items", i, { title: v })} placeholder="Název kroku" className="text-[15px] font-bold text-ink" />
                  <Txt area value={s(it.text)} onChange={(v) => setItem("items", i, { text: v })} placeholder="Popis kroku…" className="mt-0.5 text-[13.5px] text-ink-muted" />
                </div>
              </div>
            ))}
          </div>
          <ItemControls items={items} onChange={(v) => set("items", v)} make={() => ({ title: "Nový krok", text: "" })} />
        </div>
      );
    }

    case "stats": {
      const items = list<Data>(d.items);
      return (
        <div>
          <SectionHead d={d} set={set} />
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {items.map((it, i) => (
              <div key={i} className="group/item relative border border-line-strong bg-card p-4 pt-9">
                <ItemChrome i={i} count={items.length} onMove={moveItem("items")} onRemove={() => removeItem("items", i)} />
                <Txt value={s(it.label)} onChange={(v) => setItem("items", i, { label: v })} placeholder="popisek" className="text-[11px] font-semibold uppercase tracking-wide text-red-bright" />
                <Txt value={s(it.value)} onChange={(v) => setItem("items", i, { value: v })} placeholder="500+" className="mt-1 text-[28px] font-bold tracking-tight text-ink" />
                <Txt value={s(it.desc)} onChange={(v) => setItem("items", i, { desc: v })} placeholder="detail" className="mt-1 text-[12px] text-ink-muted" />
              </div>
            ))}
          </div>
          <ItemControls items={items} onChange={(v) => set("items", v)} make={() => ({ value: "0", label: "nový", desc: "" })} />
        </div>
      );
    }

    case "testimonials": {
      const items = list<Data>(d.items);
      return (
        <div>
          <SectionHead d={d} set={set} />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {items.map((it, i) => (
              <div key={i} className="group/item relative border border-line-strong bg-card p-5 pr-20">
                <ItemChrome i={i} count={items.length} onMove={moveItem("items")} onRemove={() => removeItem("items", i)} />
                <Txt area value={s(it.text)} onChange={(v) => setItem("items", i, { text: v })} placeholder="Text recenze…" className="text-[15px] italic text-ink" />
                <div className="mt-3 flex items-center gap-3">
                  <ImageField url={s(it.image)} onPick={() => onPickImage((u) => setItem("items", i, { image: u }))} onClear={() => setItem("items", i, { image: "" })} className="h-11 w-11 shrink-0 [&>button]:min-h-0 [&_span]:min-h-0" label="" />
                  <div className="min-w-0 flex-1">
                    <Txt value={s(it.author)} onChange={(v) => setItem("items", i, { author: v })} placeholder="Autor" className="text-[13px] font-semibold text-red-bright" />
                    <Txt value={s(it.role)} onChange={(v) => setItem("items", i, { role: v })} placeholder="Pozice / firma (volit.)" className="text-[12px] text-ink-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ItemControls items={items} onChange={(v) => set("items", v)} make={() => ({ text: "", author: "", role: "", image: "" })} />
        </div>
      );
    }

    case "faq": {
      const items = list<Data>(d.items);
      return (
        <div>
          <SectionHead d={d} set={set} />
          <div className="flex flex-col gap-2">
            {items.map((it, i) => (
              <div key={i} className="group/item relative border border-line-strong bg-card p-4 pr-24">
                <ItemChrome i={i} count={items.length} onMove={moveItem("items")} onRemove={() => removeItem("items", i)} />
                <Txt value={s(it.q)} onChange={(v) => setItem("items", i, { q: v })} placeholder="Otázka?" className="text-[15px] font-bold text-ink" />
                <Txt area value={s(it.a)} onChange={(v) => setItem("items", i, { a: v })} placeholder="Odpověď…" className="mt-1 text-[13.5px] text-ink-muted" />
              </div>
            ))}
          </div>
          <ItemControls items={items} onChange={(v) => set("items", v)} make={() => ({ q: "", a: "" })} />
        </div>
      );
    }

    case "pricing": {
      const items = list<Data>(d.items);
      return (
        <div>
          <SectionHead d={d} set={set} />
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            {items.map((p, i) => {
              const specs = list<[string, string]>(p.specs);
              return (
                <div key={i} className={cn("group/item relative border bg-card p-4 pr-20", p.featured ? "border-red" : "border-line-strong")}>
                  <ItemChrome i={i} count={items.length} onMove={moveItem("items")} onRemove={() => removeItem("items", i)} />
                  <Txt value={s(p.name)} onChange={(v) => setItem("items", i, { name: v })} placeholder="Název balíčku" className="text-[13px] font-bold uppercase tracking-wide text-red-bright" />
                  <Txt value={s(p.tagline)} onChange={(v) => setItem("items", i, { tagline: v })} placeholder="Krátký popis" className="mt-1 text-[13px] text-ink-muted" />
                  <div className="mt-2 flex flex-col gap-1">
                    {specs.map(([k, v], j) => (
                      <div key={j} className="flex items-center gap-1.5 border-b border-dashed border-line pb-1">
                        <Txt value={k} onChange={(nv) => setItem("items", i, { specs: specs.map((row, rj) => (rj === j ? [nv, row[1]] : row)) })} placeholder="Parametr" ariaLabel="Parametr" className="flex-1 text-[12.5px] text-ink-muted" />
                        <span className="text-ink-dim">:</span>
                        <Txt value={v} onChange={(nv) => setItem("items", i, { specs: specs.map((row, rj) => (rj === j ? [row[0], nv] : row)) })} placeholder="Hodnota" ariaLabel="Hodnota" className="flex-1 text-[12.5px] font-semibold text-ink" />
                        <button type="button" onClick={() => setItem("items", i, { specs: specs.filter((_, rj) => rj !== j) })} aria-label="Odebrat parametr" className="text-ink-dim hover:text-red-bright"><Trash2 size={11} /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setItem("items", i, { specs: [...specs, ["", ""]] })} className="mt-1 inline-flex w-fit items-center gap-1 text-[11px] text-ink-muted hover:text-ink"><Plus size={11} /> Parametr</button>
                  </div>
                </div>
              );
            })}
          </div>
          <ItemControls items={items} onChange={(v) => set("items", v)} make={() => ({ name: "Nový balíček", tagline: "", specs: [["Parametr", "Hodnota"]], href: "/poptavkovy-formular/", featured: false })} />
        </div>
      );
    }

    case "gallery": {
      const items = list<Data>(d.items);
      return (
        <div>
          <SectionHead d={d} set={set} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it, i) => (
              <div key={i} className="group/item relative border border-line-strong bg-card p-2">
                <ItemChrome i={i} count={items.length} onMove={moveItem("items")} onRemove={() => removeItem("items", i)} />
                <ImageField url={s(it.image)} onPick={() => onPickImage((u) => setItem("items", i, { image: u }))} onClear={() => setItem("items", i, { image: "" })} className="aspect-video" />
                <Txt value={s(it.title)} onChange={(v) => setItem("items", i, { title: v })} placeholder="Popisek" className="mt-2 px-1 text-[13px] font-bold text-ink" />
                <Txt value={s(it.label)} onChange={(v) => setItem("items", i, { label: v })} placeholder="Štítek" className="px-1 text-[11px] uppercase tracking-wide text-red-bright" />
              </div>
            ))}
          </div>
          <ItemControls items={items} onChange={(v) => set("items", v)} make={() => ({ image: "", label: "", title: "" })} />
        </div>
      );
    }

    case "logos": {
      const items = normalizeLogos(d.items);
      const setLogos = (v: { image: string; name: string }[]) => set("items", v);
      return (
        <div>
          <Txt value={s(d.label)} onChange={(v) => set("label", v)} placeholder="Popisek (Důvěřují nám…)" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-dim" />
          <p className="mt-1 text-[12px] text-ink-dim">Nahrajte loga partnerů/certifikací. Pokud logo nevyberete, zobrazí se název textem.</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((it, i) => (
              <div key={i} className="group/item relative border border-line-strong bg-card p-2">
                <ItemChrome i={i} count={items.length} onMove={moveItem("items")} onRemove={() => removeItem("items", i)} />
                <ImageField url={it.image} onPick={() => onPickImage((u) => setLogos(items.map((x, j) => (j === i ? { ...x, image: u } : x))))} onClear={() => setLogos(items.map((x, j) => (j === i ? { ...x, image: "" } : x)))} className="aspect-[3/2]" label="Logo" />
                <Txt value={it.name} onChange={(v) => setLogos(items.map((x, j) => (j === i ? { ...x, name: v } : x)))} placeholder="Název partnera" ariaLabel="Název partnera" className="mt-1.5 px-1 text-[12px] text-ink-muted" />
              </div>
            ))}
          </div>
          <ItemControls items={items} onChange={(v) => set("items", v)} make={() => ({ image: "", name: "" })} label="Přidat logo" />
        </div>
      );
    }

    case "cta":
      return (
        <div className="border border-red bg-elevated p-7 text-center">
          <Txt value={s(d.title)} onChange={(v) => set("title", v)} placeholder="Nadpis výzvy…" className="text-center text-[24px] font-bold text-ink" />
          <Txt value={s(d.text)} onChange={(v) => set("text", v)} placeholder="Podtext (volitelné)" className="mt-2 text-center text-[15px] text-ink-muted" />
          <div className="mt-4 flex justify-center">
            <span className="inline-flex bg-red px-5 py-2.5 text-[12px] font-bold uppercase tracking-wide text-white">
              <Txt value={s(d.buttonLabel)} onChange={(v) => set("buttonLabel", v)} placeholder="Tlačítko" className="min-w-24 max-w-[60vw] text-center text-white placeholder:text-white/60" />
            </span>
          </div>
        </div>
      );

    case "leadform":
      return (
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <SectionHead d={d} set={set} />
            <p className="text-[12px] text-ink-dim">Formulář se na webu zobrazí vpravo (kontakt + pole).</p>
          </div>
          <div className="grid place-items-center border border-dashed border-line-strong bg-card p-8 text-[13px] text-ink-dim">Poptávkový formulář</div>
        </div>
      );

    case "spacer": {
      const size = s(d.size, "m");
      return (
        <div className={cn("flex items-center justify-center border border-dashed border-line", size === "s" ? "h-10" : size === "l" ? "h-32" : "h-20")}>
          <span className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-ink-dim">
            Mezera
            {([["s", "Malá mezera"], ["m", "Střední mezera"], ["l", "Velká mezera"]] as const).map(([sz, lbl]) => (
              <button key={sz} type="button" onClick={() => set("size", sz)} aria-label={lbl} aria-pressed={size === sz} className={cn("ml-1 px-1.5 py-0.5 uppercase", size === sz ? "bg-red text-white" : "text-ink-muted hover:text-ink")}>{sz}</button>
            ))}
          </span>
        </div>
      );
    }

    default:
      return <p className="text-[13px] text-ink-dim">Blok: {type}</p>;
  }
}
