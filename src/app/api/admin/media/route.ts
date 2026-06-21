import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

// Only real images may be uploaded — never executable/SVG content served from our origin.
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

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
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const name = `${Date.now().toString(36)}-${safe}`;
  await fs.writeFile(path.join(dir, name), buf);
  const url = `/uploads/${name}`;
  const asset = await db.mediaAsset.create({ data: { url, filename: file.name, alt: "" } });
  return NextResponse.json({ ok: true, asset });
}
