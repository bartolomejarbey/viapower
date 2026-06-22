"use server";

import { redirect } from "next/navigation";
import { assertSession } from "@/lib/auth";
import { buildOfferFromDraft } from "@/lib/offers/generate";
import { saveOffer } from "@/lib/offers/store";

/** Create an empty offer and jump straight into the manual editor. */
export async function createManualOffer() {
  await assertSession();
  const offer = buildOfferFromDraft({
    type: "FVE",
    subject: "Nová nabídka",
    investor: { name: "", contact: "" },
    location: "",
    validUntil: "",
    technology: { summary: "", bullets: [] },
    budget: { groups: [], included: [], vatRate: 12 },
    addons: [],
  });
  await saveOffer(offer);
  redirect(`/admin/nabidky/${offer.id}/`);
}
