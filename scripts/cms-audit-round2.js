export const meta = {
  name: 'viapower-deep-audit-r2',
  description: 'Round 2: regression re-audit of the shipped editor/live-edit/admin changes + deeper drag-n-drop/admin coverage + detailed offers/invoices build specs',
  phases: [
    { title: 'Investigate', detail: '~24 high-effort agents: verify shipped fixes, hunt remaining/regressed issues, spec offers+invoices' },
    { title: 'Verify', detail: 'adversarial verification of confirmed issues' },
    { title: 'Synthesize', detail: 'prioritized fix list + ready-to-build offers/invoices specs' },
  ],
}

const CTX = `
PROJECT: Viapower CMS — Next.js 16 App Router, React 19, Tailwind v4, Prisma 6 + Supabase Postgres, LIVE viapower.vercel.app. Repo /Users/adstart_rota/viapower. Non-technical Czech solar marketer must run everything on desktop.

CONTEXT — a first 34-agent audit already ran and MANY fixes were SHIPPED and deployed this session. Your job now is round 2: (a) VERIFY the shipped fixes actually work and find REGRESSIONS they introduced, (b) hunt REMAINING issues at deeper granularity, (c) produce ready-to-build specs for the offers + invoices work.

SHIPPED ALREADY (verify these, don't re-propose):
- Live-edit gating: src/components/site/admin-edit-bar.tsx now renders only when admin && ?edit=1 && innerWidth>=1024; no persistent bar; "Upravit web naživo" launcher in sidebar; CMS pages (no [data-edit]) show a hint to use "Editor stránky"; save uses input-listener + router.refresh + flushActive; live-text route normalizes trailing slash.
- Editor mobile block: src/components/editor/desktop-gate.tsx wraps the editor route.
- WYSIWYG layout system: src/lib/blocks.ts has Layout type + padClass/widthClass/isCenter/getLayout; per-block optional layout field; LayoutControls in visual-editor.tsx BlockInspector (Šířka/Zarovnání/Odsazení); applied in section-renderer.tsx (band(bg,layout,extra,padFallback) + inner(layout,fallback)) AND the editor canvas (CanvasBlock width frame + SectionHead via isCenter). richtext now narrow in canvas.
- Nav families: Page.navParent column + navGroups in config/site.ts; placement <select> in PageSettings (visual-editor.tsx); nested nav tree built in src/app/(site)/layout.tsx, SiteNav now takes nav prop.
- Page.noindex column + checkbox; per-page OG + homepage SEO from seo.* (removed homepage static metadata); sitemap.ts/robots.ts use getCompany().url.
- Calculator: src/lib/calc.ts (pure computeCalc) + calc.server.ts (getCalcConfig from calc.* settings + Ceník packages); offers consolidated to chat + createManualOffer (src/app/admin/(panel)/nabidky/actions.ts).
- Crop tool: src/components/editor/crop-modal.tsx (react-easy-crop) in media-picker.tsx upload flow.
- Marketing: marketing-tags.tsx now mutually-exclusive (GTM container OR individual tags, never both).

OFFERS/INVOICES current state: src/lib/offers/{schema.ts,generate.ts,chat.ts,store.ts (Prisma Offer model),pdf.ts (puppeteer-core+@sparticuz/chromium),samples.ts}; src/components/offer/offer-document.tsx (A4 brochure) + src/app/(print)/{nabidka/[id]/page.tsx,offer.css}; admin src/app/admin/(panel)/nabidky/{page,offers-manager,offer-editor,offer-chat,chat,[id]}. Media upload works → Supabase Storage public bucket "media" via /api/admin/media. NO invoices module exists yet.

You are a STATIC-ANALYSIS auditor/designer for your scope. READ real files (don't guess). Do NOT run the dev server or mutate files/DB. Be exhaustive, adversarial, concrete (file:line + fix). For spec tasks, give buildable detail (schemas, files, component structure).`

const FINDINGS_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['scope', 'summary', 'findings'],
  properties: {
    scope: { type: 'string' }, summary: { type: 'string' },
    findings: { type: 'array', items: {
      type: 'object', additionalProperties: false,
      required: ['title', 'severity', 'kind', 'file', 'evidence', 'fix'],
      properties: {
        title: { type: 'string' },
        severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
        kind: { type: 'string', enum: ['regression', 'remaining-bug', 'dnd', 'live-edit', 'wysiwyg', 'admin-ux', 'mobile', 'correctness', 'polish'] },
        file: { type: 'string' }, evidence: { type: 'string' }, fix: { type: 'string' },
      },
    } },
  },
}

