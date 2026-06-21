import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/ui";
import { MediaManager } from "./media-manager";

export const dynamic = "force-dynamic";

export default async function MediaAdminPage() {
  const assets = await db.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="p-8">
      <AdminHeader title="Média" desc="Knihovna obrázků. URL vložíte do bloků stránek nebo nastavení." />
      <MediaManager initial={assets.map((a) => ({ id: a.id, url: a.url, filename: a.filename, alt: a.alt }))} />
    </div>
  );
}
