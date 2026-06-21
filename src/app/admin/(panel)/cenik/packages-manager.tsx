"use client";

import { useState, useTransition } from "react";
import { Plus, Save, Trash2, Loader2, Check } from "lucide-react";
import { SortableList } from "@/components/admin/sortable-list";
import { btnPrimary, btnGhost, btnDanger, inputCls, labelCls } from "@/components/admin/ui";
import { createPackage, updatePackage, deletePackage, reorderPackages, type PackageInput } from "./actions";

type Pkg = PackageInput & { id: string };

function specsToText(specs: string): string {
  try {
    return (JSON.parse(specs) as [string, string][]).map(([k, v]) => `${k}: ${v}`).join("\n");
  } catch {
    return "";
  }
}
function textToSpecs(text: string): string {
  const rows = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf(":");
      return i >= 0 ? [l.slice(0, i).trim(), l.slice(i + 1).trim()] : [l, ""];
    });
  return JSON.stringify(rows);
}

const empty: PackageInput = { name: "", powerKwp: "", battery: "", panels: "", priceFrom: null, featured: false, href: "/poptavkovy-formular/", specs: "[]", published: true };

export function PackagesManager({ initial }: { initial: Pkg[] }) {
  const [adding, setAdding] = useState(false);
  return (
    <div>
      <div className="mb-6">
        {adding ? (
          <PackageForm initial={empty} onSubmit={createPackage} submitLabel="Vytvořit" onDone={() => setAdding(false)} isNew />
        ) : (
          <button onClick={() => setAdding(true)} className={btnPrimary}>
            <Plus size={15} /> Přidat balíček
          </button>
        )}
      </div>
      <SortableList items={initial} onReorder={(ids) => reorderPackages(ids)}>
        {(p) => <PackageRow key={p.id} pkg={p} />}
      </SortableList>
      {initial.length === 0 && <p className="text-ink-muted">Zatím žádné balíčky.</p>}
    </div>
  );
}

function PackageRow({ pkg }: { pkg: Pkg }) {
  const [pending, start] = useTransition();
  return (
    <div className="border border-line-strong bg-card p-4">
      <PackageForm
        initial={pkg}
        submitLabel="Uložit"
        inline
        onSubmit={(data) => updatePackage(pkg.id, data)}
        extra={
          <button
            type="button"
            onClick={() => confirm("Smazat balíček?") && start(() => deletePackage(pkg.id))}
            disabled={pending}
            className={`${btnDanger} ml-auto`}
          >
            <Trash2 size={13} /> Smazat
          </button>
        }
      />
    </div>
  );
}

function PackageForm({
  initial,
  onSubmit,
  submitLabel,
  onDone,
  isNew,
  inline,
  extra,
}: {
  initial: PackageInput;
  onSubmit: (data: PackageInput) => Promise<void>;
  submitLabel: string;
  onDone?: () => void;
  isNew?: boolean;
  inline?: boolean;
  extra?: React.ReactNode;
}) {
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [d, setD] = useState(initial);
  const [specsText, setSpecsText] = useState(specsToText(initial.specs));

  function submit() {
    start(async () => {
      await onSubmit({ ...d, specs: textToSpecs(specsText) });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      onDone?.();
    });
  }

  return (
    <div className={isNew ? "border border-red/40 bg-card p-5" : ""}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Labeled label="Název"><input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} className={inputCls} placeholder="Viapower Medium" /></Labeled>
        <Labeled label="Výkon (kWp)"><input value={d.powerKwp} onChange={(e) => setD({ ...d, powerKwp: e.target.value })} className={inputCls} placeholder="9,9" /></Labeled>
        <Labeled label="Baterie (kWh)"><input value={d.battery} onChange={(e) => setD({ ...d, battery: e.target.value })} className={inputCls} placeholder="10" /></Labeled>
        <Labeled label="Panely (ks)"><input value={d.panels} onChange={(e) => setD({ ...d, panels: e.target.value })} className={inputCls} placeholder="18" /></Labeled>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Labeled label="Cena od (Kč)"><input type="number" value={d.priceFrom ?? ""} onChange={(e) => setD({ ...d, priceFrom: e.target.value ? Number(e.target.value) : null })} className={inputCls} placeholder="349000" /></Labeled>
        <Labeled label="Odkaz (href)"><input value={d.href} onChange={(e) => setD({ ...d, href: e.target.value })} className={`${inputCls} font-mono text-[12px]`} /></Labeled>
      </div>
      <div className="mt-3">
        <span className={labelCls}>Parametry (jeden na řádek, „Popisek: Hodnota“)</span>
        <textarea value={specsText} onChange={(e) => setSpecsText(e.target.value)} rows={4} className={`${inputCls} font-mono text-[12px]`} placeholder={"Výkon FVE: 9,9 kWp\nBaterie: 10 kWh"} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button onClick={submit} disabled={pending} className={btnPrimary}>
          {pending ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />} {saved ? "Uloženo" : submitLabel}
        </button>
        <label className="flex items-center gap-2 font-mono text-[12px] text-ink-muted">
          <input type="checkbox" checked={d.featured} onChange={(e) => setD({ ...d, featured: e.target.checked })} className="accent-red" /> doporučujeme
        </label>
        <label className="flex items-center gap-2 font-mono text-[12px] text-ink-muted">
          <input type="checkbox" checked={d.published} onChange={(e) => setD({ ...d, published: e.target.checked })} className="accent-red" /> publikováno
        </label>
        {onDone && isNew && <button type="button" onClick={onDone} className={btnGhost}>Zrušit</button>}
        {extra}
      </div>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className={labelCls}>{label}</span>
      {children}
    </div>
  );
}
