# Viapower — předání projektu

Kompletní přestavba webu **viapower.cz** do Next.js + refresh brandu (červená/černá/bílá),
vlastní **admin/CMS** a **generátor cenových nabídek (PDF)**. Postaveno autonomně v jedné
session; tenhle dokument je mapa toho, co je hotové, jak to spustit a co dodělat.

> **Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind v4 ·
> Prisma 6 + SQLite (lokálně) · Playwright (PDF) · OpenAI (volitelně, generátor nabídek).

---

## 1) Jak to spustit

```bash
npm install
npx prisma migrate deploy          # vytvoří databázi (prisma/dev.db)
DATABASE_URL="file:./dev.db" ADMIN_EMAIL="admin@viapower.cz" ADMIN_PASSWORD="<vaše-heslo>" npx tsx prisma/seed.ts
npx playwright install chromium    # jen kvůli generování PDF nabídek
npm run dev                        # http://localhost:3000
```

- **Web:** http://localhost:3000
- **Admin:** http://localhost:3000/admin  (odkaz je i v patičce webu)
- **Přihlášení:** `admin@viapower.cz` · heslo dle `ADMIN_PASSWORD` v `.env.local` (změň po nasazení — viz Bezpečnost)

Produkční build: `npm run build && npm run start`.

---

## 2) Co je hotové — tři pilíře

### A) Web (Next.js, refresh brandu) ✅
- **Design systém** v `src/app/globals.css` (Tailwind v4 tokeny): černá báze, dominantní
  červená `#FF1830`, bílý text; fonty **Space Grotesk + JetBrains Mono** (s diakritikou).
- **Homepage** (`src/app/(site)/page.tsx`) — fullscreen hero s pozadím + živý „dashboard",
  statistiky (count-up), balíčky FVE, služby, bento galerie realizací, dotační banner,
  proces, FAQ, kontaktní formulář. Hodně animací (framer-motion), responsivní.
- **Všech ~52 původních URL** zachováno. Obsah byl vytěžen z živého webu do
  `data/viapower-content.json` a renderuje se přes catch-all `src/app/(site)/[...slug]/page.tsx`,
  který podle typu stránky volí šablonu (služba, reference, kariéra, kontakt, formulář,
  právní, poděkování, generická). Interaktivní **kalkulačka** na `/kalkulacka/`.
- **SEO:** per-page `<title>`/description z původního webu, `trailingSlash` (URL 1:1),
  `sitemap.xml`, `robots.txt`, JSON-LD (Organization/LocalBusiness/WebSite), kanonické URL.

### C) Generátor nabídek (PDF) ✅
- Datový model nabídky (Zod) v `src/lib/offers/schema.ts` podle reálných nabídek Viapower.
- **Branded A4 PDF šablona** (`src/components/offer/offer-document.tsx` + `(print)/offer.css`):
  dramatická černo-červená titulka + čisté bílé vnitřní strany (popis technologie, rozpočet
  s DPH 12 %, doplňky, proces, proč od nás, kontakt na projektového manažera).
- **PDF se generuje přes headless Chromium** (Playwright) z tiskové route `/nabidka/[id]/`.
- **LLM adaptér** (`src/lib/offers/generate.ts`): z volného zadání (nebo složky klienta)
  vytvoří strukturovanou nabídku — OpenAI (default), bez klíče má fallback na vzorová data.
- Vzorové nabídky (reálná data) v `src/lib/offers/samples.ts`. V adminu (Nabídky) jde
  nabídku **vygenerovat ze zadání, zobrazit náhled a stáhnout PDF**.

