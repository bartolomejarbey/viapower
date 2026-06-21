import type { MetadataRoute } from "next";
import { getAllPages, pathFromUrl } from "@/lib/content";
import { company } from "@/config/site";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Migrated pages from the content snapshot…
  const migrated = getAllPages().map((p) => pathFromUrl(p.url));
  // …plus every published CMS page (incl. ones built in the visual editor).
  const cms = (await db.page.findMany({ where: { published: true }, select: { slug: true } })).map((p) => `/${p.slug}/`);

  const paths = Array.from(new Set([...migrated, ...cms]));
  return paths.map((path) => ({
    url: company.url + path,
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : path.split("/").filter(Boolean).length === 1 ? 0.8 : 0.6,
  }));
}
