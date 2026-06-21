import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
const db = new PrismaClient();
async function main() {
  const data = {
    user: await db.user.findMany(),
    setting: await db.setting.findMany(),
    service: await db.service.findMany(),
    pricePackage: await db.pricePackage.findMany(),
    page: await db.page.findMany(),
    block: await db.block.findMany(),
    mediaAsset: await db.mediaAsset.findMany(),
    lead: await db.lead.findMany(),
    revision: await db.revision.findMany().catch(() => []),
  };
  fs.writeFileSync("/tmp/viapower-data.json", JSON.stringify(data));
  console.log("exported:", Object.entries(data).map(([k, v]) => `${k}:${(v as unknown[]).length}`).join("  "));
  await db.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
