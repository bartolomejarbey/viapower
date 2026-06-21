import Link from "next/link";
import { LayoutGrid, Tag, FileText, Inbox, Image as ImageIcon, FileSpreadsheet, ArrowRight, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { listOffers } from "@/lib/offers/store";
import { AdminHeader, btnPrimary } from "@/components/admin/ui";
import { newPageAndEdit } from "./stranky/actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [services, packages, pages, leads, media] = await Promise.all([
    db.service.count(),
    db.pricePackage.count(),
    db.page.count(),
    db.lead.count(),
    db.mediaAsset.count(),
  ]);
  const offers = listOffers().length;
  const recentLeads = await db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 });

  const stats = [
    { label: "Služby", value: services, href: "/admin/sluzby/", icon: LayoutGrid },
    { label: "Cenové balíčky", value: packages, href: "/admin/cenik/", icon: Tag },
    { label: "Vlastní stránky", value: pages, href: "/admin/stranky/", icon: FileText },
    { label: "Poptávky", value: leads, href: "/admin/poptavky/", icon: Inbox },
    { label: "Média", value: media, href: "/admin/media/", icon: ImageIcon },
    { label: "Nabídky", value: offers, href: "/admin/nabidky/", icon: FileSpreadsheet },
  ];

  return (
    <div className="p-8">
      <AdminHeader
        title="Přehled"
        desc="Vítejte v administraci Viapower. Spravujte obsah, ceny, stránky a nabídky."
        action={
          <form action={newPageAndEdit}>
            <button type="submit" className={btnPrimary}>
              <Plus size={15} /> Nová stránka
            </button>
          </form>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="brackets group border border-line-strong bg-card p-6 transition-colors hover:border-red [&::before]:opacity-0 [&::after]:opacity-0 hover:[&::before]:opacity-100 hover:[&::after]:opacity-100">
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center border border-red bg-red-soft text-red">
                <s.icon size={20} />
              </span>
              <ArrowRight size={18} className="text-ink-dim transition-transform group-hover:translate-x-1 group-hover:text-red-bright" />
            </div>
            <div className="mt-5 text-[40px] font-bold leading-none tracking-tight text-ink">{s.value}</div>
            <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-dim">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="mb-4 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em] text-red-bright"><span className="h-1.5 w-1.5 bg-red" /> Poslední poptávky</h2>
        {recentLeads.length === 0 ? (
          <p className="text-[14px] text-ink-muted">Zatím žádné poptávky. Formuláře na webu je zapíší sem.</p>
        ) : (
          <div className="border border-line-strong">
            {recentLeads.map((l) => (
              <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5 last:border-0">
                <div>
                  <span className="font-semibold text-ink">{l.name}</span>
                  <span className="ml-3 font-mono text-[12px] text-ink-muted">{l.phone} · {l.email}</span>
                </div>
                <span className="font-mono text-[11px] text-ink-dim">{l.source}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
