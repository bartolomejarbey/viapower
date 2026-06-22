export const meta = {
  name: 'viapower-deep-cms-audit',
  description: 'Deep multi-agent audit + redesign of live-edit, visual editor, admin, settings IA, and the offers/invoices document generator',
  phases: [
    { title: 'Investigate', detail: '~24 high-effort auditors across live-edit, editor, admin/settings, offers, invoices' },
    { title: 'Verify', detail: 'adversarial verification of fixes + feasibility of designs' },
    { title: 'Synthesize', detail: 'two build sheets: (A) editor/live-edit/admin/settings fixes, (B) offers+invoices generator design' },
  ],
}

const CTX = `
PROJECT: Viapower CMS — Next.js 16 App Router, React 19, Tailwind v4, Prisma 6 + Supabase Postgres, deployed viapower.vercel.app. Repo /Users/adstart_rota/viapower. Real client CMS for a Czech solar company; a non-technical marketing team must run EVERYTHING themselves on desktop.

The owner just gave blunt feedback (act on the INTENT, be opinionated and thorough):
1. LIVE EDITING ("živá editace") is BROKEN in many places — e.g. on CMS pages it highlights/edits nothing. It must either work everywhere or be gracefully scoped. ALSO: it should be launched ONLY from admin (not silently active just because someone is logged in), the persistent bottom edit bar should NOT always be on screen, and the editor + live-edit must be BLOCKED on phones (desktop-only).
2. VISUAL EDITOR is not truly WYSIWYG — e.g. a long list is centered (max-w-3xl mx-auto) on the live site but renders left/full-width in the editor canvas; the client wants the editor to look like the real site, plus SIMPLE controls (e.g. add padding / width / center a block) — a real visual editor. Image fields should have a CROP tool (center / crop / move on upload). New pages cannot be assigned into a nav "family" (e.g. under Služby) — only flat new pages; need parent/menu placement.
3. SETTINGS (Nastavení) are mega unclear / weirdly organized / don't make sense in places — especially marketing TAGS, SEO, Meta Pixel etc. Needs an IA redesign (clear sections/tabs/grouping) + correctness audit of the tag manager (GTM/GA4/Google Ads/Meta Pixel/Sklik/Clarity/consent mode) and SEO.
4. OFFERS (nabídky) generation goes through TWO chat entry points — keep only ONE, the best. The offer page must let the user choose WHAT to generate, upload photos, and make EVERYTHING variable; manual entry must exist; design must be "sick" but NOT graphically over-limited.
5. INVOICES (faktury) — build the SAME module/modum as offers (a document generator), with CZ legal invoice requirements.

KEY FILES:
- Live-edit: src/components/site/admin-edit-bar.tsx (the bottom bar + live mode + image swap), src/app/api/admin/live-text/route.ts, src/components/site/t.tsx (T/tx/setting + Editable), data-edit/data-edit-img attributes live in src/components/home/* and src/components/site/{footer,cta-band,page-hero,announcement-bar}.tsx and (site)/[...slug]/page.tsx. CMS-page blocks render via src/components/site/section-renderer.tsx which has NO data-edit attributes.
- Visual editor: src/components/editor/{visual-editor.tsx, editor-section.tsx, media-picker.tsx}, src/app/admin/editor/[id]/page.tsx, src/lib/blocks.ts (BlockDataMap, 15 block types, bgClass). Public render: section-renderer.tsx. Save: src/app/admin/(panel)/stranky/actions.ts (savePage, createPage, importPageFromPath).
- Admin shell: src/components/admin/sidebar.tsx (now responsive), src/app/admin/(panel)/layout.tsx, panels under src/app/admin/(panel)/{page,stranky,sluzby,cenik,media,nastaveni,poptavky,nabidky}.
- Settings: src/app/admin/(panel)/nastaveni/{settings-form.tsx (FIELDS array ~95 fields incl. type:"image", groups), actions.ts}, src/lib/{company.ts, marketing.ts, cms.ts}, src/components/site/marketing-tags.tsx (consent-aware tag loader), src/config/site.ts.
- Offers: src/app/admin/(panel)/nabidky/{page.tsx, offers-manager.tsx (has a "Vytvořit nabídku přes chat" Link to /admin/nabidky/chat AND a free-text brief textarea -> /api/nabidky/generate — that's the TWO entry points), offer-chat.tsx, offer-editor.tsx, [id]/page.tsx, chat/page.tsx}, src/lib/offers/{schema.ts (Zod OfferSchema), generate.ts, chat.ts, store.ts (Prisma Offer model), pdf.ts (puppeteer-core+@sparticuz/chromium serverless), samples.ts}, src/components/offer/offer-document.tsx (the print/PDF brochure), src/app/(print)/{nabidka/[id]/page.tsx, offer.css}. Offer template art in public/offer-assets/*.png (gpt-image-2). Media upload already works -> Supabase Storage (public bucket "media") via /api/admin/media.

You are a STATIC-ANALYSIS auditor / designer for your assigned scope. READ the real files (don't guess). Do NOT run the dev server or mutate files/DB. Be exhaustive, opinionated, and concrete (file:line + the fix). For design tasks, propose the best architecture for a non-technical client with a premium feel.`

