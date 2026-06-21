import { NextResponse } from "next/server";
import { deleteOffer } from "@/lib/offers/store";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  // Built-in sample offers (vzor-*) are code-defined and cannot be deleted.
  if (id.startsWith("vzor-")) {
    return NextResponse.json({ ok: false, error: "sample" }, { status: 400 });
  }
  deleteOffer(id);
  return NextResponse.json({ ok: true });
}
