"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { nanoid } from "nanoid";
import {
  DndContext, DragOverlay, KeyboardSensor, PointerSensor, pointerWithin, useDraggable, useDroppable, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown, ArrowLeft, ArrowUp, BarChart3, Building2, Check, Columns2, Copy, Eye, GripVertical, Heading, Images, ImagePlus,
  LayoutGrid, LayoutTemplate, ListOrdered, Loader2, MailPlus, Megaphone, MessagesSquare, MoveVertical,
  Package, Quote, Save, Settings2, Trash2, Type, X,
} from "lucide-react";
import { savePage, deletePage, type PageMeta } from "@/app/admin/(panel)/stranky/actions";
import { MediaPicker } from "@/components/editor/media-picker";
import { EditableSection, type Data } from "@/components/editor/editor-section";
import { BLOCK_DEFS, BLOCK_DEF, type BlockType } from "@/lib/blocks";
import { cn } from "@/lib/utils";

const PAL_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  LayoutTemplate, Heading, Type, Columns2, LayoutGrid, ListOrdered, BarChart3, Package, Images, Quote,
  MessagesSquare, Building2, Megaphone, MailPlus, MoveVertical,
};

const GROUPS = ["Hlavní", "Obsah", "Sociální důkaz", "Akce"] as const;
const FULL_BLEED = new Set<BlockType>(["hero", "cta"]);

type EditorBlock = { id: string; type: BlockType; data: Data };

type InitialPage = {
  id: string; title: string; slug: string; metaDescription: string;
  published: boolean; showInNav: boolean; navLabel: string | null;
  blocks: { type: string; data: string }[];
};

function parse(s: string): Data {
  try { return JSON.parse(s) as Data; } catch { return {}; }
}

