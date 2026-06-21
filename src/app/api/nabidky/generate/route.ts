import { NextResponse } from "next/server";
import { generateOfferFromBrief } from "@/lib/offers/generate";
import { saveOffer } from "@/lib/offers/store";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ ok: false }, { status: 401 });
  let brief = "";
  try {
    const body = await req.json();
    brief = String(body?.brief ?? "");
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (!brief.trim()) return NextResponse.json({ ok: false, error: "missing_brief" }, { status: 422 });

  try {
    const offer = await generateOfferFromBrief(brief);
    await saveOffer(offer);
    return NextResponse.json({ ok: true, offer });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
