import { listOffers } from "@/lib/offers/store";
import { AdminHeader } from "@/components/admin/ui";
import { OffersManager } from "./offers-manager";

export const dynamic = "force-dynamic";

export default async function OffersAdminPage() {
  const offers = listOffers().map((o) => ({
    id: o.id,
    number: o.number,
    type: o.type,
    subject: o.subject,
    investor: { name: o.investor.name },
    createdAt: o.createdAt,
  }));

  return (
    <div className="p-8">
      <AdminHeader title="Nabídky" desc="Generátor cenových nabídek. Zadání převede na strukturovanou nabídku a PDF." />
      <OffersManager initial={offers} />
    </div>
  );
}
