"use client";

import { useState, useTransition } from "react";
import { Plus, Save, Trash2, Loader2, Check, ImagePlus, X } from "lucide-react";
import { SortableList } from "@/components/admin/sortable-list";
import { MediaPicker } from "@/components/editor/media-picker";
import { btnPrimary, btnGhost, btnDanger, inputCls, labelCls } from "@/components/admin/ui";
import { createService, updateService, deleteService, reorderServices } from "./actions";

const ICONS = ["Home", "Building2", "Thermometer", "Plug", "Wind", "Cpu", "Sun"];

type Service = { id: string; title: string; excerpt: string; icon: string; image: string; href: string; published: boolean };

function IconSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = ICONS.includes(value) || !value ? ICONS : [value, ...ICONS];
  return (
    <select aria-label="Ikona služby" value={value || "Sun"} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      {options.map((i) => <option key={i} value={i}>{ICONS.includes(i) ? i : `${i} (vlastní)`}</option>)}
    </select>
  );
}

function ImageButton({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => setOpen(true)} className="grid h-12 w-16 shrink-0 place-items-center overflow-hidden border border-line-strong bg-cover bg-center text-ink-dim transition-colors hover:border-red" style={value ? { backgroundImage: `url('${value}')` } : undefined} aria-label="Obrázek služby">
        {!value && <ImagePlus size={16} />}
      </button>
      <span className="text-[12px] text-ink-muted">{value ? "Obrázek vybrán" : "Obrázek (volitelný)"}</span>
      {value && <button type="button" onClick={() => onChange("")} aria-label="Odebrat obrázek" className="text-ink-dim hover:text-red-bright"><X size={14} /></button>}
      {open && <MediaPicker onPick={(url) => { onChange(url); setOpen(false); }} onClose={() => setOpen(false)} />}
    </div>
  );
}

export function ServicesManager({ initial }: { initial: Service[] }) {
  const [adding, setAdding] = useState(false);
  return (
    <div>
      <div className="mb-6">
        {adding ? (
          <NewServiceForm onDone={() => setAdding(false)} />
        ) : (
          <button onClick={() => setAdding(true)} className={btnPrimary}>
            <Plus size={15} /> Přidat službu
          </button>
        )}
      </div>
      <SortableList items={initial} onReorder={(ids) => reorderServices(ids)}>
        {(s) => <ServiceRow key={s.id} service={s} />}
      </SortableList>
      {initial.length === 0 && <p className="text-ink-muted">Zatím žádné služby. Přidejte první.</p>}
    </div>
  );
}

function NewServiceForm({ onDone }: { onDone: () => void }) {
  const [pending, start] = useTransition();
  const [icon, setIcon] = useState("Sun");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      className="border border-red/40 bg-card p-5"
      action={(fd) =>
        start(async () => {
          setError("");
          try {
            await createService({ title: String(fd.get("title")), excerpt: String(fd.get("excerpt")), icon, image, href: String(fd.get("href")) });
            onDone();
          } catch {
            setError("Uložení se nezdařilo. Zkontrolujte přihlášení a zkuste to znovu.");
          }
        })
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Název</label>
          <input name="title" required className={inputCls} placeholder="FVE pro rodinné domy" />
        </div>
        <div>
          <label className={labelCls}>Odkaz (href)</label>
          <input name="href" className={inputCls} placeholder="/fotovoltaiky-pro-rodinne-domy-na-klic/" />
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_200px]">
        <div>
          <label className={labelCls}>Popis</label>
          <input name="excerpt" required className={inputCls} placeholder="Krátký popis služby…" />
        </div>
        <div>
          <label className={labelCls}>Ikona</label>
          <IconSelect value={icon} onChange={setIcon} />
        </div>
      </div>
      <div className="mt-4">
        <label className={labelCls}>Obrázek (volitelný — jinak se použije ikona)</label>
        <ImageButton value={image} onChange={setImage} />
      </div>
      {error && <p className="mt-3 text-[12.5px] font-semibold text-red-bright">{error}</p>}
      <div className="mt-4 flex gap-2">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Vytvořit
        </button>
        <button type="button" onClick={onDone} className={btnGhost}>Zrušit</button>
      </div>
    </form>
  );
}

function ServiceRow({ service }: { service: Service }) {
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(service);

  function save() {
    setError("");
    start(async () => {
      try {
        await updateService(service.id, { title: data.title, excerpt: data.excerpt, icon: data.icon, image: data.image, href: data.href, published: data.published });
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      } catch {
        setError("Uložení se nezdařilo.");
      }
    });
  }

  function remove() {
    if (!confirm("Smazat tuto službu?")) return;
    setError("");
    start(async () => {
      try { await deleteService(service.id); } catch { setError("Smazání se nezdařilo."); }
    });
  }

  return (
    <div className="border border-line-strong bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
        <input aria-label="Název služby" value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} className={inputCls} />
        <IconSelect value={data.icon} onChange={(v) => setData({ ...data, icon: v })} />
      </div>
      <input aria-label="Popis služby" value={data.excerpt} onChange={(e) => setData({ ...data, excerpt: e.target.value })} className={`${inputCls} mt-2.5`} />
      <input aria-label="Odkaz služby (URL)" value={data.href} onChange={(e) => setData({ ...data, href: e.target.value })} className={`${inputCls} mt-2.5 font-mono text-[12px]`} placeholder="/odkaz/" />
      <div className="mt-2.5"><ImageButton value={data.image} onChange={(v) => setData({ ...data, image: v })} /></div>
      {error && <p className="mt-2 text-[12.5px] font-semibold text-red-bright">{error}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={save} disabled={pending} className={btnPrimary}>
          {pending ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />} {saved ? "Uloženo" : "Uložit"}
        </button>
        <label className="flex items-center gap-2 px-2 font-mono text-[12px] text-ink-muted">
          <input type="checkbox" checked={data.published} onChange={(e) => setData({ ...data, published: e.target.checked })} className="accent-red" />
          publikováno
        </label>
        <button onClick={remove} className={`${btnDanger} ml-auto`}>
          <Trash2 size={13} /> Smazat
        </button>
      </div>
    </div>
  );
}
