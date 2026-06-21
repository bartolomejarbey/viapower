import "server-only";
import { nanoid } from "nanoid";
import { OfferSchema, DEFAULT_PROCESS, DEFAULT_WHY_US, type Offer, type OfferType } from "./schema";
import { SAMPLE_FVE } from "./samples";

const MANAGER = { name: "Ing. Viktor Kádek, M.Sc.", role: "Projektový manažer", phone: "724 678 904", email: "viktor.kadek@viapower.cz" };

const SYSTEM_PROMPT = `Jsi asistent firmy VIAPOWER s.r.o. (fotovoltaika, baterie, tepelná čerpadla, wallbox). Z dodaného zadání vytvoříš strukturovanou cenovou nabídku ve formátu JSON.

Vrať POUZE validní JSON objekt (žádný markdown, žádné komentáře) s tímto tvarem:
{
  "type": "FVE" | "TC" | "KLIMA" | "COMBO",
  "subject": "krátký předmět nabídky, např. 'Realizace FVE na klíč s garancí dotací.'",
  "investor": { "name": "jméno zákazníka nebo ''", "contact": "email/telefon nebo ''" },
  "location": "místo realizace nebo ''",
  "validUntil": "datum platnosti, např. '30. 6. 2026'",
  "technology": { "summary": "popis technologie, lze použít **tučně**, oddělené odstavce dvěma novými řádky", "bullets": ["volitelné odrážky parametrů (hlavně pro TČ)"], "annualProductionMWh": 11 },
  "system": { "powerKwp": 9.9, "panels": {"count":18,"brand":"AIKO Neostar 3P60","wattPeak":550}, "battery": {"capacityKwh":15,"model":"GoodWe Lynx D","modules":3}, "inverter": {"model":"GoodWe GW10K-ET-20","kw":10} },
  "budget": {
    "installedPowerKwp": 9.9, "batteryKwh": 15, "vatRate": 12,
    "groups": [
      { "title": "Hlavní materiál", "items": [ {"name":"FV panely","detail":"AIKO 550 Wp","qty":18,"priceNoVat":44712} ] },
      { "title": "Další materiál a práce", "items": [ {"name":"Elektroinstalační práce","detail":"","qty":1,"priceNoVat":18700} ] }
    ],
    "included": ["Vypracování projektové dokumentace DSP", "Administrativa, vedení projektu, povolení distributora"]
  },
  "addons": [ {"name":"Chytré řízení INFIGY","priceWithVat":15000} ]
}

Pravidla:
- Ceny v Kč jako čísla bez mezer. priceNoVat je cena bez DPH. DPH je vždy 12 % (vatRate: 12).
- Pokud zadání neuvádí konkrétní ceny, použij realistické tržní ceny pro daný výkon (orientačně FVE 9,9 kWp + 15 kWh ≈ 311 000 Kč bez DPH).
- Pole "process", "whyUs" a "manager" NEVYPLŇUJ — doplní se automaticky.
- Piš česky, profesionálně, věcně.`;

export type LLMDraft = Partial<Offer> & { type?: OfferType };

async function callOpenAI(brief: string): Promise<LLMDraft> {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const res = await client.chat.completions.create({
    model: process.env.LLM_MODEL || "gpt-4o",
    response_format: { type: "json_object" },
    temperature: 0.3,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: brief },
    ],
  });
  const content = res.choices[0]?.message?.content ?? "{}";
  return JSON.parse(content) as LLMDraft;
}

/**
 * Generate a structured Offer from a free-text brief (or a client-folder digest).
 * Provider-agnostic; OpenAI by default. Falls back to a copy of the flagship
 * sample when no API key is configured, so the pipeline is always testable.
 */
export async function generateOfferFromBrief(brief: string): Promise<Offer> {
  const id = `nabidka-${nanoid(8)}`;
  let draft: LLMDraft;

  if (!process.env.OPENAI_API_KEY) {
    // No key: return the flagship sample shape so the UI/PDF still works.
    draft = { ...SAMPLE_FVE, subject: brief.slice(0, 120) || SAMPLE_FVE.subject };
  } else {
    draft = await callOpenAI(brief);
  }

  return buildOfferFromDraft(draft, id);
}

/** Merge an LLM/partial draft into a complete, validated Offer (defaults for
 * process / whyUs / manager / id / number / createdAt). Shared by the brief
 * generator and the conversational chat builder. */
export function buildOfferFromDraft(draft: LLMDraft, id = `nabidka-${nanoid(8)}`): Offer {
  const type = (draft.type as OfferType) || "FVE";
  const merged = {
    ...draft,
    id,
    number: draft.number || `CN-${id.slice(-4).toUpperCase()}`,
    createdAt: draft.createdAt || new Date().toISOString().slice(0, 10),
    process: draft.process && draft.process.length ? draft.process : DEFAULT_PROCESS[type] ?? DEFAULT_PROCESS.FVE,
    whyUs: draft.whyUs && draft.whyUs.length ? draft.whyUs : DEFAULT_WHY_US,
    manager: draft.manager ?? MANAGER,
  };
  return OfferSchema.parse(merged);
}
