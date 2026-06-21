"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Loader2, Check, Plus, Trash2, Eye, ArrowLeft, AlertTriangle } from "lucide-react";
import { btnPrimary, inputCls, labelCls } from "@/components/admin/ui";
import { computeTotals, type Offer } from "@/lib/offers/schema";
import { formatCZK } from "@/lib/utils";

type Group = Offer["budget"]["groups"][number];
type Item = Group["items"][number];

const lines = (a: string[]) => a.join("\n");
const toLines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
const num = (s: string) => (s.trim() === "" ? undefined : Number(s.replace(/\s/g, "").replace(",", ".")));

export function OfferEditor({ offer }: { offer: Offer }) {
  const router = useRouter();
  const [o, setO] = useState<Offer>(offer);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // immutable patch helpers
  const patch = (p: Partial<Offer>) => setO((c) => ({ ...c, ...p }));
  const patchSys = (p: Partial<NonNullable<Offer["system"]>>) => setO((c) => ({ ...c, system: { ...c.system, ...p } }));
  const patchBudget = (p: Partial<Offer["budget"]>) => setO((c) => ({ ...c, budget: { ...c.budget, ...p } }));
  const patchMgr = (p: Partial<Offer["manager"]>) => setO((c) => ({ ...c, manager: { ...c.manager, ...p } }));

  const setGroup = (gi: number, g: Group) => patchBudget({ groups: o.budget.groups.map((x, i) => (i === gi ? g : x)) });
  const setItem = (gi: number, ii: number, it: Item) => setGroup(gi, { ...o.budget.groups[gi], items: o.budget.groups[gi].items.map((x, j) => (j === ii ? it : x)) });

  const totals = computeTotals(o.budget);

  function save() {
    start(async () => {
      setError("");
      try {
        const res = await fetch("/api/nabidky/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(o) });
        if (res.ok) {
          setSaved(true);
          setTimeout(() => setSaved(false), 1800);
          router.refresh();
        } else {
          const d = await res.json().catch(() => null);
          setError(d?.error ? `Uložení selhalo: ${String(d.error).slice(0, 160)}` : "Uložení selhalo.");
        }
      } catch {
        setError("Uložení selhalo — zkontrolujte připojení.");
      }
    });
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/nabidky/" className="grid h-9 w-9 place-items-center border border-line-strong text-ink-muted hover:border-white hover:text-ink" aria-label="Zpět"><ArrowLeft size={16} /></Link>
          <div>
            <h1 className="text-[20px] font-bold text-ink">Úprava nabídky</h1>
            <p className="text-[12px] text-ink-dim">{o.number || o.id} · {o.investor.name || "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/nabidka/${o.id}/`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-line-strong px-3.5 py-2 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted hover:border-white hover:text-ink"><Eye size={14} /> Náhled</a>
          <button onClick={save} disabled={pending} className={btnPrimary}>
            {pending ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />} {saved ? "Uloženo" : "Uložit"}
          </button>
        </div>
      </div>
      {error && <p className="mb-5 flex items-center gap-2 border border-red/40 bg-red-soft px-4 py-2.5 text-[13px] font-semibold text-red-bright"><AlertTriangle size={15} /> {error}</p>}

      {/* ── Hlavička ── */}
      <Section title="Hlavička">
        <Grid>
          <Field label="Číslo nabídky"><input className={inputCls} value={o.number} onChange={(e) => patch({ number: e.target.value })} /></Field>
          <Field label="Typ">
            <select className={inputCls} value={o.type} onChange={(e) => patch({ type: e.target.value as Offer["type"] })}>
              {["FVE", "TC", "KLIMA", "COMBO"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
        </Grid>
        <Field label="Předmět nabídky"><input className={inputCls} value={o.subject} onChange={(e) => patch({ subject: e.target.value })} /></Field>
        <Grid>
          <Field label="Investor — jméno"><input className={inputCls} value={o.investor.name} onChange={(e) => patch({ investor: { ...o.investor, name: e.target.value } })} /></Field>
          <Field label="Investor — kontakt"><input className={inputCls} value={o.investor.contact} onChange={(e) => patch({ investor: { ...o.investor, contact: e.target.value } })} /></Field>
        </Grid>
        <Grid>
          <Field label="Místo realizace"><input className={inputCls} value={o.location} onChange={(e) => patch({ location: e.target.value })} /></Field>
          <Field label="Platnost do"><input className={inputCls} value={o.validUntil} onChange={(e) => patch({ validUntil: e.target.value })} /></Field>
        </Grid>
      </Section>

      {/* ── Technologie ── */}
      <Section title="Popis technologie">
        <Field label="Souhrn (odstavce, **tučně**)"><textarea rows={6} className={inputCls} value={o.technology.summary} onChange={(e) => patch({ technology: { ...o.technology, summary: e.target.value } })} /></Field>
        <Field label="Odrážky (jedna na řádek)"><textarea rows={3} className={inputCls} value={lines(o.technology.bullets ?? [])} onChange={(e) => patch({ technology: { ...o.technology, bullets: toLines(e.target.value) } })} /></Field>
        <Field label="Roční výroba (MWh)"><input className={inputCls} type="number" step="0.1" value={o.technology.annualProductionMWh ?? ""} onChange={(e) => patch({ technology: { ...o.technology, annualProductionMWh: num(e.target.value) } })} /></Field>
      </Section>

      {/* ── Systém ── */}
      <Section title="Parametry systému">
        <Grid>
          <Field label="Výkon (kWp)"><input className={inputCls} type="number" step="0.01" value={o.system?.powerKwp ?? ""} onChange={(e) => patchSys({ powerKwp: num(e.target.value) })} /></Field>
          <Field label="Panely — počet"><input className={inputCls} type="number" value={o.system?.panels?.count ?? ""} onChange={(e) => patchSys({ panels: { ...o.system?.panels, count: num(e.target.value) } })} /></Field>
        </Grid>
        <Grid>
          <Field label="Panely — značka"><input className={inputCls} value={o.system?.panels?.brand ?? ""} onChange={(e) => patchSys({ panels: { ...o.system?.panels, brand: e.target.value } })} /></Field>
          <Field label="Panely — Wp"><input className={inputCls} type="number" value={o.system?.panels?.wattPeak ?? ""} onChange={(e) => patchSys({ panels: { ...o.system?.panels, wattPeak: num(e.target.value) } })} /></Field>
        </Grid>
        <Grid>
          <Field label="Baterie — kWh"><input className={inputCls} type="number" step="0.1" value={o.system?.battery?.capacityKwh ?? ""} onChange={(e) => patchSys({ battery: { ...o.system?.battery, capacityKwh: num(e.target.value) } })} /></Field>
          <Field label="Baterie — model"><input className={inputCls} value={o.system?.battery?.model ?? ""} onChange={(e) => patchSys({ battery: { ...o.system?.battery, model: e.target.value } })} /></Field>
        </Grid>
        <Grid>
          <Field label="Střídač — model"><input className={inputCls} value={o.system?.inverter?.model ?? ""} onChange={(e) => patchSys({ inverter: { ...o.system?.inverter, model: e.target.value } })} /></Field>
          <Field label="Střídač — kW"><input className={inputCls} type="number" step="0.1" value={o.system?.inverter?.kw ?? ""} onChange={(e) => patchSys({ inverter: { ...o.system?.inverter, kw: num(e.target.value) } })} /></Field>
        </Grid>
      </Section>

      {/* ── Kalkulace ── */}
      <Section title="Kalkulace">
        <Grid>
          <Field label="Instalovaný výkon (kWp)"><input className={inputCls} type="number" step="0.01" value={o.budget.installedPowerKwp ?? ""} onChange={(e) => patchBudget({ installedPowerKwp: num(e.target.value) })} /></Field>
          <Field label="Kapacita baterií (kWh)"><input className={inputCls} type="number" step="0.1" value={o.budget.batteryKwh ?? ""} onChange={(e) => patchBudget({ batteryKwh: num(e.target.value) })} /></Field>
        </Grid>
        <Field label="Sazba DPH (%)"><input className={`${inputCls} max-w-[120px]`} type="number" value={o.budget.vatRate} onChange={(e) => patchBudget({ vatRate: num(e.target.value) ?? 12 })} /></Field>

        {o.budget.groups.map((g, gi) => (
          <div key={gi} className="mt-4 border border-line-strong bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <input className={`${inputCls} font-bold uppercase`} value={g.title} onChange={(e) => setGroup(gi, { ...g, title: e.target.value })} placeholder="Název skupiny" />
              <button onClick={() => patchBudget({ groups: o.budget.groups.filter((_, i) => i !== gi) })} className="grid h-9 w-9 shrink-0 place-items-center border border-red/40 text-red-bright hover:bg-red hover:text-white" aria-label="Smazat skupinu"><Trash2 size={14} /></button>
            </div>
            {g.items.map((it, ii) => (
              <div key={ii} className="mb-2 grid grid-cols-[1fr_70px_120px_36px] items-start gap-2">
                <div className="flex flex-col gap-1">
                  <input className={inputCls} value={it.name} onChange={(e) => setItem(gi, ii, { ...it, name: e.target.value })} placeholder="Položka" />
                  <input className={`${inputCls} text-[12px]`} value={it.detail ?? ""} onChange={(e) => setItem(gi, ii, { ...it, detail: e.target.value })} placeholder="Detail (volitelné)" />
                </div>
                <input className={`${inputCls} text-right`} type="number" value={it.qty} onChange={(e) => setItem(gi, ii, { ...it, qty: num(e.target.value) ?? 1 })} placeholder="ks" />
                <input className={`${inputCls} text-right`} type="number" value={it.priceNoVat} onChange={(e) => setItem(gi, ii, { ...it, priceNoVat: num(e.target.value) ?? 0 })} placeholder="Kč bez DPH" />
                <button onClick={() => setGroup(gi, { ...g, items: g.items.filter((_, j) => j !== ii) })} className="grid h-9 w-9 place-items-center text-ink-dim hover:text-red-bright" aria-label="Smazat položku"><Trash2 size={13} /></button>
              </div>
            ))}
            <button onClick={() => setGroup(gi, { ...g, items: [...g.items, { name: "Nová položka", detail: "", qty: 1, priceNoVat: 0 }] })} className="mt-1 inline-flex items-center gap-1.5 border border-line-strong px-3 py-1.5 text-[11px] font-bold uppercase text-ink-muted hover:border-red hover:text-ink"><Plus size={12} /> Položka</button>
          </div>
        ))}
        <button onClick={() => patchBudget({ groups: [...o.budget.groups, { title: "Nová skupina", items: [] }] })} className="mt-3 inline-flex items-center gap-1.5 border border-line-strong px-3.5 py-2 text-[11.5px] font-bold uppercase text-ink-muted hover:border-red hover:text-ink"><Plus size={13} /> Skupina</button>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-x-6 gap-y-1 border-t border-line pt-4 text-[13px]">
          <span className="text-ink-muted">Bez DPH <b className="text-ink">{formatCZK(totals.subtotal)}</b></span>
          <span className="text-ink-muted">DPH <b className="text-ink">{formatCZK(totals.vat)}</b></span>
          <span className="text-[15px] font-bold text-red-bright">Celkem s DPH {formatCZK(totals.total)}</span>
        </div>

        <Field label="V ceně zahrnuto (jedno na řádek)"><textarea rows={3} className={`${inputCls} mt-4`} value={lines(o.budget.included ?? [])} onChange={(e) => patchBudget({ included: toLines(e.target.value) })} /></Field>
      </Section>

      {/* ── Doplňky ── */}
      <Section title="Doplňkové možnosti">
        {(o.addons ?? []).map((a, i) => (
          <div key={i} className="mb-2 grid grid-cols-[1fr_140px_36px] items-center gap-2">
            <input className={inputCls} value={a.name} onChange={(e) => patch({ addons: o.addons!.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} placeholder="Název" />
            <input className={`${inputCls} text-right`} type="number" value={a.priceWithVat} onChange={(e) => patch({ addons: o.addons!.map((x, j) => (j === i ? { ...x, priceWithVat: num(e.target.value) ?? 0 } : x)) })} placeholder="Kč s DPH" />
            <button onClick={() => patch({ addons: o.addons!.filter((_, j) => j !== i) })} className="grid h-9 w-9 place-items-center text-ink-dim hover:text-red-bright" aria-label="Smazat"><Trash2 size={13} /></button>
          </div>
        ))}
        <button onClick={() => patch({ addons: [...(o.addons ?? []), { name: "Nový doplněk", priceWithVat: 0 }] })} className="mt-1 inline-flex items-center gap-1.5 border border-line-strong px-3 py-1.5 text-[11px] font-bold uppercase text-ink-muted hover:border-red hover:text-ink"><Plus size={12} /> Doplněk</button>
      </Section>

      {/* ── Postup / Proč / Manažer ── */}
      <Section title="Postup realizace (jeden krok na řádek)">
        <textarea rows={7} className={inputCls} value={lines(o.process)} onChange={(e) => patch({ process: toLines(e.target.value) })} />
      </Section>
      <Section title="Proč od nás (jeden bod na řádek)">
        <textarea rows={8} className={inputCls} value={lines(o.whyUs)} onChange={(e) => patch({ whyUs: toLines(e.target.value) })} />
      </Section>
      <Section title="Projektový manažer">
        <Grid>
          <Field label="Jméno"><input className={inputCls} value={o.manager.name} onChange={(e) => patchMgr({ name: e.target.value })} /></Field>
          <Field label="Pozice"><input className={inputCls} value={o.manager.role} onChange={(e) => patchMgr({ role: e.target.value })} /></Field>
        </Grid>
        <Grid>
          <Field label="Telefon"><input className={inputCls} value={o.manager.phone} onChange={(e) => patchMgr({ phone: e.target.value })} /></Field>
          <Field label="E-mail"><input className={inputCls} value={o.manager.email} onChange={(e) => patchMgr({ email: e.target.value })} /></Field>
        </Grid>
      </Section>

      <div className="mt-8 flex justify-end">
        <button onClick={save} disabled={pending} className={btnPrimary}>
          {pending ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />} {saved ? "Uloženo" : "Uložit nabídku"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="mb-3 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em] text-red-bright"><span className="h-1.5 w-1.5 bg-red" /> {title}</h2>
      <div className="border border-line-strong bg-card p-5">{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="mb-4 last:mb-0"><label className={labelCls}>{label}</label>{children}</div>;
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
