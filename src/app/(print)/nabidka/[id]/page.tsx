import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOffer } from "@/lib/offers/store";
import { OfferDocument } from "@/components/offer/offer-document";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const offer = getOffer(id);
  return {
    title: offer ? `Cenová nabídka ${offer.number || offer.id}` : "Cenová nabídka",
    robots: { index: false, follow: false },
  };
}

export default async function OfferPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = getOffer(id);
  if (!offer) notFound();
  return <OfferDocument offer={offer} />;
}