const FINDINGS_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['scope', 'summary', 'findings'],
  properties: {
    scope: { type: 'string' },
    summary: { type: 'string' },
    findings: { type: 'array', items: {
      type: 'object', additionalProperties: false,
      required: ['title', 'severity', 'area', 'file', 'evidence', 'fix'],
      properties: {
        title: { type: 'string' },
        severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
        area: { type: 'string', enum: ['live-edit', 'editor-wysiwyg', 'admin-ux', 'settings-ia', 'offers', 'invoices', 'mobile', 'logic-bug'] },
        file: { type: 'string' },
        evidence: { type: 'string' },
        fix: { type: 'string' },
      },
    } },
  },
}

const auditors = [
  { key: 'le:coverage', p: `Audit WHERE live editing ("živá editace") actually works vs is dead. For EACH page type (homepage sections, CMS [...slug] block pages via section-renderer, reference/career/contact/form template pages, footer/nav/announcement), determine whether [data-edit]/[data-edit-img] exist so live-edit does anything. Confirm the owner's report that CMS pages edit NOTHING. List every dead surface + the concrete fix (e.g. section-renderer should NOT pretend to be live-editable; CMS pages should route to the visual editor instead; OR add data-edit). Read admin-edit-bar.tsx, section-renderer.tsx, t.tsx, the home components, [...slug]/page.tsx.` },
  { key: 'le:gating', p: `Audit + design the GATING of live-edit & the bottom edit bar. Currently admin-edit-bar.tsx shows the bottom bar whenever the user is admin (api/admin/me) and restores live mode from sessionStorage("vp-live"). The owner wants: NO persistent bottom bar just from being logged in; live-edit & "Editor stránky" launched EXPLICITLY from admin only; not auto-resuming. Propose the exact mechanism (e.g. only show the bar when arriving via an admin action / ?edit=1 token / a toggle in /admin, and a way to exit). Keep it secure (still admin-gated). Give the concrete code change to admin-edit-bar.tsx.` },
  { key: 'le:mobile', p: `Design BLOCKING the visual editor + live-edit on phones/tablets (desktop-only). The editor route src/app/admin/editor/[id]/page.tsx and admin-edit-bar.tsx live-mode must refuse small screens with a friendly "otevřete na počítači" message, while the rest of admin stays usable on mobile (sidebar is already responsive). Propose the breakpoint + implementation (CSS hidden below lg + a notice; JS guard for live mode). Concrete code.` },
  { key: 'le:save', p: `Audit live-edit SAVE reliability in admin-edit-bar.tsx: the focusout->changesRef->useEffect flush race (a focused field's last edit can be lost on Save), location.reload() vs router.refresh, image srcset swap. Plus /api/admin/live-text route correctness. List bugs + fixes.` },
  { key: 've:fidelity', p: `Audit WYSIWYG fidelity: the editor canvas (editor-section.tsx EditableSection) vs the public render (section-renderer.tsx) for EVERY block. The owner saw a list centered (max-w-3xl mx-auto) on the live site but left/full-width in the editor. For each block, list layout mismatches (max-width, centering, padding/band, columns, alignment, richtext column width) and the fix to make the canvas mirror the public section. Read editor-section.tsx + section-renderer.tsx + blocks.ts.` },
  { key: 've:controls', p: `Design SIMPLE layout controls a non-technical client needs per block/section: padding (top/bottom) presets, max content width (narrow/normal/wide/full), horizontal alignment/centering, vertical spacing. Propose adding these to the block data model (blocks.ts) + BlockInspector (visual-editor.tsx) + applying them in section-renderer + EditableSection, with sensible Czech labels and presets (not raw px). Give the data fields + UI + render approach. This directly answers "ať může přidávat padding jednoduše a vycentrovat".` },
  { key: 've:crop', p: `Design an image CROP tool (center / crop / move / zoom) for the upload flow used by MediaPicker (src/components/editor/media-picker.tsx) and the image fields. Recommend the lightest robust approach (e.g. react-easy-crop + canvas export of the cropped blob, then upload to /api/admin/media which stores to Supabase Storage), with aspect presets (volné/16:9/4:3/1:1). No model change needed (crop produces a new file). Give the component design + integration points + the npm package + version.` },
  { key: 've:dnd', p: `Audit drag-n-drop + add/reorder/duplicate/delete robustness in visual-editor.tsx (dnd-kit), including per-item reorder (just added), unsaved-changes guard, unknown-block preservation, keyboard a11y, and the palette. List remaining bugs + UX gaps + fixes.` },
  { key: 've:navfamily', p: `Design PAGE NAV PLACEMENT / families. Today a CMS Page with showInNav becomes a FLAT top-level nav item (extraNav); primaryNav is hardcoded in config/site.ts (Služby has a dropdown). The owner wants to assign a new page UNDER a parent (e.g. into the Služby dropdown / a "family"). Propose the minimal model: add navParent/navGroup to Page + a parent picker in PageSettings (visual-editor.tsx) + nav.tsx building nested dropdowns from CMS pages. Read nav.tsx, config/site.ts, stranky/actions.ts, the layout that builds extraNav. Concrete plan.` },
  { key: 'ad:settings-ia', p: `Redesign the SETTINGS information architecture. Read settings-form.tsx (FIELDS ~95 entries, groups). The owner says it's "mega unclear / weird / doesn't make sense". Propose a clear IA: logical top-level sections with tabs/anchored nav (e.g. Vzhled & obrázky, Texty webu, Kalkulačka, Firma & kontakt, SEO, Marketing & sledování, Pokročilé), sensible ordering, splitting/merging groups, hiding advanced/technical ones, plain-Czech labels + help. Give the reorganized group plan + any fields to add/remove/relabel.` },
  { key: 'ad:marketing', p: `Audit the MARKETING TAGS correctness & clarity: src/lib/marketing.ts, src/components/site/marketing-tags.tsx (consent-aware loader, Google Consent Mode v2), the settings keys (mkt.gtm/ga4/googleAds/metaPixel/sklik/clarity, verify.*, mkt.headHtml/bodyHtml). Is GTM vs GA4 handling right (don't double-fire)? Meta Pixel correct? Consent gating correct & compliant? Sklik/Clarity right? Is it clear which field does what? List correctness bugs + clarity fixes + anything missing the marketing agency needs (e.g. LinkedIn, TikTok, conversions, server-side, dataLayer events).` },
  { key: 'ad:seo', p: `Audit SEO settings + implementation: root generateMetadata (src/app/layout.tsx reads seo.title/description/og.image/company.url), homepage static metadata, [...slug] per-page metadata, sitemap.ts, robots.ts, json-ld.tsx, opengraph-image.tsx. Is per-page SEO (title/description/OG) editable where needed (CMS pages have metaDescription; template pages?)? Gaps + fixes. Is the settings SEO section clear?` },
  { key: 'ad:admin-ux', p: `Audit overall ADMIN UX/IA for a non-technical client across all panels (dashboard, stranky, sluzby, cenik, media, nastaveni, poptavky, nabidky): navigation clarity, dashboard usefulness, empty/loading/error states, consistency, discoverability, mobile (sidebar now responsive but check panels). High-value improvements only.` },
  { key: 'ad:logic', p: `Hunt remaining LOGIC bugs across admin server actions + routes (stranky/sluzby/cenik/media/nastaveni/poptavky/nabidky actions + api routes): silent failures, revalidate paths (trailingSlash), unguarded mutations, race conditions, draft pruning, slug collisions. List with file + fix.` },
  { key: 'of:entrypoints', p: `The offers admin has TWO generation entry points (offers-manager.tsx: a "přes chat" Link to /admin/nabidky/chat AND a free-text brief textarea -> /api/nabidky/generate). The owner wants ONE best path. Evaluate both (chat.ts vs generate.ts), recommend keeping the CHAT (most capable) and folding the brief into it OR vice versa, and the exact consolidation. Also assess whether chat + manual editor + generate are coherent.` },
  { key: 'of:variability', p: `Audit what in offer generation is HARDCODED vs editable, and design making EVERYTHING variable on the offer page: choosing what to generate (FVE/TC/klima/combo + sections to include), all fields, technology/system, budget, addons, process/whyUs/manager. Read offer schema.ts, generate.ts, chat.ts, offer-editor.tsx. List what's missing for full variability + the plan.` },
  { key: 'of:photos', p: `Design uploading PHOTOS into an offer (per-offer images: cover photo, reference photos, product shots) rendered in the offer-document.tsx PDF brochure — using the working Supabase media upload. Propose the schema additions (Offer images), the editor UI (MediaPicker), and where they render in the brochure. The current cover/band/closing are static gpt-image-2 PNGs (public/offer-assets) — make them per-offer overridable.` },
  { key: 'of:design', p: `Critique the offer brochure DESIGN (src/components/offer/offer-document.tsx + (print)/offer.css) and propose making it "sick but NOT graphically over-limited": more layout flexibility (sections reorderable/toggleable, accent color, optional pages, photo blocks), while staying premium and print-correct (A4, puppeteer). Concrete design directions + how to make sections variable without breaking the WOW look.` },
  { key: 'of:manual', p: `Audit the MANUAL offer entry (offer-editor.tsx [id] route): is every offer field editable manually incl. budget groups/items/addons/process/whyUs/manager/dates/system/technology? Gaps + fixes so a user can build a full offer with NO AI. Also unsaved-guard + validation + friendly errors.` },
  { key: 'in:model', p: `Design a FAKTURY (invoices) module mirroring the offers generator. Specify the Prisma Invoice model + Zod schema with CZ legal requirements: dodavatel/odberatel (name, address, ICO, DIC), invoice number (ciselna rada), datum vystaveni / DUZP / splatnost, polozky (description, qty, unit, unit price, VAT rate), VAT recap per rate, total with/without VAT, variabilni symbol, bank account/IBAN, payment QR (SPAYD), note, optional "neplatce DPH". Output the model + schema + numbering scheme.` },
  { key: 'in:generate', p: `Design faktury generation + PDF + admin, REUSING the offers architecture (store/pdf/print-route/document component pattern). Specify: invoices list/manager, manual editor (full), optional create-from-offer, the print route + invoice-document component + CSS (clean professional A4 invoice, NOT a brochure), PDF via the same puppeteer-core+@sparticuz/chromium pipeline, Supabase storage of the Invoice rows. Give the file plan + routes + a unified "/admin/dokumenty" structure idea (offers + invoices).` },
  { key: 'in:unify', p: `Propose the UNIFIED document-generator architecture so offers + invoices share infrastructure (shared store/pdf/numbering/media/PDF-render helpers, shared admin shell) without over-coupling two different document types. What to extract/share vs keep separate. Migration-safe plan given offers already exist.` },
  { key: 'br:offers-ux', p: `Brainstorm the IDEAL offer-builder UX for this client (premium solar company): one smart chat that asks for must-haves + lets you attach photos + pick what to generate, seamless handoff to a full visual offer editor with live preview, manual mode, templates, sick flexible design. Describe the end-to-end flow + screens + the "wow" without graphic limitation. Be concrete and ambitious but buildable in this stack.` },
  { key: 'br:vision', p: `Brainstorm the overall ADMIN/CMS vision: what would make this the best self-service CMS for a non-technical Czech solar marketer — settings clarity, true visual editing, documents (offers+invoices), leads, marketing. Prioritize the top 12 improvements by impact/effort. Opinionated.` },
]