const auditors = [
  { key: 'verify:layout-system', p: `VERIFY the new WYSIWYG layout system end-to-end + hunt regressions. Read blocks.ts (padClass/widthClass/isCenter/inner helpers), section-renderer.tsx (band signature change + every inner(layout,fallback) call + the replace_all edits), editor-section.tsx, visual-editor.tsx (CanvasBlock frame + LayoutControls). Confirm: absent-layout pages render byte-identical to before (back-compat); padFallback for richtext/stats correct; no block lost its band/width; align/center works; the canvas frame width matches the public fallback per block. Flag any block where the replace_all edits hit the wrong element or a width/padding broke.` },
  { key: 'verify:live-edit', p: `VERIFY the live-edit gating + behavior + hunt regressions. Read admin-edit-bar.tsx fully. Confirm: bar only on admin && ?edit=1 && desktop; input-listener keeps changeCount live; flushActive on save; the hasEditable hint logic; image swap (srcset removal); exit drops ?edit=1; router.refresh keeps edit mode. Find any case where edit mode leaks, the bar shows when it shouldn't, or a [data-edit] surface still silently fails. Enumerate EVERY page/route and whether live-edit now works or correctly defers to the editor.` },
  { key: 'verify:nav-family', p: `VERIFY the nav-family feature end-to-end. Read config/site.ts (navGroups), stranky/actions.ts (PageMeta navParent/noindex + savePage), visual-editor.tsx PageSettings placement select, layout.tsx nested-tree builder, nav.tsx (nav prop). Confirm a page set "Pod Služby" actually appears in the Služby dropdown (desktop + mobile drawer), top-level works, and Nezobrazovat hides it. Flag edge cases: parent href mismatch, ordering, a CMS page whose own href equals a group href, duplicate labels, the createPage default.` },
  { key: 'audit:dnd-deep', p: `DEEP adversarial audit of drag-and-drop in visual-editor.tsx: the off-by-one InsertSlot vs sortable overlap (collisionDetection, resolveIndex, onDragEnd index math), palette click-add vs drag, the per-item ArrowUp/Down (ItemChrome) move, grip listeners vs click select double-fire, keyboard a11y, block-id scheme (blk-i vs nanoid), drop near edges, dragging the first/last block, unknown-block preservation during reorder. Reproduce each glitch in code with file:line and give the concrete fix.` },
  { key: 'audit:editor-blocks-a', p: `Re-audit editor↔public parity for blocks: hero, heading, richtext, imagetext, features (post layout-system). For each, compare editor-section.tsx vs section-renderer.tsx for any REMAINING visual/structural mismatch (icon rendering, columns, accent, image aspect, button rendering) and any field still not editable. Concrete fixes.` },
  { key: 'audit:editor-blocks-b', p: `Re-audit editor↔public parity for blocks: steps, stats, pricing, gallery, testimonials, faq, logos, cta, leadform, spacer. For each, compare editor-section.tsx vs section-renderer.tsx for REMAINING mismatches + non-editable fields (e.g. leadform field config, cta link cue, spacer parity, logos marquee). Concrete fixes.` },
  { key: 'audit:admin-stranky', p: `Audit the Stránky panel + page lifecycle deeply: src/app/admin/(panel)/stranky/{page.tsx,actions.ts,nova/page.tsx,importable.ts}. createPage seeds, draft prune, slug collision suffix surfacing, takeover/import, publish/delete from the list (missing?), the ?special template banner, jargon. Concrete fixes + the missing list-level publish/delete toggles.` },
  { key: 'audit:admin-managers', p: `Audit the Služby + Ceník + Média managers (services-manager.tsx, packages-manager.tsx, media-manager.tsx + their actions): every control, error handling, reorder, the cenik specs textarea fragility, media delete/alt/copy-url framing, search/empty states. Concrete fixes.` },
  { key: 'audit:admin-dashboard', p: `Audit the admin dashboard + shell + sidebar (src/app/admin/(panel)/page.tsx, layout.tsx, components/admin/sidebar.tsx): task-hub vs vanity stats, missing loading.tsx/error.tsx, lead read/unread state, sidebar grouping, mobile. Propose the concrete high-value improvements (Lead.read column + unread badge, loading/error routes, dashboard CTAs).` },
  { key: 'audit:settings-correctness', p: `Audit settings correctness post-changes: settings-form.tsx (image fields, calc.* group, GTM help), actions.ts (no key whitelist), marketing-tags.tsx (consent default, the now-mutually-exclusive tags, custom head/body consent-gating breaking CMP), cookie-consent.tsx (all-or-nothing vs granular). Flag the real correctness bugs (Ads conversion label missing, consent granularity, custom-code consent gating) with concrete fixes.` },
  { key: 'audit:calc-crop-verify', p: `Verify calculator + crop. calc.ts/calc.server.ts/calculator.tsx/hero.tsx: formula correctness (savings cap, feed-in, package selection from Ceník when powerKwp/battery are Czech strings, fallback when Ceník empty), edge cases (monthly extremes). crop-modal.tsx/media-picker.tsx: aspect not threaded per slot (3.1), object-URL leaks, multi-file, the canvas export quality/mime, "use original" path. Concrete fixes.` },
  { key: 'audit:mobile-admin', p: `Audit mobile across admin: the editor DesktopGate (does it truly block + keep logout reachable?), which editing-heavy panels (Nastavení, Nabídky managers, offer-editor) are still fluid on phones and should be gated, and whether the public site live-edit is fully blocked on phones. Concrete gating plan reusing DesktopGate.` },
  { key: 'audit:perf-a11y', p: `Audit accessibility + performance of the admin + editor: keyboard nav, aria labels (dnd, pickers, toggles), focus management in modals (MediaPicker, CropModal), color contrast of the new controls, large-list rendering (no virtualization), image optimization (admin uses raw <img>). High-value fixes only.` },
  { key: 'audit:data-integrity', p: `Audit data integrity / server actions: every mutating action (stranky/sluzby/cenik/media/nastaveni/poptavky/nabidky) for assertSession, error surfacing, revalidatePath trailing-slash correctness, transaction safety, the new navParent/noindex/Service.image columns being saved everywhere, and the live-text key handling. Flag silent failures + missing whitelists.` },

  { key: 'spec:offer-schema', p: `SPEC the offer variability + photos schema changes precisely. Read src/lib/offers/schema.ts. Design additive, back-compatible Zod/Prisma additions: per-offer images (cover, gallery photos, product shots) as {url,alt}[] + a coverImage override; a sections array controlling which sections render + their order + accent color; full field coverage. Output exact schema diffs + a shared image type module path. Keep existing offers valid.` },
  { key: 'spec:offer-document', p: `SPEC the offer-document.tsx section-registry refactor. Read offer-document.tsx + offer.css. Design a registry of section renderers (cover, solution/metrics, investment/price, process, why, photos-gallery, contact, closing) that can be toggled/reordered per offer, with an accent-color variable, while staying premium + print-correct (A4, puppeteer, page breaks). Concrete component structure + how photos render + how to avoid breaking the WOW look. List the CSS print fixes too.` },
  { key: 'spec:offer-editor-chat', p: `SPEC the offer EDITOR + the single CHAT for full variability + photos. Read offer-editor.tsx + offer-chat.tsx + chat.ts. Design: editor gains an Images section (MediaPicker, multiple, with the crop tool) + section toggles/reorder + accent color + all fields; the chat lets the user attach photos + pick what to generate + warns on missing must-haves; unsaved guard + friendly errors. Concrete UI + data flow + file list.` },
  { key: 'spec:invoice-model', p: `SPEC the FAKTURY Prisma model + Zod schema with full CZ daňový-doklad fields: dodavatel/odběratel (name, address, IČO, DIČ), číslo (číselná řada), datum vystavení/DUZP/splatnost, položky (popis, množství, MJ, cena/MJ, sazba DPH), rekapitulace DPH per sazba, celkem s/bez DPH, variabilní symbol, banka/IBAN, QR platba (SPAYD string format), poznámka, neplátce-DPH mode. Output the exact Prisma model + Zod schema + numbering scheme (allocate number at ISSUE, not draft).` },
  { key: 'spec:invoice-build', p: `SPEC the faktury build mirroring offers: store (Prisma), pdf (reuse puppeteer-core+@sparticuz/chromium), print route (src/app/(print)/faktura/[id]), invoice-document.tsx (clean professional A4 invoice, NOT a brochure) + CSS, admin list/manager + full manual editor + optional create-from-offer, API routes (mirror /api/nabidky), and the SPAYD QR rendering approach (qr library or an <img> to a QR endpoint). Give the exact file list + routes. Make Company config gain DIČ/IBAN/plátce-DPH (currently missing) — list those Settings keys.` },
  { key: 'spec:dokumenty-arch', p: `SPEC the unified /admin/dokumenty architecture so offers + invoices share infra (numbering helper, PDF render helper, Supabase storage of rows, the document-list shell, the puppeteer pipeline) WITHOUT over-coupling two different document types. What to extract into src/lib/docs/* vs keep per-type. Migration-safe given offers already exist + ship. Sidebar/nav changes. Concrete plan + an ordered build sequence for offers-then-invoices.` },
]

