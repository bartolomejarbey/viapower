export const meta = {
  name: 'viapower-deep-audit-r3',
  description: 'Round 3: regression-verify the round-2 commit, loop-until-dry deeper issue discovery, and generate exact implementation diffs for remaining fixes + offers/invoices build',
  phases: [
    { title: 'Investigate', detail: '~20 high-effort agents: verify r2 commit, hunt NEW issues deeper, produce exact code' },
    { title: 'Verify', detail: 'adversarial verification' },
    { title: 'Synthesize', detail: 'exact fix diffs + offers/invoices implementation code' },
  ],
}

const CTX = `
PROJECT: Viapower CMS — Next.js 16 App Router, React 19, Tailwind v4, Prisma 6 + Supabase Postgres, LIVE viapower.vercel.app. Repo /Users/adstart_rota/viapower.

Two prior audits (34 + 31 agents) ran; MANY fixes shipped (commits up to 69d036b). Round-2 just shipped: homepage safeSpecs guard (page.tsx), CTA padFallback py-24 (section-renderer.tsx), live-edit hasEditable scoped to <main> (admin-edit-bar.tsx), live-text BLOCKED key prefixes (live-text/route.ts), isClaimedUnpublished 404 guard ([...slug]/page.tsx + cms.ts), admin (panel)/loading.tsx + error.tsx.

ROUND-2 found but NOT-YET-IMPLEMENTED (the engineer is applying these in parallel — your job is to provide EXACT diffs/code and find what's STILL wrong or newly broken):
- H1 cenik specs wipe (packages-manager.tsx — add specsDirty guard)
- H4 hero/imagetext accent stacks in editor vs inline live (editor-section.tsx)
- H5 steps editor cards vs public rich-ol inline (editor-section.tsx)
- H6 Lead.read column + sidebar unread badge + mark-read actions
- H9 modal Escape/focus-trap (media-picker.tsx, crop-modal.tsx, sidebar.tsx)
- H10 media delete/alt swallow errors (media-manager.tsx)
- H11 list-level publish/delete on Stránky (stranky/page.tsx + actions.ts)
- H12 Google Ads conversion label + lead conversions
- H13 granular consent + admin head/body consent-gating
- H14 reorder failures silent/non-transactional
- H15 visual-editor KeyboardSensor dead + hijacks palette Enter

OFFERS/INVOICES: a detailed build plan exists. src/lib/offers/{schema,generate,chat,store,pdf,samples}.ts, src/components/offer/offer-document.tsx, src/app/(print)/{nabidka/[id],offer.css}, admin nabidky/*. Media→Supabase Storage works. NO invoices module yet. Company config (src/lib/company.ts) is MISSING DIČ/IBAN/plátce-DPH.

You are a STATIC-ANALYSIS auditor/engineer. READ real files. Do NOT run dev server or mutate files/DB. Be adversarial + EXACT (give literal code/diffs ready to paste).`

const FINDINGS_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['scope', 'summary', 'findings'],
  properties: {
    scope: { type: 'string' }, summary: { type: 'string' },
    findings: { type: 'array', items: {
      type: 'object', additionalProperties: false,
      required: ['title', 'severity', 'kind', 'file', 'evidence', 'fix'],
      properties: {
        title: { type: 'string' }, severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
        kind: { type: 'string', enum: ['regression', 'new-bug', 'dnd', 'live-edit', 'wysiwyg', 'admin', 'security', 'correctness', 'a11y', 'polish'] },
        file: { type: 'string' }, evidence: { type: 'string' }, fix: { type: 'string' },
      },
    } },
  },
}

