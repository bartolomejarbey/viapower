import { NextResponse } from "next/server";
import { chatOffer, type ChatMsg } from "@/lib/offers/chat";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ ok: false }, { status: 401 });
  let messages: ChatMsg[] = [];
  try {
    const body = await req.json();
    messages = Array.isArray(body?.messages)
      ? body.messages
          .filter((m: unknown): m is ChatMsg => !!m && typeof (m as ChatMsg).content === "string" && ((m as ChatMsg).role === "user" || (m as ChatMsg).role === "assistant"))
          .map((m: ChatMsg) => ({ role: m.role, content: String(m.content).slice(0, 4000) }))
      : [];
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (messages.length === 0) return NextResponse.json({ ok: false, error: "no_messages" }, { status: 422 });

  try {
    const result = await chatOffer(messages);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err).slice(0, 200) }, { status: 500 });
  }
}
