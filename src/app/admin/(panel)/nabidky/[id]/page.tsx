import { notFound } from "next/navigation";
import { getOffer } from "@/lib/offers/store";
import { OfferEditor } from "../offer-editor";

export const dynamic = "force-dynamic";

export default async function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = getOffer(id);
  if (!offer) notFound();
  return (
    <div className="p-8">
      <OfferEditor offer={offer} />
    </div>
  );
}
