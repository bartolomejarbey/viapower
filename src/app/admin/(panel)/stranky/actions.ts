"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { assertSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { categorize, categoryLabel, cleanTitle, getMarkdown, getPageByPath } from "@/lib/content";
import { BLOCK_DEF } from "@/lib/blocks";
import { IMPORTABLE } from "./importable";

/** Slugify a (possibly multi-segment) path, preserving the slashes so taken-over
 * reference/career pages keep their nested public URL after an editor save. */
function slugifyPath(input: string): string {
  return input.split("/").map((seg) => slugify(seg)).filter(Boolean).join("/");
}

/**
 * Take over a still-template page into the visual editor as designed blocks:
 * a hero + a richtext body (+ pricing if it carried packages) + a CTA.
 * Idempotent — returns the existing CMS page id if the slug is already taken.
 */
export async function importPageFromPath(path: string): Promise<string> {
  await assertSession();
  const slug = path.replace(/^\/+|\/+$/g, "");
  const existing = await db.page.findUnique({ where: { slug } });
  if (existing) return existing.id;

  const migrated = getPageByPath(path);
  if (!migrated) throw new Error(`Stránka ${path} neexistuje.`);
  if (!IMPORTABLE.has(categorize(path))) throw new Error(`Stránku ${path} nelze převzít (používá speciální šablonu).`);

  const title = cleanTitle(migrated);
  const html = mdToHtml(getMarkdown(migrated));
  const seeds: { type: string; data: string }[] = [
    { type: "hero", data: JSON.stringify({ ...BLOCK_DEF.hero.make(), eyebrow: categoryLabel(categorize(path)), title, sub: migrated.metaDescription ?? "" }) },
    { type: "richtext", data: JSON.stringify({ html, bg: "base" }) },
  ];
  if (migrated.packages?.length) {
    seeds.push({ type: "pricing", data: JSON.stringify({ ...BLOCK_DEF.pricing.make(), title: "Naše balíčky", items: migrated.packages }) });
  }
  seeds.push({ type: "cta", data: JSON.stringify(BLOCK_DEF.cta.make()) });

  const count = await db.page.count();
  const page = await db.page.create({
    data: { slug, title, metaDescription: migrated.metaDescription ?? "", published: true, showInNav: false, order: count, blocks: { create: seeds.map((s, i) => ({ type: s.type, data: s.data, order: i })) } },
  });

  revalidatePath("/", "layout");
  revalidatePath(path);
  revalidatePath("/admin/stranky");
  return page.id;
}

/** Minimal markdown → HTML for the richtext fallback (headings, lists, bold, links, paragraphs). */
function mdToHtml(md: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s: string) =>
    esc(s)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  const lines = md.split("\n");
  const out: string[] = [];
  let list: string[] | null = null;
  const flush = () => { if (list) { out.push("<ul>" + list.map((li) => `<li>${inline(li)}</li>`).join("") + "</ul>"); list = null; } };
  for (const raw of lines) {
    const l = raw.trim();
    if (!l) { flush(); continue; }
    const h = l.match(/^(#{2,4})\s+(.*)/);
    if (h) { flush(); out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); continue; }
    const li = l.match(/^[-*]\s+(.*)/);
    if (li) { (list ??= []).push(li[1]); continue; }
    flush();
    out.push(`<p>${inline(l)}</p>`);
  }
  flush();
  return out.join("");
}

/** Form action: take over a template page and jump straight into the editor. */
export async function takeOverAndEdit(path: string) {
  const id = await importPageFromPath(path);
  redirect(`/admin/editor/${id}/`);
}

export async function createPage(): Promise<string> {
  await assertSession();
  // Prune ONLY clearly-abandoned untouched drafts: default title, never published,
  // and not touched in over 2 hours (savePage bumps updatedAt, so an active draft
  // is always safe). This avoids accumulating orphans without ever deleting a draft
  // the user is currently working on.
  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000);
  await db.page.deleteMany({
    where: { title: "Nová stránka", published: false, showInNav: false, slug: { startsWith: "nova-stranka-" }, updatedAt: { lt: cutoff } },
  });
  const count = await db.page.count();
  const page = await db.page.create({
    data: {
      slug: `nova-stranka-${Date.now().toString(36)}`,
      title: "Nová stránka",
      order: count,
      blocks: {
        create: [
          { type: "hero", data: JSON.stringify(BLOCK_DEF.hero.make()), order: 0 },
          { type: "richtext", data: JSON.stringify(BLOCK_DEF.richtext.make()), order: 1 },
          { type: "cta", data: JSON.stringify(BLOCK_DEF.cta.make()), order: 2 },
        ],
      },
    },
  });
  return page.id;
}

/** Form action: create a fresh page and jump straight into the visual editor. */
export async function newPageAndEdit() {
  const id = await createPage();
  redirect(`/admin/editor/${id}/`);
}

export type PageMeta = {
  title: string;
  slug: string;
  metaDescription: string;
  published: boolean;
  showInNav: boolean;
  navParent: string | null;
  noindex: boolean;
  navLabel: string;
};

/** Atomic save (transaction) so a failure can never leave a page emptied. */
export async function savePage(pageId: string, meta: PageMeta, blocks: { type: string; data: string }[]) {
  await assertSession();
  const prev = await db.page.findUnique({ where: { id: pageId }, select: { slug: true } });
  let slug = slugifyPath(meta.slug || meta.title) || `stranka-${Date.now().toString(36)}`;
  const clash = await db.page.findFirst({ where: { slug, id: { not: pageId } }, select: { id: true } });
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  // Reject corrupt (non-JSON) block data so it never reaches the DB. Unknown
  // block types are intentionally allowed through — the editor preserves them.
  for (const b of blocks) {
    try { JSON.parse(b.data); } catch { throw new Error("Poškozená data bloku."); }
  }

  await db.$transaction([
    db.page.update({
      where: { id: pageId },
      data: {
        title: meta.title, slug, metaDescription: meta.metaDescription,
        published: meta.published, showInNav: meta.showInNav, navParent: meta.navParent, noindex: meta.noindex, navLabel: meta.navLabel,
      },
    }),
    db.block.deleteMany({ where: { pageId } }),
    ...(blocks.length ? [db.block.createMany({ data: blocks.map((b, i) => ({ pageId, type: b.type, data: b.data, order: i })) })] : []),
  ]);

  revalidatePath("/", "layout");
  if (prev && prev.slug !== slug) revalidatePath(`/${prev.slug}/`); // invalidate the old URL on rename
  revalidatePath(`/${slug}/`);
  revalidatePath("/admin/stranky");
  return slug;
}

export async function deletePage(id: string) {
  await assertSession();
  await db.page.delete({ where: { id } });
  revalidatePath("/", "layout");
  revalidatePath("/admin/stranky");
}
