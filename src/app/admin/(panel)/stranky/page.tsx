import Link from "next/link";
import { Plus, FileText, Paintbrush, ArrowRight, Info } from "lucide-react";
import { getAllCmsPages } from "@/lib/cms";
import { getAllPages, pathFromUrl, categorize, cleanTitle } from "@/lib/content";
import { AdminHeader, btnPrimary } from "@/components/admin/ui";
import { takeOverAndEdit, newPageAndEdit } from "./actions";
import { IMPORTABLE } from "./importable";

export const dynamic = "force-dynamic";

export default async function PagesAdminPage({ searchParams }: { searchParams: Promise<{ special?: string }> }) {
  const { special } = await searchParams;
  const pages = await getAllCmsPages();
  const taken = new Set(pages.map((p) => p.slug));
  const migratable = getAllPages()
    .map((p) => ({ path: pathFromUrl(p.url), title: cleanTitle(p) }))
    .filter((p) => p.path !== "/" && IMPORTABLE.has(categorize(p.path)) && !taken.has(p.path.replace(/^\/+|\/+$/g, "")))
    .sort((a, b) => a.path.localeCompare(b.path));

  return (
    <div className="p-8">
      <AdminHeader
        title="Stránky"
        desc="Vlastní stránky upravujete ve vizuálním editoru. Publikované se zobrazí na webu, volitelně i v menu."
        action={
          <form action={newPageAndEdit}>
            <button type="submit" className={btnPrimary}>
              <Plus size={15} /> Nová stránka
            </button>
          </form>
        }
      />

      {special && (
        <div className="mb-6 flex items-start gap-3 border border-red/40 bg-red-soft p-4 text-[13.5px] text-ink-muted">
          <Info size={18} className="mt-0.5 shrink-0 text-red-bright" />
          <div>
            <span className="font-semibold text-ink">Stránka {special} je funkční šablona</span> (formulář, výpis referencí/pozic nebo kontakt) a nemá blokový editor.
            Její nadpisy upravíte přímo na webu přes <span className="font-semibold text-ink">Živá editace</span>, kontaktní údaje v <Link href="/admin/nastaveni/" className="text-red-bright underline">Nastavení</Link>, ceny v <Link href="/admin/cenik/" className="text-red-bright underline">Ceníku</Link> a služby v <Link href="/admin/sluzby/" className="text-red-bright underline">Službách</Link>.
          </div>
        </div>
      )}

      {pages.length === 0 ? (
        <p className="text-ink-muted">Zatím žádné vlastní stránky. Vytvořte první, nebo převezměte existující stránku níže.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {pages.map((p) => (
            <Link
              key={p.id}
              href={`/admin/editor/${p.id}/`}
              className="brackets brackets-draw group flex items-center justify-between gap-4 border border-line-strong bg-card p-5 transition-colors hover:border-red"
            >
              <div className="flex items-center gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center border border-red bg-red-soft text-red">
                  <Paintbrush size={20} />
                </span>
                <div>
                  <span className="text-[16px] font-bold text-ink group-hover:text-red-bright">{p.title}</span>
                  <div className="mt-1 text-[12px] text-ink-dim">/{p.slug}/ · {p._count.blocks} bloků · otevřít ve vizuálním editoru</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wide">
                {p.showInNav && <span className="border border-line px-2 py-0.5 text-ink-dim">v menu</span>}
                <span className={p.published ? "border border-success/40 px-2 py-0.5 text-success" : "border border-line px-2 py-0.5 text-ink-dim"}>
                  {p.published ? "publikováno" : "koncept"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {migratable.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-2 text-[18px] font-bold text-ink">Stránky webu k převzetí</h2>
          <p className="mb-5 max-w-2xl text-[13.5px] text-ink-muted">
            Tyto stránky zatím běží na obsahu z původního webu. Kliknutím je převezmete do vizuálního editoru —
            obsah se rozloží na upravitelné bloky a stránka zůstane beze změny, dokud ji neupravíte.
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {migratable.map((m) => (
              <form key={m.path} action={takeOverAndEdit.bind(null, m.path)}>
                <button
                  type="submit"
                  className="group flex w-full items-center justify-between gap-3 border border-line bg-card px-4 py-3 text-left transition-colors hover:border-red"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <FileText size={16} className="shrink-0 text-ink-dim" />
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-semibold text-ink">{m.title}</span>
                      <span className="block truncate text-[11.5px] text-ink-dim">{m.path}</span>
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide text-red-bright opacity-0 transition-opacity group-hover:opacity-100">
                    Převzít <ArrowRight size={12} />
                  </span>
                </button>
              </form>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
