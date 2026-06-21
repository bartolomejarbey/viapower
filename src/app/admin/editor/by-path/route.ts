import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { importPageFromPath } from "@/app/admin/(panel)/stranky/actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Resolve a live-site path to its visual-editor URL. Existing CMS page →
 * straight to the editor; importable migrated page → take it over first.
 * Middleware already guards /admin/*.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  let path = url.searchParams.get("path") || "/";
  if (!path.startsWith("/")) path = "/" + path;
  if (!path.endsWith("/")) path += "/";

  if (path === "/") {
    // the homepage is component-based; its texts live in Nastavení
    return NextResponse.redirect(new URL("/admin/nastaveni/", req.url));
  }

  const slug = path.replace(/^\/+|\/+$/g, "");
  const existing = await db.page.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.redirect(new URL(`/admin/editor/${existing.id}/`, req.url));
  }

  try {
    const id = await importPageFromPath(path);
    return NextResponse.redirect(new URL(`/admin/editor/${id}/`, req.url));
  } catch {
    // Functional pages (formulář, výpis referencí/pozic, kontakt) have no block
    // editor — their texts are edited live on the site, data in Nastavení/Ceník.
    return NextResponse.redirect(new URL(`/admin/stranky/?special=${encodeURIComponent(path)}`, req.url));
  }
}
