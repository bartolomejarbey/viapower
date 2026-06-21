import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

/** Persist on-site live edits: a map of setting keys → new text/url values. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  let body: { changes?: Record<string, string>; path?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const changes = body.changes ?? {};
  const entries = Object.entries(changes).filter(
    ([k, v]) => typeof k === "string" && k.length < 120 && typeof v === "string" && v.length < 10000,
  );
  if (!entries.length) return NextResponse.json({ ok: false, error: "no_changes" }, { status: 422 });

  await Promise.all(
    entries.map(([key, value]) =>
      db.setting.upsert({
        where: { key },
        update: { value: JSON.stringify(value.trim()) },
        create: { key, value: JSON.stringify(value.trim()) },
      }),
    ),
  );

  revalidatePath("/", "layout");
  if (body.path && body.path.startsWith("/")) revalidatePath(body.path);

  return NextResponse.json({ ok: true, saved: entries.length });
}
