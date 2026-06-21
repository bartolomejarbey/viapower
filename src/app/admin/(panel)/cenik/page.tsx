import { getAllPackages } from "@/lib/cms";
import { AdminHeader } from "@/components/admin/ui";
import { PackagesManager } from "./packages-manager";

export const dynamic = "force-dynamic";

export default async function PricingAdminPage() {
  const packages = await getAllPackages();
  return (
    <div className="p-8">
      <AdminHeader title="Ceník" desc="Cenové balíčky FVE zobrazené na webu. Přetažením změníte pořadí." />
      <PackagesManager
        initial={packages.map((p) => ({
          id: p.id,
          name: p.name,
          powerKwp: p.powerKwp,
          battery: p.battery,
          panels: p.panels,
          priceFrom: p.priceFrom,
          featured: p.featured,
          href: p.href,
          specs: p.specs,
          published: p.published,
        }))}
      />
    </div>
  );
}
