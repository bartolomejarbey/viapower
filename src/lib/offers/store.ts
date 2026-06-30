import "server-only";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { OfferSchema, type Offer } from "./schema";
import { SAMPLE_OFFERS } from "./samples";

/** vzor-* ids are built-in code samples and are never written to the DB. */
function isSampleId(id: string): boolean {
  return id.startsWith("vzor-");
}

/**
 * The offer's own `createdAt` is a free-form string (ISO or "15. 3. 2026").
 * Derive a sortable DateTime for the scalar column, falling back to now().
 */
function toDate(value: string | undefined): Date {
  if (value) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

/** Validate+normalize a DB row's JSON payload back into an Offer. */
function fromRow(data: Prisma.JsonValue): Offer | null {
  try {
    return OfferSchema.parse(data);
  } catch {
    return null;
  }
}

export async function listOffers(): Promise<Offer[]> {
  const rows = await db.offer.findMany({ orderBy: { createdAt: "desc" } });

  const fromDb = rows
    .map((r) => fromRow(r.data))
    .filter((o): o is Offer => o !== null);

  const dbIds = new Set(fromDb.map((o) => o.id));
  const samples = SAMPLE_OFFERS.filter((s) => !dbIds.has(s.id));

  return [...fromDb, ...samples].sort((a, b) =>
    (b.createdAt || "").localeCompare(a.createdAt || ""),
  );
}

export async function getOffer(id: string): Promise<Offer | null> {
  const row = await db.offer.findUnique({ where: { id } });
  if (row) {
    const parsed = fromRow(row.data);
    if (parsed) return parsed;
  }
  return SAMPLE_OFFERS.find((s) => s.id === id) ?? null;
}

export async function saveOffer(offer: Offer): Promise<Offer> {
  let parsed = OfferSchema.parse(offer);

  // Built-in vzor-* samples live only in code and must never be written to the
  // DB (a row would permanently shadow the sample AND be undeletable — the
  // delete paths refuse vzor-* ids). Editing a sample therefore CLONES it into
  // a fresh, fully-deletable offer instead of overwriting the example.
  if (isSampleId(parsed.id)) {
    parsed = { ...parsed, id: `nabidka-${nanoid(8)}` };
  }

  const scalars = {
    number: parsed.number ?? "",
    type: parsed.type,
    investorName: parsed.investor?.name ?? "",
    subject: parsed.subject ?? "",
    createdAt: toDate(parsed.createdAt),
    data: parsed as unknown as Prisma.InputJsonValue,
  };

  await db.offer.upsert({
    where: { id: parsed.id },
    create: { id: parsed.id, ...scalars },
    // Don't overwrite createdAt on update — keep the original creation time.
    update: {
      number: scalars.number,
      type: scalars.type,
      investorName: scalars.investorName,
      subject: scalars.subject,
      data: scalars.data,
    },
  });

  return parsed;
}

export async function deleteOffer(id: string): Promise<void> {
  // Refuse to "delete" built-in samples — they only exist in code.
  if (isSampleId(id)) return;
  await db.offer.deleteMany({ where: { id } });
}
