"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertSession } from "@/lib/auth";

export async function deleteLead(id: string) {
  await assertSession();
  await db.lead.delete({ where: { id } });
  revalidatePath("/admin/poptavky");
}