phase('Investigate')
const results = await parallel(auditors.map((a) => () =>
  agent(`${CTX}\n\nSCOPE [${a.key}]: ${a.p}`, { label: a.key, phase: 'Investigate', schema: (a.key.startsWith('br:') || a.key === 'of:design') ? undefined : FINDINGS_SCHEMA, effort: 'high' })
))
const tagged = results.map((r, i) => ({ key: auditors[i].key, r })).filter((x) => x.r)
const structured = tagged.filter((x) => x.r && typeof x.r === 'object' && Array.isArray(x.r.findings))
const textOut = tagged.filter((x) => typeof x.r === 'string')
const allFindings = structured.flatMap((x) => x.r.findings.map((f) => ({ ...f, scope: x.key })))
log(`Collected ${allFindings.length} findings + ${textOut.length} design memos`)

phase('Verify')
const byArea = {}
for (const f of allFindings) (byArea[f.area] ??= []).push(f)
const VERDICT = { type: 'object', additionalProperties: false, required: ['area', 'confirmed', 'rejected'],
  properties: { area: { type: 'string' },
    confirmed: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['title','severity','file','fix'], properties: { title:{type:'string'}, severity:{type:'string',enum:['critical','high','medium','low']}, file:{type:'string'}, fix:{type:'string'} } } },
    rejected: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['title','reason'], properties: { title:{type:'string'}, reason:{type:'string'} } } } } }
