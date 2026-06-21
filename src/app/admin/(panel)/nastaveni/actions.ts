"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertSession } from "@/lib/auth";

export async function saveSettings(values: Record<string, string>) {
  await assertSession();
  await Promise.all(
    Object.entries(values).map(([key, value]) =>
      db.setting.upsert({
        where: { key },
        update: { value: JSON.stringify(value) },
        create: { key, value: JSON.stringify(value) },
      }),
    ),
  );
  revalidatePath("/", "layout");
  revalidatePath("/admin/nastaveni");
}
