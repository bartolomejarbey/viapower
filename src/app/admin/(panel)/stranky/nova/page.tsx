import { FilePlus } from "lucide-react";
import { AdminHeader, btnPrimary } from "@/components/admin/ui";
import { newPageAndEdit } from "../actions";

export const dynamic = "force-dynamic";

// NOTE: never create on GET/render (prefetch/bookmark would spawn orphan drafts).
// Page creation happens only via the POST form action below.
export default function NewPageRoute() {
  return (
    <div className="p-8">
      <AdminHeader title="Nová stránka" desc="Vytvoříme prázdnou stránku a otevřeme ji ve vizuálním editoru." />
      <form action={newPageAndEdit}>
        <button type="submit" className={btnPrimary}>
          <FilePlus size={15} /> Vytvořit a otevřít editor
        </button>
      </form>
    </div>
  );
}
