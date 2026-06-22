"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertSession } from "@/lib/auth";

export async function deleteMedia(id: string) {
  await assertSession();
  const asset = await db.mediaAsset.findUnique({ where: { id } });
  await db.mediaAsset.delete({ where: { id } });

  // Best-effort: remove the backing object from Supabase Storage so we don't leak files.
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "media";
  const prefix = url ? `${url}/storage/v1/object/public/${bucket}/` : "";
  if (asset && url && key && prefix && asset.url.startsWith(prefix)) {
    const name = asset.url.slice(prefix.length);
    try {
      await fetch(`${url}/storage/v1/object/${bucket}/${name}`, { method: "DELETE", headers: { Authorization: `Bearer ${key}`, apikey: key } });
    } catch { /* non-fatal */ }
  }
  revalidatePath("/admin/media");
}

export async function updateMediaAlt(id: string, alt: string) {
  await assertSession();
  await db.mediaAsset.update({ where: { id }, data: { alt } });
  revalidatePath("/admin/media");
}
