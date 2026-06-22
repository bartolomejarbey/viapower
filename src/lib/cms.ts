import "server-only";
import { cache } from "react";
import { db } from "./db";

export async function getServicesPublic() {
  return db.service.findMany({ where: { published: true }, orderBy: { order: "asc" } });
}
export async function getAllServices() {
  return db.service.findMany({ orderBy: { order: "asc" } });
}

export async function getPackagesPublic() {
  return db.pricePackage.findMany({ where: { published: true }, orderBy: { order: "asc" } });
}
export async function getAllPackages() {
  return db.pricePackage.findMany({ orderBy: { order: "asc" } });
}

export async function getNavPages() {
  return db.page.findMany({ where: { published: true, showInNav: true }, orderBy: { order: "asc" } });
}

export async function getCmsPage(slug: string) {
  return db.page.findFirst({ where: { slug, published: true }, include: { blocks: { orderBy: { order: "asc" } } } });
}

/** True if a CMS page claims this slug but is unpublished — so we must NOT fall back to the migrated snapshot. */
export async function isClaimedUnpublished(slug: string) {
  const p = await db.page.findUnique({ where: { slug }, select: { published: true } });
  return p ? !p.published : false;
}

export async function getCmsPageById(id: string) {
  return db.page.findUnique({ where: { id }, include: { blocks: { orderBy: { order: "asc" } } } });
}

export async function getAllCmsPages() {
  return db.page.findMany({ orderBy: { updatedAt: "desc" }, include: { _count: { select: { blocks: true } } } });
}

/** All settings, parsed (JSON-decoded values). Cached per request. */
export const getSettings = cache(async (): Promise<Record<string, string>> => {
  const rows = await db.setting.findMany();
  const out: Record<string, string> = {};
  for (const r of rows) {
    try {
      out[r.key] = JSON.parse(r.value);
    } catch {
      out[r.key] = r.value;
    }
  }
  return out;
});

export function setting(settings: Record<string, string>, key: string, fallback: string): string {
  const v = settings[key];
  return v != null && String(v).trim() !== "" ? v : fallback;
}