const verifyAreas = Object.keys(byArea)
const verdicts = await parallel(verifyAreas.map((area) => () =>
  agent(`${CTX}\n\nADVERSARIAL VERIFY the "${area}" findings — READ the cited files, confirm each is real & the fix is correct, reject false positives, refine fixes. Add any critical ${area} issue the auditors missed.\n\nFINDINGS:\n${JSON.stringify(byArea[area])}`, { label: `verify:${area}`, phase: 'Verify', schema: VERDICT, effort: 'high' })
))

phase('Synthesize')
const designMemos = textOut.map((x) => `### ${x.key}\n${x.r}`).join('\n\n')
const [planA, planB] = await parallel([
  () => agent(`${CTX}\n\nSYNTHESIZE BUILD SHEET A — editor / live-edit / admin / settings. Merge the verified findings into ONE prioritized, deduped, implementation-ready plan with concrete file edits. Lead with the owner's explicit demands: (1) live-edit broken-everywhere fix + admin-only gating + remove persistent bottom bar + mobile block; (2) editor WYSIWYG fidelity + simple padding/width/center controls; (3) settings IA redesign (tags/SEO/pixel clarity); (4) image crop tool; (5) nav family/parent. Sections by theme, severity-ordered, each item: title, file(s), concrete fix. End with an ordered implementation sequence.\n\nVERIFIED FINDINGS:\n${JSON.stringify(verdicts)}\n\nDESIGN MEMOS:\n${designMemos}`, { label: 'synth:editor-admin', phase: 'Synthesize', effort: 'high' }),
  () => agent(`${CTX}\n\nSYNTHESIZE BUILD SHEET B — OFFERS + INVOICES document generator. Produce a concrete, ambitious-but-buildable plan: consolidate offers to ONE best chat path; make offer generation fully variable (types, sections, all fields, PHOTO uploads via Supabase media) with a sick-but-flexible brochure; full manual entry; THEN the faktury (invoices) module mirroring offers with CZ legal fields + clean invoice PDF + (optional) create-from-offer; and the unified /admin/dokumenty architecture sharing store/pdf/numbering. Give the data models (Prisma + Zod), routes/files, UI flow, and an ordered build sequence. Be specific.\n\nVERIFIED FINDINGS:\n${JSON.stringify(verdicts.filter((v)=>['offers','invoices'].includes(v.area)))}\n\nDESIGN MEMOS:\n${designMemos}`, { label: 'synth:offers-invoices', phase: 'Synthesize', effort: 'high' }),
])

return { planA, planB, totalFindings: allFindings.length, verdicts }
