import { Mail, Phone, CheckCheck } from "lucide-react";
import { db } from "@/lib/db";
import { AdminHeader, btnGhost } from "@/components/admin/ui";
import { formatDateCZ } from "@/lib/utils";
import { DeleteLeadButton } from "./lead-actions";
import { markAllLeadsRead } from "./actions";

export const dynamic = "force-dynamic";

export default async function LeadsAdminPage() {
  const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" } });
  const unread = leads.filter((l) => !l.read).length;

  return (
    <div className="p-8">
      <AdminHeader
        title="Poptávky"
        desc="Kontakty odeslané formuláři na webu."
        action={unread > 0 ? (
          <form action={markAllLeadsRead}>
            <button type="submit" className={btnGhost}><CheckCheck size={15} /> Označit vše jako přečtené ({unread})</button>
          </form>
        ) : undefined}
      />
      {leads.length === 0 ? (
        <p className="text-ink-muted">Zatím žádné poptávky.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {leads.map((l) => (
            <div key={l.id} className={`border bg-card p-5 ${l.read ? "border-line-strong" : "border-l-2 border-l-red border-line-strong"}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    {!l.read && <span className="bg-red px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">Nové</span>}
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
                  <DeleteLeadButton id={l.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
