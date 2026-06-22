"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { assertSession } from "@/lib/auth";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/sluzby");
}

/** Normalize a user-entered href to a safe internal path (leading + trailing slash). */
function normalizeHref(href: string): string {
  const h = (href || "").trim();
  if (!h) return "";
  if (/^https?:\/\//i.test(h) || h.startsWith("mailto:") || h.startsWith("tel:")) return h;
  return "/" + h.replace(/^\/+/, "").replace(/\/+$/, "") + "/";
}

export async function createService(data: { title: string; excerpt: string; icon: string; image?: string; href: string }) {
  await assertSession();
  const count = await db.service.count();
  await db.service.create({
    data: {
      slug: `${slugify(data.title) || "sluzba"}-${Date.now().toString(36)}`,
      title: data.title,
      excerpt: data.excerpt,
      icon: data.icon || "Sun",
      image: data.image ?? "",
      href: normalizeHref(data.href),
      order: count,
    },
  });
  revalidate();
}

export async function updateService(
  id: string,
  data: { title: string; excerpt: string; icon: string; image?: string; href: string; published: boolean },
) {
  await assertSession();
  await db.service.update({ where: { id }, data: { ...data, image: data.image ?? "", href: normalizeHref(data.href) } });
  revalidate();
}

export async function deleteService(id: string) {
  await assertSession();
  await db.service.delete({ where: { id } });
  revalidate();
}

export async function reorderServices(ids: string[]) {
  await assertSession();
  await Promise.all(ids.map((id, i) => db.service.update({ where: { id }, data: { order: i } })));
  revalidate();
}
