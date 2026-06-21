import "server-only";
import fs from "node:fs";
import path from "node:path";
import { OfferSchema, type Offer } from "./schema";
import { SAMPLE_OFFERS } from "./samples";

const DIR = path.join(process.cwd(), "data", "offers");

function ensureDir() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
}

export function listOffers(): Offer[] {
  ensureDir();
  const fromFiles: Offer[] = fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      try {
        return OfferSchema.parse(JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")));
      } catch {
        return null;
      }
    })
    .filter((o): o is Offer => o !== null);

  const fileIds = new Set(fromFiles.map((o) => o.id));
  const samples = SAMPLE_OFFERS.filter((s) => !fileIds.has(s.id));
  return [...fromFiles, ...samples].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

export function getOffer(id: string): Offer | null {
  ensureDir();
  const file = path.join(DIR, `${id}.json`);
  if (fs.existsSync(file)) {
    try {
      return OfferSchema.parse(JSON.parse(fs.readFileSync(file, "utf8")));
    } catch {
      return null;
    }
  }
  return SAMPLE_OFFERS.find((s) => s.id === id) ?? null;
}

export function saveOffer(offer: Offer): Offer {
  ensureDir();
  const parsed = OfferSchema.parse(offer);
  fs.writeFileSync(path.join(DIR, `${parsed.id}.json`), JSON.stringify(parsed, null, 2), "utf8");
  return parsed;
}

export function deleteOffer(id: string): void {
  const file = path.join(DIR, `${id}.json`);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}