const auditors = [
  { key: 'regress:round2', p: `REGRESSION-VERIFY the round-2 commit (69d036b). READ page.tsx (safeSpecs), section-renderer.tsx (CTA padFallback "py-24" + all band/inner calls), admin-edit-bar.tsx (hasEditable <main>-scoped + [data-edit-img]), live-text/route.ts (BLOCKED prefixes — does it over-block any legit live key like ft.* footer or break footer logo brand.logo? confirm brand.logo NOT blocked but company.* blocked), [...slug]/page.tsx + cms.ts (isClaimedUnpublished — any false-404 for legit migrated-only pages that were never claimed?), (panel)/loading.tsx + error.tsx (valid signatures?). Find any NEW breakage these introduced.` },
  { key: 'dry:dnd', p: `LOOP-UNTIL-DRY deep dnd hunt in visual-editor.tsx — assume prior findings (off-by-one, KeyboardSensor) and find EVERYTHING ELSE: empty-canvas drop, dropping into a full-bleed block, rapid add+drag, the InsertSlot indices after a delete, duplicate then drag, drag during pending save, mobile/touch sensors. Give exact code for a clean single-model reorder (SortableContext + closestCenter + one arrayMove) as the recommended rewrite.` },
  { key: 'dry:live-edit', p: `LOOP-UNTIL-DRY live-edit hunt: enumerate EVERY [data-edit]/[data-edit-img] key across the codebase (grep), cross-check each is a real Settings key consumed on render, find orphans (edited but never read) and unreachable (read but no data-edit), the announcement bar + footer editing in ?edit=1, image swap on next/Image vs bg, and whether exit/save/refresh fully restore non-edit state. Exact fixes.` },
  { key: 'dry:wysiwyg', p: `LOOP-UNTIL-DRY canvas-vs-public parity: for EVERY block produce the remaining visual diffs after the layout-system + accent/steps fixes. Give exact editor-section.tsx JSX so each block's canvas matches section-renderer.tsx (wrappers, font sizes, grids, centering, card chrome). Prioritize the ones a client would notice.` },
  { key: 'spec:H-items', p: `Produce EXACT, paste-ready code for H1,H4,H5,H6,H9,H10,H11,H14,H15 from round 2. For each: the file, the precise edit (old→new), and any new file. H6 needs the Lead.read column (Prisma) + (panel)/layout.tsx unread count + AdminSidebar badge + poptavky markRead actions — give all of it. H11 needs setPublished/deletePage list actions + a client row component. H15 needs the corrected sensor setup.` },
  { key: 'admin:deep2', p: `Deeper admin audit beyond round 2: search/filter/pagination needs on Poptávky/Média/Nabídky, CSV export of leads, the Stránky ?special template handling, offer list date formatting, any remaining silent server-action failure, revalidatePath trailing-slash across ALL actions. Exact fixes.` },
  { key: 'sec:deep', p: `Security/robustness deep pass: every /api route + server action auth guard, the media upload (MIME spoofing? size? the Supabase service key exposure?), live-text after the new blocklist, settings saveSettings whitelist, offer/lead endpoints, the admin token in middleware. Concrete fixes.` },
  { key: 'code:offer-schema', p: `Produce the EXACT code for offer variability + photos: the literal additions to src/lib/offers/schema.ts (Zod) for per-offer images {url,alt,caption?}[] + coverImage + sections:{id,enabled,order}[] + accentColor, back-compatible (all optional/defaulted so existing offers + samples still parse). Show the final relevant schema block. Plus a shared src/lib/docs/image.ts type.` },
  { key: 'code:offer-document', p: `Produce the EXACT section-registry refactor of src/components/offer/offer-document.tsx: a SECTIONS registry (id→render fn), reading offer.sections to filter+order, an accent CSS var from offer.accentColor, a new PHOTOS section rendering offer.images in a print-safe grid, cover using offer.coverImage||default. Show the new component structure (key code, not full 500 lines) + the offer.css additions/print fixes.` },
  { key: 'code:offer-editor', p: `Produce EXACT UI code for offer-editor.tsx additions: an "Obrázky" section (MediaPicker multi-add with the crop tool, list with remove/caption/alt, set-as-cover), a "Sekce a vzhled" section (toggle+reorder sections, accent color input), wired to the schema fields from code:offer-schema. Give the JSX blocks + state handlers.` },
  { key: 'code:invoice-model', p: `Produce EXACT code: the Prisma Invoice model (additive) + src/lib/invoices/schema.ts Zod with full CZ daňový doklad fields (supplier/customer incl IČO/DIČ, čísla, dates DUZP/splatnost, items qty/unit/price/vat, VAT recap, VS, IBAN, SPAYD QR string builder, neplátce mode) + the numbering allocator (allocate at issue). Plus the Company DIČ/IBAN/plátce-DPH Settings keys + company.ts additions.` },
  { key: 'code:invoice-build', p: `Produce EXACT file plan + key code for the faktury build: src/lib/invoices/{store.ts,pdf.ts(reuse renderDocPdf),number.ts}, src/app/(print)/faktura/[id]/page.tsx, src/components/invoice/invoice-document.tsx (clean A4 invoice) + invoice.css, admin src/app/admin/(panel)/faktury/{page,invoices-manager,[id]} + invoice-editor.tsx, API /api/faktury/* mirroring nabidky, SPAYD QR rendering (recommend a tiny QR approach with no heavy dep, or qrcode). Show the store + pdf + a skeleton invoice-document.` },
  { key: 'code:dokumenty', p: `Produce EXACT plan for unified shared infra: extract src/lib/docs/{pdf.ts (the puppeteer-core+@sparticuz/chromium launcher used by BOTH offer + invoice pdf — show the shared renderDocPdf(origin,path)), number.ts (per-series numbering), image.ts}. Refactor offers/pdf.ts to call it (back-compatible). Sidebar/nav: add Faktury under a Dokumenty group. Ordered build sequence offers→invoices that never breaks the live offer flow.` },
  { key: 'a11y:deep', p: `Deep a11y pass on the whole admin + editor + public live-edit: focus order, aria-live for dnd + save, modal focus traps (the H9 set), the new SegRow/LayoutControls/placement-select labels, the crop modal, color contrast of red-on-dark micro-text, and the editor's keyboard reorder path. Exact fixes.` },
]

