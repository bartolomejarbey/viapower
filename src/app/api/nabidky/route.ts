import { NextResponse } from "next/server";
import { listOffers, saveOffer } from "@/lib/offers/store";
import { OfferSchema } from "@/lib/offers/schema";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ ok: false }, { status: 401 });
  const offers = listOffers().map((o) => ({
    id: o.id,
    number: o.number,
    type: o.type,
    subject: o.subject,
    investor: o.investor,
    createdAt: o.createdAt,
  }));
  return NextResponse.json({ offers });
}

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ ok: false }, { status: 401 });
  try {
    const body = await req.json();
    const offer = OfferSchema.parse(body);
    saveOffer(offer);
    return NextResponse.json({ ok: true, offer });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 422 });
  }
}
