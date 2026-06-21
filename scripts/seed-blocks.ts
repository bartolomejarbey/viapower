import { PrismaClient } from "@prisma/client";
import fs from "node:fs";

const db = new PrismaClient();

const decode = (s: string): string =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&amp;/g, "&");

function deepDecode(v: unknown): unknown {
  if (typeof v === "string") return decode(v);
  if (Array.isArray(v)) return v.map(deepDecode);
  if (v && typeof v === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) o[k] = deepDecode(val);
    return o;
  }
  return v;
}

type Page = { url: string; title: string; metaDescription?: string; blocks: { type: string; data: unknown }[] };

async function main() {
  const file = process.argv[2];
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  const pages: Page[] = (raw.result ?? raw) as Page[];
  let n = 0;

  for (const p of pages) {
    if (!p || !p.url || !Array.isArray(p.blocks) || p.blocks.length === 0) continue;
    const slug = p.url.replace(/^\/+|\/+$/g, "");
    if (!slug) continue;
    const blocks = p.blocks.map((b, i) => ({ type: b.type, data: JSON.stringify(deepDecode(b.data ?? {})), order: i }));

    const existing = await db.page.findUnique({ where: { slug } });
    if (existing) {
      await db.block.deleteMany({ where: { pageId: existing.id } });
      await db.page.update({
        where: { id: existing.id },
        data: { title: p.title, metaDescription: p.metaDescription ?? "", published: true, blocks: { create: blocks } },
      });
    } else {
      const count = await db.page.count();
      await db.page.create({
        data: { slug, title: p.title, metaDescription: p.metaDescription ?? "", published: true, showInNav: false, order: count, blocks: { create: blocks } },
      });
    }
    n++;
  }
  console.log("seeded designed pages:", n);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
