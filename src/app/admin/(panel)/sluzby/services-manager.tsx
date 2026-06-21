"use client";

import { useState, useTransition } from "react";
import { Plus, Save, Trash2, Loader2, Check } from "lucide-react";
import { SortableList } from "@/components/admin/sortable-list";
import { btnPrimary, btnGhost, btnDanger, inputCls, labelCls } from "@/components/admin/ui";
import { createService, updateService, deleteService, reorderServices } from "./actions";

const ICONS = ["Home", "Building2", "Thermometer", "Plug", "Wind", "Cpu", "Sun"];

type Service = { id: string; title: string; excerpt: string; icon: string; href: string; published: boolean };

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
  return (
    <form
      className="border border-red/40 bg-card p-5"
      action={(fd) =>
        start(async () => {
          await createService({
            title: String(fd.get("title")),
            excerpt: String(fd.get("excerpt")),
            icon: String(fd.get("icon")),
            href: String(fd.get("href")),
          });
          onDone();
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
          <select name="icon" className={inputCls} defaultValue="Sun">
            {ICONS.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>
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
  const [data, setData] = useState(service);

  function save() {
    start(async () => {
      await updateService(service.id, { title: data.title, excerpt: data.excerpt, icon: data.icon, href: data.href, published: data.published });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  }

  return (
    <div className="border border-line-strong bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
        <input aria-label="Název služby" value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} className={inputCls} />
        <select aria-label="Ikona služby" value={data.icon} onChange={(e) => setData({ ...data, icon: e.target.value })} className={inputCls}>
          {ICONS.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </div>
      <input aria-label="Popis služby" value={data.excerpt} onChange={(e) => setData({ ...data, excerpt: e.target.value })} className={`${inputCls} mt-2.5`} />
      <input aria-label="Odkaz služby (URL)" value={data.href} onChange={(e) => setData({ ...data, href: e.target.value })} className={`${inputCls} mt-2.5 font-mono text-[12px]`} placeholder="/odkaz/" />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={save} disabled={pending} className={btnPrimary}>
          {pending ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />} {saved ? "Uloženo" : "Uložit"}
        </button>
        <label className="flex items-center gap-2 px-2 font-mono text-[12px] text-ink-muted">
          <input type="checkbox" checked={data.published} onChange={(e) => setData({ ...data, published: e.target.checked })} className="accent-red" />
          publikováno
        </label>
        <button
          onClick={() => confirm("Smazat tuto službu?") && start(() => deleteService(service.id))}
          className={`${btnDanger} ml-auto`}
        >
          <Trash2 size={13} /> Smazat
        </button>
      </div>
    </div>
  );
}