### B) Admin / CMS „loveable style" ✅ (maximální rozsah)
- **Vlastní DB** (Prisma + SQLite), žádné JSON bláto jako Elementor — typované entity.
- **Přihlášení** (JWT v httpOnly cookie, edge middleware chrání `/admin`).
- **Přehled** (dashboardy + poslední poptávky).
- **Služby** — CRUD + **drag-n-drop** řazení; promítá se na homepage.
- **Ceník** — CRUD balíčků (parametry, cena, „doporučujeme") + DnD; promítá se na homepage.
- **Živá editace na webu** (Lovable režim) — v editační liště dole na webu je přepínač
  **„Živá editace“**. Po zapnutí jsou všechny texty homepage i dalších sekcí (hero, statistiky,
  proč, balíčky, služby, galerie, dotace, proces, FAQ, kontakt, patička, oznamovací pruh)
  **editovatelné kliknutím přímo na stránce** — klient píše do skutečného webu. Obrázky
  (hero pozadí, dlaždice galerie) se mění kliknutím přes knihovnu médií. Plovoucí panel
  „Uložit / Zahodit“ uloží změny do Settings (`/api/admin/live-text`) a projeví se okamžitě.
- **Vizuální editor stránek** (`/admin/editor/[id]`) — plnohodnotný WYSIWYG canvas ve stylu
  Lovable: paleta elementů (nadpis, text, obrázek, CTA, citace, výhody, obrázek+text,
  balíčky/ceník, mezera) i **hotových sekcí**, **drag & drop** i klik-pro-přidání, **inline
  editace přímo v náhledu** (Tiptap), výběr obrázků z knihovny médií, pravý panel
  s nastavením bloku i stránky (slug, SEO, menu, publikace, smazání). Nová stránka se
  po publikaci volitelně **sama přidá do navbaru**.
- **Převzetí existujících stránek** — kterákoli migrovaná stránka webu jde jedním klikem
  („Stránky → Stránky webu k převzetí“, nebo tlačítkem **Upravit stránku** v editační liště
  přímo na webu) převést na editovatelné bloky; publikovaná CMS verze pak přebije
  migrovaný snapshot na stejné URL. Žádný black box.
- **Nastavení** — úprava textů napříč webem (oznamovací pruh, hero, závěrečná výzva).
- **Média** — nahrávání obrázků do `public/uploads/`, knihovna, kopírování URL.
- **Poptávky** — formuláře z webu se ukládají do DB a zobrazují tady.
- **Nabídky** — generátor PDF (pilíř C) napojený do adminu.
- **On-site editační lišta** — přihlášenému adminovi se na webu dole zobrazí lišta s rychlými
  odkazy do editace (loveable feeling). Veřejné stránky zůstávají staticky generované.

---

## 3) Struktura projektu (orientace)

```
src/
  app/
    (site)/            # veřejný web (nav + patička), homepage, catch-all stránky
    (print)/nabidka/   # tisková A4 route pro PDF nabídky
    admin/             # login + (panel) s CRUD obrazovkami
    api/               # lead, admin login/logout/me/media, nabidky (list/generate/pdf)
    sitemap.ts robots.ts not-found.tsx
  components/ site/ home/ ui/ admin/ offer/
  lib/      content.ts cms.ts db.ts auth.ts auth-core.ts utils.ts offers/*
  config/site.ts       # firemní údaje + výchozí navigace
prisma/schema.prisma   # datový model CMS
data/viapower-content.json  # vytěžený obsah původního webu (zdroj migrace)
```

---

## 4) Co dodělat / známé mezery

1. **Reálné fotky — HOTOVO.** Vytaženy z `data-src`/`srcset` živého webu (lazy-load držel
   reálné URL i v JS-rendered HTML) a uložené v `public/img/real/` (hero, dronové snímky
   instalací ZŠ Koloděje / Mountfield / Třemošná, tým…). Zapojené v hero, galerii realizací,
   referenčních kartách, hlavičkách stránek, titulce PDF nabídky i kariéře. Další/lepší fotky
   stačí nahrát přes admin → Média, nebo přidat do `public/img/real/` a změnit cestu.
2. **Nasazení + DB.** Lokálně běží na SQLite. Pro produkci: Vercel + Postgres (Supabase/Neon) —
   v `prisma/schema.prisma` přepnout `provider = "postgresql"` a nastavit `DATABASE_URL`.
   PDF generování přes Playwright na Vercelu vyžaduje `@sparticuz/chromium` (serverless build);
   na běžném Node/VPS funguje rovnou.
3. **Inline editace přímo v textu** (klik-a-piš na živé stránce) je teď řešená přes editační
   lištu + admin editory. Plné in-place WYSIWYG je možné rozšíření.
4. **Duplicitní legacy landing pages** (`hlavni-stranka-2`, `nova-dopadova-stranka`, …) jsou
   zachované 1:1 kvůli SEO. Zvážit kanonizaci na hlavní verze.
5. **Migrace nabídek do DB** — teď jsou v `data/offers/*.json` (souborové úložiště). Lze přesunout
   do Prisma modelu pro jednotné prostředí.
6. **`middleware.ts`** Next 16 označuje jako deprecated ve prospěch `proxy.ts` — funguje,
   ale do budoucna přejmenovat.

---

## 5) Bezpečnost — DŮLEŽITÉ

- **Rotuj klíče, které jsi vložil do chatu** — GitHub token i OpenAI klíč jsou kompromitované
  (byly v plaintextu). Vygeneruj nové. OpenAI klíč je uložen v `.env.local`, který je v
  `.gitignore` (nikdy se nedostane do gitu).
- **Změň admin heslo** (`ADMIN_PASSWORD` v `.env.local`, pak re-seed nebo změna v DB) a
  `SESSION_SECRET` před nasazením.
- `.env`, `.env.local`, `prisma/dev.db`, `public/uploads/` jsou v `.gitignore`.

---

## 6) Proměnné prostředí (`.env.local`)

```
OPENAI_API_KEY=...        # generátor nabídek (runtime, volitelné)
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o          # uprav na požadovaný model
DATABASE_URL="file:./dev.db"
ADMIN_EMAIL=admin@viapower.cz
ADMIN_PASSWORD=...        # ZMĚŇ
SESSION_SECRET=...        # náhodný 64-hex, ZMĚŇ pro produkci
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 7) Demo obsah

V DB je ukázková publikovaná stránka **„Akční nabídka jaro 2026"** (`/akce-jaro/`, je i v menu)
a testovací poptávka — ukazují funkční CMS. Klidně smaž v adminu (Stránky / Poptávky).
