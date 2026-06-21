import { Trash2, Mail, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/ui";
import { formatDateCZ } from "@/lib/utils";
import { deleteLead } from "./actions";

export const dynamic = "force-dynamic";

export default async function LeadsAdminPage() {
  const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="p-8">
      <AdminHeader title="Poptávky" desc="Kontakty odeslané formuláři na webu." />
      {leads.length === 0 ? (
        <p className="text-ink-muted">Zatím žádné poptávky.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {leads.map((l) => (
            <div key={l.id} className="border border-line-strong bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[16px] font-bold text-ink">{l.name}</span>
                    <span className="border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-dim">{l.source}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 font-mono text-[13px] text-ink-muted">
                    <a href={`tel:${l.phone}`} className="flex items-center gap-1.5 hover:text-red-bright"><Phone size={13} /> {l.phone}</a>
                    <a href={`mailto:${l.email}`} className="flex items-center gap-1.5 hover:text-red-bright"><Mail size={13} /> {l.email}</a>
                  </div>
                  {l.message && <p className="mt-2.5 max-w-2xl text-[14px] leading-relaxed text-ink-muted">{l.message}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="font-mono text-[11px] text-ink-dim">{formatDateCZ(l.createdAt)}</span>
                  <form action={deleteLead.bind(null, l.id)}>
                    <button type="submit" className="inline-flex items-center gap-1.5 border border-red/40 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wide text-red-bright transition-colors hover:bg-red hover:text-white">
                      <Trash2 size={12} /> Smazat
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