phase('Investigate')
const results = await parallel(auditors.map((a) => () =>
  agent(`${CTX}\n\nSCOPE [${a.key}]: ${a.p}`, { label: a.key, phase: 'Investigate', schema: a.key.startsWith('spec:') ? undefined : FINDINGS_SCHEMA, effort: 'high' })
))
const tagged = results.map((r, i) => ({ key: auditors[i].key, r })).filter((x) => x.r)
const structured = tagged.filter((x) => x.r && typeof x.r === 'object' && Array.isArray(x.r.findings))
const specs = tagged.filter((x) => typeof x.r === 'string')
const allFindings = structured.flatMap((x) => x.r.findings.map((f) => ({ ...f, scope: x.key })))
log(`Round 2: ${allFindings.length} findings + ${specs.length} build specs`)

phase('Verify')
const byKind = {}
for (const f of allFindings) (byKind[f.kind] ??= []).push(f)
const VERDICT = { type: 'object', additionalProperties: false, required: ['kind', 'confirmed', 'rejected'],
  properties: { kind: { type: 'string' },
    confirmed: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['title','severity','file','fix'], properties: { title:{type:'string'}, severity:{type:'string',enum:['critical','high','medium','low']}, file:{type:'string'}, fix:{type:'string'} } } },
    rejected: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['title','reason'], properties: { title:{type:'string'}, reason:{type:'string'} } } } } }
