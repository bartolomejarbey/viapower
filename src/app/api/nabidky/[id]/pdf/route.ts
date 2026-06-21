import { getOffer } from "@/lib/offers/store";
import { renderOfferPdf } from "@/lib/offers/pdf";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return new Response("Neautorizováno", { status: 401 });
  const { id } = await params;
  const offer = await getOffer(id);
  if (!offer) return new Response("Nabídka nenalezena", { status: 404 });

  const origin = new URL(req.url).origin;
  try {
    const pdf = await renderOfferPdf(origin, id);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="viapower-nabidka-${id}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return new Response(`Chyba generování PDF: ${String(err)}`, { status: 500 });
  }
}
