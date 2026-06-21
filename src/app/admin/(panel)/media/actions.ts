"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertSession } from "@/lib/auth";

export async function deleteMedia(id: string) {
  await assertSession();
  await db.mediaAsset.delete({ where: { id } });
  revalidatePath("/admin/media");
}

export async function updateMediaAlt(id: string, alt: string) {
  await assertSession();
  await db.mediaAsset.update({ where: { id }, data: { alt } });
  revalidatePath("/admin/media");
}
