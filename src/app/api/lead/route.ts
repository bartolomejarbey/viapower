import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifyLead } from "@/lib/notify";

export const runtime = "nodejs";

/** Lead intake — persists to the DB (visible in /admin/poptavky) and notifies the company. */
export async function POST(req: Request) {
  let payload: Record<string, string>;
  try {
    payload = (await req.json()) as Record<string, string>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const { name, phone, email } = payload ?? {};
  if (!name || !phone || !email) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 422 });
  }

  const lead = {
    name: String(name),
    phone: String(phone),
    email: String(email),
    message: String(payload.message ?? ""),
    source: String(payload.source ?? "web"),
  };

  await db.lead.create({ data: lead });
  // Best-effort notification — never fails the submission.
  await notifyLead(lead);

  return NextResponse.json({ ok: true });
}
