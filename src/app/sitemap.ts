import type { MetadataRoute } from "next";
import { getAllPages, pathFromUrl } from "@/lib/content";
import { getCompany } from "@/lib/company";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { url } = await getCompany();
  // Migrated pages from the content snapshot…
  const migrated = getAllPages().map((p) => pathFromUrl(p.url));
  // …plus every published, indexable CMS page (incl. ones built in the visual editor).
  const cms = await db.page.findMany({ where: { published: true, noindex: false }, select: { slug: true, updatedAt: true } });
  const lastMod = new Map(cms.map((p) => [`/${p.slug}/`, p.updatedAt]));

  const paths = Array.from(new Set([...migrated, ...cms.map((p) => `/${p.slug}/`)]));
  return paths.map((path) => ({
    url: url + path,
    lastModified: lastMod.get(path),
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : path.split("/").filter(Boolean).length === 1 ? 0.8 : 0.6,
  }));
}
