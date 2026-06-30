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

  // Honeypot: a hidden field real users never see. Bots fill every field, so a
  // non-empty value means a bot — accept silently (don't tip it off) but drop it.
  if (String(payload.company ?? "").trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = String(payload.name ?? "").trim();
  const phone = String(payload.phone ?? "").trim();
  const email = String(payload.email ?? "").trim();
  if (!name || !phone || !email) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 422 });
  }
  // Light server-side sanity checks (client validation is not authoritative).
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk || name.length > 200 || phone.length > 60 || email.length > 200) {
    return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 422 });
  }

  const lead = {
    name,
    phone,
    email,
    message: String(payload.message ?? "").slice(0, 5000),
    source: String(payload.source ?? "web").slice(0, 120),
  };

  await db.lead.create({ data: lead });
  // Best-effort notification — never fails the submission.
  await notifyLead(lead);

  return NextResponse.json({ ok: true });
}
