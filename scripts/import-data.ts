import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
const db = new PrismaClient();
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
function revive(rows: Record<string, unknown>[]) {
  return rows.map((r) => {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(r)) o[k] = typeof v === "string" && ISO.test(v) ? new Date(v) : v;
    return o;
  });
}
async function main() {
  const d = JSON.parse(fs.readFileSync("/tmp/viapower-data.json", "utf8"));
  const order: [string, string][] = [
    ["user", "user"], ["setting", "setting"], ["service", "service"], ["pricePackage", "pricePackage"],
    ["page", "page"], ["block", "block"], ["mediaAsset", "mediaAsset"], ["lead", "lead"], ["revision", "revision"],
  ];
  for (const [key, model] of order) {
    const rows = d[key] ?? [];
    if (!rows.length) { console.log(`  ${key}: 0 (skip)`); continue; }
    // @ts-expect-error dynamic model access
    const res = await db[model].createMany({ data: revive(rows), skipDuplicates: true });
    console.log(`  ${key}: ${res.count}`);
  }
  await db.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
