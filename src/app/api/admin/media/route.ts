import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

// Only real images may be uploaded — never executable/SVG content served from our origin.
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "media";
const useStorage = Boolean(SUPABASE_URL && SERVICE_KEY);

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ ok: false }, { status: 401 });
  const assets = await db.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ assets });
}

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ ok: false }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "no_file" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ ok: false, error: "bad_type" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "too_large" }, { status: 413 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const name = `${Date.now().toString(36)}-${safe}`;

  let url: string;
  if (useStorage) {
    // Persistent object storage — required on Vercel (read-only/ephemeral FS).
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${name}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY as string,
        "Content-Type": file.type,
        "cache-control": "31536000",
        "x-upsert": "true",
      },
      body: new Uint8Array(buf),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("media upload to storage failed", res.status, detail);
      return NextResponse.json({ ok: false, error: "storage_failed" }, { status: 502 });
    }
    url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${name}`;
  } else {
    // Local-dev fallback: write to public/uploads (NOT used on Vercel).
    const dir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), buf);
    url = `/uploads/${name}`;
  }

  const asset = await db.mediaAsset.create({ data: { url, filename: file.name, alt: "" } });
  return NextResponse.json({ ok: true, asset });
}
