"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertSession } from "@/lib/auth";

export async function deleteLead(id: string) {
  await assertSession();
  await db.lead.delete({ where: { id } });
  revalidatePath("/admin/poptavky/");
  revalidatePath("/admin/", "layout");
}

export async function markAllLeadsRead() {
  await assertSession();
  await db.lead.updateMany({ where: { read: false }, data: { read: true } });
  revalidatePath("/admin/poptavky/");
  revalidatePath("/admin/", "layout");
}
