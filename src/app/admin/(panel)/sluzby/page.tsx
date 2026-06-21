import { getAllServices } from "@/lib/cms";
import { AdminHeader } from "@/components/admin/ui";
import { ServicesManager } from "./services-manager";

export const dynamic = "force-dynamic";

export default async function ServicesAdminPage() {
  const services = await getAllServices();
  return (
    <div className="p-8">
      <AdminHeader title="Služby" desc="Spravujte služby zobrazené na webu. Přetažením změníte pořadí." />
      <ServicesManager
        initial={services.map((s) => ({ id: s.id, title: s.title, excerpt: s.excerpt, icon: s.icon, href: s.href, published: s.published }))}
      />
    </div>
  );
}
