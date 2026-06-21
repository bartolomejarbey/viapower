import "server-only";
import { buildOfferFromDraft, type LLMDraft } from "./generate";
import { saveOffer } from "./store";

export type ChatMsg = { role: "user" | "assistant"; content: string };
export type ChatResult = { reply: string; missing: string[]; ready: boolean; offerId?: string };

const CHAT_SYSTEM = `Jsi asistent firmy VIAPOWER s.r.o. (fotovoltaika, baterie, tepelná čerpadla, wallbox). Tvým úkolem je v PŘÁTELSKÉM ČESKÉM ROZHOVORU s obchodníkem postupně sesbírat údaje a sestavit profesionální cenovou nabídku. Jsi struční, věcní a milí.

POVINNÉ (MUST-HAVE) údaje, bez kterých nabídku NESMÍŠ vygenerovat:
1. Typ nabídky: FVE / TČ / klimatizace / kombinace.
2. Jméno investora (zákazníka).
3. Místo realizace (obec/adresa).
4. Konfigurace systému podle typu:
   • FVE: výkon (kWp), panely (počet, značka, Wp), baterie (kapacita kWh, model) — pokud má být, střídač (model, kW).
   • TČ: model/výkon tepelného čerpadla.
   • Klimatizace: počet a typ jednotek.
5. Ceny: buď konkrétní položky rozpočtu s cenami, NEBO výslovný souhlas obchodníka, že máš doplnit orientační tržní ceny.
6. Platnost nabídky (datum).
Doporučené (ne nutné): kontakt na investora, předmět nabídky, roční výroba, doplňky.

JAK VEDEŠ ROZHOVOR:
- Na začátku krátce přivítej a zeptej se na to nejdůležitější. Ptej se po malých dávkách (1–3 věci najednou), ne na všechno naráz.
- Po každé odpovědi shrň, co už máš, a JASNĚ upozorni, co ještě CHYBÍ z povinných údajů (vypiš to do pole "missing").
- Když obchodník nemá ceny, sám nabídni: „Mám doplnit orientační tržní ceny podle výkonu?“ a po souhlasu je doplň (realisticky, FVE 9,9 kWp + 15 kWh ≈ 311 000 Kč bez DPH).
- Teprve když máš VŠECHNY povinné údaje (nebo souhlas s odhady cen), nastav "ready": true a vyplň "offer".

VÝSTUP: vždy vrať POUZE validní JSON objekt (žádný markdown) v tomto tvaru:
{
  "reply": "tvoje zpráva do chatu, česky",
  "missing": ["seznam stále chybějících POVINNÝCH údajů, prázdné když nic nechybí"],
  "ready": false,
  "offer": null
}
Když je vše hotové, nastav "ready": true a "offer" vyplň přesně takto:
"offer": {
  "type": "FVE",
  "subject": "krátký předmět, např. 'Realizace FVE na klíč s garancí dotací.'",
  "investor": { "name": "...", "contact": "... nebo ''" },
  "location": "...",
  "validUntil": "30. 6. 2026",
  "technology": { "summary": "popis technologie, lze **tučně**, odstavce oddělené dvěma novými řádky", "bullets": [], "annualProductionMWh": 11 },
  "system": { "powerKwp": 9.9, "panels": {"count":18,"brand":"AIKO Neostar 3P60","wattPeak":550}, "battery": {"capacityKwh":15,"model":"GoodWe Lynx D","modules":3}, "inverter": {"model":"GoodWe GW10K-ET-20","kw":10} },
  "budget": { "installedPowerKwp": 9.9, "batteryKwh": 15, "vatRate": 12,
    "groups": [ {"title":"Hlavní materiál","items":[{"name":"FV panely","detail":"AIKO 550 Wp","qty":18,"priceNoVat":44712}]}, {"title":"Další materiál a práce","items":[{"name":"Elektroinstalační práce","detail":"","qty":1,"priceNoVat":18700}]} ],
    "included": ["Vypracování projektové dokumentace DSP","Administrativa, vedení projektu, povolení distributora"] },
  "addons": [ {"name":"Chytré řízení INFIGY","priceWithVat":15000} ]
}
Pravidla: ceny jsou čísla v Kč bez mezer; priceNoVat = bez DPH; DPH vždy 12 %. Pole "process", "whyUs", "manager", "id", "number" NEVYPLŇUJ — doplní se automaticky. Když v "reply" potvrzuješ hotovou nabídku, krátce ji shrň (typ, výkon, cena s DPH).

ROZPOČET MUSÍ BÝT KOMPLETNÍ A REALISTICKÝ — nikdy nevracej jen pár položek. U FVE vždy rozepiš všechny obvyklé položky:
• skupina "Hlavní materiál": FV panely, střídač, baterie (pokud je), konstrukční systém;
• skupina "Další materiál a práce": rozvaděč AC/back-up, rozvaděč DC, kompletní kabeláž, elektroinstalační práce, konstrukční práce, uvedení do provozu a zaškolení, revizní zpráva, realizační dokumentace, úprava odběrného místa, doprava.
Celková cena bez DPH musí odpovídat trhu: FVE 8–10 kWp s baterií ≈ 280 000–340 000 Kč bez DPH, 5–6 kWp bez baterie ≈ 150 000–190 000 Kč. Jednotkové ceny zvol tak, aby součet vyšel realisticky.`;

type Envelope = { reply?: string; missing?: string[]; ready?: boolean; offer?: LLMDraft | null };

export async function chatOffer(messages: ChatMsg[]): Promise<ChatResult> {
  if (!process.env.OPENAI_API_KEY) {
    return { reply: "Chatbot vyžaduje nastavený OPENAI_API_KEY v prostředí. Zatím můžete nabídku vytvořit přes „Vygenerovat ze zadání“ nebo ručně v editoru.", missing: [], ready: false };
  }
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const res = await client.chat.completions.create({
    model: process.env.LLM_MODEL || "gpt-4o",
    response_format: { type: "json_object" },
    temperature: 0.4,
    messages: [
      { role: "system", content: CHAT_SYSTEM },
      ...messages.slice(-20).map((m) => ({ role: m.role, content: m.content })),
    ],
  });

  let env: Envelope = {};
  try { env = JSON.parse(res.choices[0]?.message?.content ?? "{}") as Envelope; } catch { /* keep defaults */ }

  const reply = env.reply?.trim() || "Pokračujme — co dalšího k nabídce doplníme?";
  const missing = Array.isArray(env.missing) ? env.missing.filter((x) => typeof x === "string") : [];

  if (env.ready && env.offer) {
    try {
      const offer = buildOfferFromDraft(env.offer);
      await saveOffer(offer);
      return { reply, missing: [], ready: true, offerId: offer.id };
    } catch {
      return { reply: `${reply}\n\n⚠️ Nepodařilo se sestavit nabídku z dat — zkontrolujme prosím ještě ceny a parametry.`, missing, ready: false };
    }
  }
  return { reply, missing, ready: false };
}