const verdicts = await parallel(Object.keys(byKind).map((kind) => () =>
  agent(`${CTX}\n\nADVERSARIAL VERIFY the "${kind}" findings — READ the cited files, confirm each is real (especially REGRESSIONS from the shipped changes), reject false positives, refine fixes, add any critical ${kind} issue missed.\n\nFINDINGS:\n${JSON.stringify(byKind[kind])}`, { label: `verify:${kind}`, phase: 'Verify', schema: VERDICT, effort: 'high' })
))

phase('Synthesize')
const specMemos = specs.map((x) => `### ${x.key}\n${x.r}`).join('\n\n')
const [fixPlan, buildPlan] = await parallel([
  () => agent(`${CTX}\n\nSYNTHESIZE the round-2 FIX PLAN: merge the verified findings into a prioritized, deduped, implementation-ready list (regressions FIRST, then remaining bugs by severity), each with file + concrete fix + an ordered sequence. Be exact.\n\nVERIFIED:\n${JSON.stringify(verdicts)}`, { label: 'synth:fixes', phase: 'Synthesize', effort: 'high' }),
  () => agent(`${CTX}\n\nSYNTHESIZE the OFFERS+INVOICES BUILD SHEET from the specs: one concrete, ordered, buildable plan — exact Prisma + Zod, file list, component structure, routes, shared /lib/docs infra, UI flow — for (1) offer variability + photos + section-registry, (2) the faktury module, (3) unified /admin/dokumenty. Specific enough to implement directly.\n\nSPECS:\n${specMemos}`, { label: 'synth:offers-invoices', phase: 'Synthesize', effort: 'high' }),
])

return { fixPlan, buildPlan, totalFindings: allFindings.length, verdicts }
