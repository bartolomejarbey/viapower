"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertSession } from "@/lib/auth";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/cenik");
}

export type PackageInput = {
  name: string;
  powerKwp: string;
  battery: string;
  panels: string;
  priceFrom: number | null;
  featured: boolean;
  href: string;
  specs: string;
  published: boolean;
};

export async function createPackage(data: PackageInput) {
  await assertSession();
  const count = await db.pricePackage.count();
  await db.pricePackage.create({ data: { ...data, order: count } });
  revalidate();
}

export async function updatePackage(id: string, data: PackageInput) {
  await assertSession();
  await db.pricePackage.update({ where: { id }, data });
  revalidate();
}

export async function deletePackage(id: string) {
  await assertSession();
  await db.pricePackage.delete({ where: { id } });
  revalidate();
}

export async function reorderPackages(ids: string[]) {
  await assertSession();
  await Promise.all(ids.map((id, i) => db.pricePackage.update({ where: { id }, data: { order: i } })));
  revalidate();
}