phase('Investigate')
const results = await parallel(auditors.map((a) => () =>
  agent(`${CTX}\n\nSCOPE [${a.key}]: ${a.p}`, { label: a.key, phase: 'Investigate', schema: a.key.startsWith('code:') || a.key === 'spec:H-items' ? undefined : FINDINGS_SCHEMA, effort: 'high' })
))
const tagged = results.map((r, i) => ({ key: auditors[i].key, r })).filter((x) => x.r)
const structured = tagged.filter((x) => x.r && typeof x.r === 'object' && Array.isArray(x.r.findings))
const code = tagged.filter((x) => typeof x.r === 'string')
const allFindings = structured.flatMap((x) => x.r.findings.map((f) => ({ ...f, scope: x.key })))
log(`Round 3: ${allFindings.length} findings + ${code.length} code memos`)

phase('Verify')
const byKind = {}
for (const f of allFindings) (byKind[f.kind] ??= []).push(f)
const VERDICT = { type: 'object', additionalProperties: false, required: ['kind', 'confirmed', 'rejected'],
  properties: { kind: { type: 'string' },
    confirmed: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['title','severity','file','fix'], properties: { title:{type:'string'}, severity:{type:'string',enum:['critical','high','medium','low']}, file:{type:'string'}, fix:{type:'string'} } } },
    rejected: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['title','reason'], properties: { title:{type:'string'}, reason:{type:'string'} } } } } }
const verdicts = await parallel(Object.keys(byKind).map((kind) => () =>
  agent(`${CTX}\n\nADVERSARIAL VERIFY the "${kind}" findings — READ cited files, confirm real (esp. regressions from 69d036b), reject false positives, refine to exact fixes.\n\nFINDINGS:\n${JSON.stringify(byKind[kind])}`, { label: `verify:${kind}`, phase: 'Verify', schema: VERDICT, effort: 'high' })
))

phase('Synthesize')
const codeMemos = code.map((x) => `### ${x.key}\n${x.r}`).join('\n\n')
const [fixPlan, buildPlan] = await parallel([
  () => agent(`${CTX}\n\nSYNTHESIZE round-3 FIX PLAN: verified findings → prioritized, deduped, EXACT (old→new) edits, regressions first. Include the paste-ready H1/H4/H5/H6/H9/H10/H11/H14/H15 code from the spec memo where confirmed.\n\nVERIFIED:\n${JSON.stringify(verdicts)}\n\nCODE MEMOS:\n${codeMemos}`, { label: 'synth:fixes', phase: 'Synthesize', effort: 'high' }),
  () => agent(`${CTX}\n\nSYNTHESIZE the OFFERS+INVOICES IMPLEMENTATION SHEET: assemble the exact code from the code memos into ONE ordered build — shared /lib/docs infra first, then offer variability+photos (schema, document registry, editor), then the faktury module (model, store, pdf, print route, document, admin, API, SPAYD QR), then /admin/dokumenty + sidebar. Give literal code blocks ready to apply, in build order, each labeled with its file path.\n\nCODE MEMOS:\n${codeMemos}`, { label: 'synth:offers-invoices', phase: 'Synthesize', effort: 'high' }),
])

return { fixPlan, buildPlan, totalFindings: allFindings.length, verdicts }
