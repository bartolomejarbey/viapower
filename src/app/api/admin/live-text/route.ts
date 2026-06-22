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

  // Live edit handles on-page TEXT/IMAGE only. Never let it touch financial/SEO/marketing
  // settings (calculator constants, SEO, tag IDs) even from a crafted authenticated request.
  const BLOCKED = ["calc.", "seo.", "mkt.", "marketing.", "verify.", "app.", "company."];
  const changes = body.changes ?? {};
  const entries = Object.entries(changes).filter(
    ([k, v]) =>
      typeof k === "string" && k.length < 120 && typeof v === "string" && v.length < 10000 &&
      !BLOCKED.some((p) => k.startsWith(p)),
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
  if (body.path && body.path.startsWith("/")) {
    const p = body.path.endsWith("/") ? body.path : `${body.path}/`; // match trailingSlash:true cache key
    revalidatePath(p);
  }

  return NextResponse.json({ ok: true, saved: entries.length });
}