export function VisualEditor({ page }: { page: InitialPage }) {
  const [meta, setMeta] = useState<PageMeta>({
    title: page.title, slug: page.slug, metaDescription: page.metaDescription,
    published: page.published, showInNav: page.showInNav, navLabel: page.navLabel ?? "",
  });
  // Keep ALL blocks — unknown types are preserved (rendered as a read-only
  // placeholder) so a save never silently destroys a block this build can't edit.
  const [blocks, setBlocks] = useState<EditorBlock[]>(() =>
    page.blocks.map((b, i) => ({ id: `blk-${i}`, type: b.type as BlockType, data: parse(b.data) })),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [panel, setPanel] = useState<"page" | "block" | null>(null);
  const [dragType, setDragType] = useState<string | null>(null);
  const [picker, setPicker] = useState<((url: string) => void) | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Warn before losing unsaved changes (tab close / hard navigation).
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const selectedBlock = useMemo(() => blocks.find((b) => b.id === selected) ?? null, [blocks, selected]);
  const touch = () => setDirty(true);

  // Keyboard / non-pointer reorder fallback.
  const moveBlock = (id: string, dir: -1 | 1) => {
    setBlocks((bs) => {
      const i = bs.findIndex((b) => b.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= bs.length) return bs;
      return arrayMove(bs, i, j);
    });
    touch();
  };

  const updateBlock = (id: string, data: Data) => { setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, data } : b))); touch(); };
  const removeBlock = (id: string) => { setBlocks((bs) => bs.filter((b) => b.id !== id)); if (selected === id) { setSelected(null); setPanel(null); } touch(); };
  const duplicateBlock = (id: string) => {
    setBlocks((bs) => { const i = bs.findIndex((b) => b.id === id); if (i < 0) return bs;
      const copy = { ...bs[i], id: nanoid(), data: JSON.parse(JSON.stringify(bs[i].data)) as Data };
      return [...bs.slice(0, i + 1), copy, ...bs.slice(i + 1)]; });
    touch();
  };
  const insertAt = (index: number, type: BlockType) => {
    const made = { id: nanoid(), type, data: BLOCK_DEF[type].make() };
    setBlocks((bs) => [...bs.slice(0, index), made, ...bs.slice(index)]);
    setSelected(made.id); setPanel("block"); touch();
  };

  function resolveIndex(overId: string | null): number {
    if (!overId) return blocks.length;
    if (overId.startsWith("slot:")) return Number(overId.slice(5));
    const i = blocks.findIndex((b) => b.id === overId);
    return i >= 0 ? i + 1 : blocks.length;
  }

  function onDragStart(e: DragStartEvent) { setDragType(String(e.active.id)); }
  function onDragEnd(e: DragEndEvent) {
    const activeId = String(e.active.id);
    const overId = e.over ? String(e.over.id) : null;
    setDragType(null);
    if (activeId.startsWith("pal:")) { if (!overId) return; insertAt(resolveIndex(overId), activeId.slice(4) as BlockType); return; }
    if (!overId || activeId === overId) return;
    const from = blocks.findIndex((b) => b.id === activeId);
    if (from < 0) return;
    if (overId.startsWith("slot:")) { let to = Number(overId.slice(5)); if (from < to) to -= 1; setBlocks((bs) => arrayMove(bs, from, to)); }
    else { const to = blocks.findIndex((b) => b.id === overId); if (to >= 0) setBlocks((bs) => arrayMove(bs, from, to)); }
    touch();
  }

  function save() {
    start(async () => {
      setError("");
      try {
        const slug = await savePage(page.id, meta, blocks.map((b) => ({ type: b.type, data: JSON.stringify(b.data) })));
        setMeta((m) => ({ ...m, slug })); setDirty(false); setSaved(true); setTimeout(() => setSaved(false), 1800);
      } catch {
        setError("Uložení selhalo. Zkuste to prosím znovu.");
      }
    });
  }

  return (
    <div className="flex h-screen flex-col bg-base text-ink">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-surface px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/admin/stranky/" className="grid h-9 w-9 shrink-0 place-items-center border border-line-strong text-ink-muted transition-colors hover:border-white hover:text-ink" aria-label="Zpět">
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <div className="truncate text-[14px] font-bold">{meta.title || "Bez názvu"}</div>
            <div className="truncate text-[11px] text-ink-dim">/{meta.slug}/ {dirty && <span className="text-red-bright">· neuloženo</span>}</div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={cn("hidden px-2 py-1 text-[10.5px] font-bold uppercase tracking-wide sm:inline", meta.published ? "border border-success/40 text-success" : "border border-line text-ink-dim")}>
            {meta.published ? "Publikováno" : "Koncept"}
          </span>
          {meta.published ? (
            <a href={`/${meta.slug}/`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-line-strong px-3.5 py-2 text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-muted transition-colors hover:border-white hover:text-ink">
              <Eye size={14} /> Náhled
            </a>
          ) : (
            <span title="Publikujte a uložte stránku pro náhled na webu" className="inline-flex cursor-not-allowed items-center gap-2 border border-line px-3.5 py-2 text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-dim/50">
              <Eye size={14} /> Náhled
            </span>
          )}
          <button onClick={() => { setPanel(panel === "page" ? null : "page"); setSelected(null); }} className={cn("inline-flex items-center gap-2 border px-3.5 py-2 text-[11.5px] font-bold uppercase tracking-[0.08em] transition-colors", panel === "page" ? "border-red text-red-bright" : "border-line-strong text-ink-muted hover:border-white hover:text-ink")}>
            <Settings2 size={14} /> Stránka
          </button>
          <button onClick={save} disabled={pending} className="inline-flex items-center gap-2 bg-red px-4 py-2 text-[11.5px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-red-dark disabled:opacity-60">
            {pending ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />} {saved ? "Uloženo" : "Uložit"}
          </button>
          {error && <span className="text-[11px] font-semibold text-red-bright">{error}</span>}
        </div>
      </header>

      {!mounted ? (
        <div className="grid flex-1 place-items-center text-[13px] text-ink-dim">Načítám editor…</div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="flex min-h-0 flex-1">
            {/* palette */}
            <aside className="w-60 shrink-0 overflow-y-auto border-r border-line bg-surface p-4">
              {GROUPS.map((g) => (
                <div key={g} className="mb-5">
                  <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-ink-dim">{g}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {BLOCK_DEFS.filter((d) => d.group === g).map((def) => {
                      const Icon = PAL_ICONS[def.icon] ?? Type;
                      return <PaletteItem key={def.type} id={`pal:${def.type}`} label={def.label} icon={Icon} onAdd={() => insertAt(blocks.length, def.type)} />;
                    })}
                  </div>
                </div>
              ))}
              <p className="text-[11px] leading-relaxed text-ink-dim">Přetáhněte blok na stránku nebo na něj klikněte. Klikem na blok ho upravíte.</p>
            </aside>

            {/* canvas */}
            <main className="min-w-0 flex-1 overflow-y-auto bg-base" onClick={() => { setSelected(null); if (panel === "block") setPanel(null); }}>
              <div className="mx-auto max-w-[1180px] px-6 py-8">
                <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                  <InsertSlot index={0} active={!!dragType} />
                  {blocks.map((b, i) => (
                    <div key={b.id}>
                      <CanvasBlock block={b} selected={selected === b.id}
                        onSelect={() => { setSelected(b.id); setPanel("block"); }}
                        onChange={(data) => updateBlock(b.id, data)} onRemove={() => removeBlock(b.id)} onDuplicate={() => duplicateBlock(b.id)}
                        onMoveUp={i > 0 ? () => moveBlock(b.id, -1) : undefined}
                        onMoveDown={i < blocks.length - 1 ? () => moveBlock(b.id, 1) : undefined}
                        onPickImage={(assign) => setPicker(() => assign)} />
                      <InsertSlot index={i + 1} active={!!dragType} />
                    </div>
                  ))}
                </SortableContext>
                {blocks.length === 0 && (
                  <div className="grid h-48 place-items-center border border-dashed border-line-strong text-center text-ink-dim">
                    <p className="max-w-xs text-[14px]">Prázdná stránka. Přetáhněte sem blok z levého panelu, nebo na něj klikněte.</p>
                  </div>
                )}
              </div>
            </main>

            {/* inspector */}
            {(panel === "page" || (panel === "block" && selectedBlock)) && (
              <aside className="w-80 shrink-0 overflow-y-auto border-l border-line bg-surface p-5" onClick={(e) => e.stopPropagation()}>
                {panel === "page" ? (
                  <PageSettings meta={meta} onChange={(m) => { setMeta(m); touch(); }} pageId={page.id} onClose={() => setPanel(null)} />
                ) : selectedBlock ? (
                  <BlockInspector key={selectedBlock.id} block={selectedBlock} onChange={(d) => updateBlock(selectedBlock.id, d)} onPickImage={(a) => setPicker(() => a)} onClose={() => { setSelected(null); setPanel(null); }} />
                ) : null}
              </aside>
            )}
          </div>

          <DragOverlay dropAnimation={null}>
            {dragType?.startsWith("pal:") ? (
              <span className="inline-flex items-center gap-2 border border-red bg-elevated px-3 py-2 text-[12px] font-bold uppercase tracking-wide text-ink shadow-xl">
                {BLOCK_DEF[dragType.slice(4) as BlockType]?.label}
              </span>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {picker && (
        <MediaPicker onPick={(url) => { picker(url); setPicker(null); touch(); }} onClose={() => setPicker(null)} />
      )}
    </div>
  );
}

function PaletteItem({ id, label, icon: Icon, onAdd }: { id: string; label: string; icon: React.ComponentType<{ size?: number }>; onAdd: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <button ref={setNodeRef} {...attributes} {...listeners} onClick={onAdd}
      className={cn("flex cursor-grab flex-col items-start gap-1.5 border border-line-strong bg-card px-3 py-2.5 text-left text-[11.5px] font-semibold text-ink-muted transition-colors hover:border-red hover:text-ink active:cursor-grabbing", isDragging && "opacity-40")}>
      <Icon size={15} /> {label}
    </button>
  );
}

function InsertSlot({ index, active }: { index: number; active: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot:${index}` });
  return (
    <div ref={setNodeRef} className={cn("transition-all", active ? "py-2" : "py-1")}>
      <div className={cn("h-1 transition-all", isOver ? "bg-red" : active ? "bg-line" : "bg-transparent")} />
    </div>
  );
}

function CanvasBlock({ block, selected, onSelect, onChange, onRemove, onDuplicate, onMoveUp, onMoveDown, onPickImage }: {
  block: EditorBlock; selected: boolean; onSelect: () => void; onChange: (d: Data) => void; onRemove: () => void; onDuplicate: () => void;
  onMoveUp?: () => void; onMoveDown?: () => void; onPickImage: (a: (url: string) => void) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const known = !!BLOCK_DEF[block.type];
  const btn = "grid h-7 w-7 place-items-center border border-line-strong bg-elevated text-ink-dim transition-colors hover:text-ink disabled:opacity-30 disabled:hover:text-ink-dim";
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      className={cn("group/block relative", isDragging && "z-20 opacity-60")}>
      <div className={cn("relative border p-4 transition-colors", selected ? "border-red" : "border-transparent hover:border-line-strong")}>
        <div className="absolute -top-3.5 left-3 z-10 flex items-center gap-1">
          <span className="border border-line-strong bg-elevated px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-ink-dim">{BLOCK_DEF[block.type]?.label ?? `Neznámý blok: ${block.type}`}</span>
        </div>
        <div className={cn("absolute -top-3.5 right-3 z-10 flex items-center gap-1 transition-opacity", selected ? "opacity-100" : "opacity-0 group-hover/block:opacity-100")}>
          <button onClick={(e) => { e.stopPropagation(); onMoveUp?.(); }} disabled={!onMoveUp} className={btn} aria-label="Posunout nahoru"><ArrowUp size={13} /></button>
          <button onClick={(e) => { e.stopPropagation(); onMoveDown?.(); }} disabled={!onMoveDown} className={btn} aria-label="Posunout dolů"><ArrowDown size={13} /></button>
          <button {...attributes} {...listeners} onClick={(e) => e.stopPropagation()} className="grid h-7 w-7 cursor-grab place-items-center border border-line-strong bg-elevated text-ink-dim hover:text-ink active:cursor-grabbing" aria-label="Přetáhnout pro přesun"><GripVertical size={13} /></button>
          <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="grid h-7 w-7 place-items-center border border-line-strong bg-elevated text-ink-dim hover:text-ink" aria-label="Duplikovat"><Copy size={13} /></button>
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="grid h-7 w-7 place-items-center border border-red/40 bg-elevated text-red-bright hover:bg-red hover:text-white" aria-label="Smazat"><Trash2 size={13} /></button>
        </div>
        {known ? (
          <EditableSection type={block.type} data={block.data} onChange={onChange} onPickImage={onPickImage} />
        ) : (
          <p className="border border-dashed border-line-strong p-4 text-[13px] text-ink-dim">Tento blok („{block.type}“) tento editor nezná, ale zůstane na stránce zachován.</p>
        )}
      </div>
    </div>
  );
}

/* ── inspectors ──────────────────────────────────────────────── */
const inputCls = "w-full border border-line-strong bg-base px-3 py-2.5 text-[13.5px] text-ink outline-none transition-colors placeholder:text-ink-dim focus:border-red";
const labelCls = "mb-1.5 mt-4 block text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-dim first:mt-0";

function PanelHead({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
      <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink">{title}</span>
      <button onClick={onClose} className="text-ink-dim hover:text-ink" aria-label="Zavřít"><X size={16} /></button>
    </div>
  );
}

function BgToggle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <>
      <label className={labelCls}>Pozadí sekce</label>
      <div className="flex gap-2">
        {([["base", "Černé"], ["surface", "Tmavé"]] as const).map(([v, l]) => (
          <button key={v} onClick={() => onChange(v)} className={cn("flex-1 border px-3 py-2 text-[11.5px] font-bold uppercase", (value || "base") === v ? "border-red text-red-bright" : "border-line-strong text-ink-muted hover:text-ink")}>{l}</button>
        ))}
      </div>
    </>
  );
}

function BlockInspector({ block, onChange, onPickImage, onClose }: { block: EditorBlock; onChange: (d: Data) => void; onPickImage: (a: (url: string) => void) => void; onClose: () => void }) {
  const d = block.data;
  const set = (k: string, v: unknown) => onChange({ ...d, [k]: v });
  const sv = (v: unknown) => (typeof v === "string" ? v : "");
  const def = BLOCK_DEF[block.type];

  return (
    <div>
      <PanelHead title={def?.label ?? block.type} onClose={onClose} />

      {"accent" in d && (
        <>
          <label className={labelCls}>Zvýrazněná část nadpisu (červeně)</label>
          <input aria-label="Zvýrazněná část nadpisu" value={sv(d.accent)} onChange={(e) => set("accent", e.target.value)} className={inputCls} placeholder="poslední slova nadpisu" />
        </>
      )}

      {block.type === "hero" && (
        <>
          <label className={labelCls}>Obrázek v pozadí</label>
          <button onClick={() => onPickImage((u) => set("image", u))} className="flex h-24 w-full items-center justify-center border border-line-strong bg-cover bg-center text-[11px] font-bold uppercase text-white" style={{ backgroundImage: d.image ? `linear-gradient(rgba(0,0,0,.4),rgba(0,0,0,.4)),url('${sv(d.image)}')` : undefined }}>
            <ImagePlus size={16} className="mr-1.5" /> Vybrat
          </button>
          <BtnFields label="Hlavní tlačítko" obj={(d.primary as Data) ?? {}} onChange={(o) => set("primary", o)} />
          <BtnFields label="Vedlejší tlačítko" obj={(d.secondary as Data) ?? {}} onChange={(o) => set("secondary", o)} />
        </>
      )}

      {block.type === "heading" && (
        <>
          <label className={labelCls}>Zarovnání</label>
          <div className="flex gap-2">
            {([["left", "Vlevo"], ["center", "Na střed"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => set("align", v)} className={cn("flex-1 border px-3 py-2 text-[11.5px] font-bold uppercase", (d.align || "left") === v ? "border-red text-red-bright" : "border-line-strong text-ink-muted hover:text-ink")}>{l}</button>
            ))}
          </div>
        </>
      )}

      {block.type === "features" && (
        <>
          <label className={labelCls}>Počet sloupců</label>
          <div className="flex gap-2">{[2, 3].map((n) => <button key={n} onClick={() => set("columns", n)} className={cn("flex-1 border px-3 py-2 text-[12px] font-bold", (Number(d.columns) || 3) === n ? "border-red text-red-bright" : "border-line-strong text-ink-muted hover:text-ink")}>{n}</button>)}</div>
        </>
      )}

      {block.type === "imagetext" && (
        <>
          <label className={labelCls}>Strana obrázku</label>
          <div className="flex gap-2">
            {([["left", "Vlevo"], ["right", "Vpravo"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => set("side", v)} className={cn("flex-1 border px-3 py-2 text-[11.5px] font-bold uppercase", (d.side || "left") === v ? "border-red text-red-bright" : "border-line-strong text-ink-muted hover:text-ink")}>{l}</button>
            ))}
          </div>
          <BtnFields label="Tlačítko (volitelné)" obj={(d.button as Data) ?? {}} onChange={(o) => set("button", o)} />
        </>
      )}

      {block.type === "cta" && (
        <>
          <label className={labelCls}>Odkaz tlačítka</label>
          <input aria-label="Odkaz tlačítka" value={sv(d.buttonHref)} onChange={(e) => set("buttonHref", e.target.value)} className={inputCls} placeholder="/poptavkovy-formular/" />
        </>
      )}

      {block.type === "pricing" && <PricingItems items={Array.isArray(d.items) ? (d.items as Data[]) : []} onChange={(v) => set("items", v)} />}

      {block.type === "spacer" && (
        <>
          <label className={labelCls}>Výška mezery</label>
          <div className="flex gap-2">
            {([["s", "Malá"], ["m", "Střední"], ["l", "Velká"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => set("size", v)} aria-pressed={(sv(d.size) || "m") === v} className={cn("flex-1 border px-3 py-2 text-[11.5px] font-bold uppercase", (sv(d.size) || "m") === v ? "border-red text-red-bright" : "border-line-strong text-ink-muted hover:text-ink")}>{l}</button>
            ))}
          </div>
        </>
      )}

      {"bg" in d && <BgToggle value={sv(d.bg)} onChange={(v) => set("bg", v)} />}

      {!("accent" in d) && !("bg" in d) && block.type !== "hero" && block.type !== "spacer" && (
        <p className="text-[12.5px] leading-relaxed text-ink-dim">Tento blok upravíte přímo na stránce — klikněte do textu a pište.</p>
      )}
    </div>
  );
}

function BtnFields({ label, obj, onChange }: { label: string; obj: Data; onChange: (o: Data) => void }) {
  const sv = (v: unknown) => (typeof v === "string" ? v : "");
  return (
    <>
      <label className={labelCls}>{label}</label>
      <input aria-label={`${label} — text`} value={sv(obj.label)} onChange={(e) => onChange({ ...obj, label: e.target.value })} className={inputCls} placeholder="Text tlačítka" />
      <input aria-label={`${label} — odkaz`} value={sv(obj.href)} onChange={(e) => onChange({ ...obj, href: e.target.value })} className={`${inputCls} mt-2`} placeholder="/odkaz/" />
    </>
  );
}

const specsToText = (specs: unknown) => (Array.isArray(specs) ? (specs as [string, string][]).map(([k, v]) => `${k}: ${v}`).join("\n") : "");
const textToSpecs = (t: string): [string, string][] =>
  t.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => { const i = l.indexOf(":"); return i >= 0 ? ([l.slice(0, i).trim(), l.slice(i + 1).trim()] as [string, string]) : ([l, ""] as [string, string]); });

/** Controlled specs editor — local text is source of truth, parent stays in sync every keystroke. */
function SpecsEditor({ specs, onChange }: { specs: unknown; onChange: (v: [string, string][]) => void }) {
  const [text, setText] = useState(() => specsToText(specs));
  return (
    <textarea
      aria-label="Parametry balíčku (řádek = Popisek: Hodnota)"
      value={text}
      onChange={(e) => { setText(e.target.value); onChange(textToSpecs(e.target.value)); }}
      rows={4}
      className={inputCls}
    />
  );
}

function PricingItems({ items, onChange }: { items: Data[]; onChange: (v: Data[]) => void }) {
  const sv = (v: unknown) => (typeof v === "string" ? v : "");
  const set = (i: number, patch: Data) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  return (
    <div>
      {items.map((p, i) => (
        <div key={i} className="mb-3 border border-line-strong bg-card p-3">
          <label className={labelCls}>Parametry (řádek = „Popisek: Hodnota“)</label>
          <SpecsEditor specs={p.specs} onChange={(v) => set(i, { specs: v })} />
          <label className={labelCls}>Odkaz „Více informací“</label>
          <input aria-label="Odkaz Více informací" value={sv(p.href)} onChange={(e) => set(i, { href: e.target.value })} className={inputCls} placeholder="/poptavkovy-formular/" />
          <label className="mt-2 flex items-center gap-2 text-[12.5px] text-ink-muted"><input type="checkbox" checked={!!p.featured} onChange={(e) => set(i, { featured: e.target.checked })} className="accent-red" /> Zvýraznit</label>
        </div>
      ))}
    </div>
  );
}

function PageSettings({ meta, onChange, pageId, onClose }: { meta: PageMeta; onChange: (m: PageMeta) => void; pageId: string; onClose: () => void }) {
  const [, start] = useTransition();
  return (
    <div>
      <PanelHead title="Nastavení stránky" onClose={onClose} />
      <label className={labelCls}>Název stránky</label>
      <input aria-label="Název stránky" value={meta.title} onChange={(e) => onChange({ ...meta, title: e.target.value })} className={inputCls} />
      <label className={labelCls}>URL adresa (slug)</label>
      <input aria-label="URL adresa (slug)" value={meta.slug} onChange={(e) => onChange({ ...meta, slug: e.target.value })} className={inputCls} />
      <label className={labelCls}>Popis pro vyhledávače (SEO)</label>
      <textarea aria-label="Popis pro vyhledávače (SEO)" value={meta.metaDescription} onChange={(e) => onChange({ ...meta, metaDescription: e.target.value })} rows={3} className={inputCls} />
      <label className={labelCls}>Popisek v menu</label>
      <input aria-label="Popisek v menu" value={meta.navLabel} onChange={(e) => onChange({ ...meta, navLabel: e.target.value })} placeholder={meta.title} className={inputCls} />
      <div className="mt-5 flex flex-col gap-3">
        <label className="flex items-center gap-2.5 text-[13px] text-ink-muted"><input type="checkbox" checked={meta.published} onChange={(e) => onChange({ ...meta, published: e.target.checked })} className="accent-red" /> Publikováno (viditelné na webu)</label>
        <label className="flex items-center gap-2.5 text-[13px] text-ink-muted"><input type="checkbox" checked={meta.showInNav} onChange={(e) => onChange({ ...meta, showInNav: e.target.checked })} className="accent-red" /> Zobrazit v hlavním menu</label>
      </div>
      <button onClick={() => { if (!confirm("Opravdu smazat celou stránku?")) return; start(async () => { await deletePage(pageId); window.location.href = "/admin/stranky/"; }); }}
        className="mt-8 inline-flex items-center gap-2 border border-red/40 px-3.5 py-2 text-[11.5px] font-bold uppercase tracking-[0.08em] text-red-bright transition-colors hover:bg-red hover:text-white">
        <Trash2 size={13} /> Smazat stránku
      </button>
    </div>
  );
}
