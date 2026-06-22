export const meta = {
  name: 'viapower-deep-audit-r4',
  description: 'Round 4: verify round-3 fixes, adversarially review the offers/invoices build sheet for correctness, deep-audit remaining surfaces, completeness critic',
  phases: [
    { title: 'Investigate', detail: '~16 agents: verify r3 fixes, review offers/invoices plan, deep-audit, completeness' },
    { title: 'Verify', detail: 'adversarial verification' },
    { title: 'Synthesize', detail: 'go/no-go + corrections for the offers/invoices build + remaining fix list' },
  ],
}

const CTX = `
PROJECT: Viapower CMS — Next.js 16 App Router, React 19, Tailwind v4, Prisma 6 + Supabase Postgres, LIVE viapower.vercel.app. Repo /Users/adstart_rota/viapower.

Three audits (34+31+25 agents) ran; many fixes shipped. Round-3 fixes JUST applied (about to deploy): [...slug]/page.tsx isClaimedUnpublished now guarded with !page (no false 404); admin-edit-bar Save shows on chrome-only pages ((hasEditable||changeCount>0)); visual-editor.tsx removed KeyboardSensor/sortableKeyboardCoordinates + PaletteItem onKeyDown; cenik+sluzby reorder now db.$transaction; sortable-list rollback (if applied); media-manager.tsx per-row error state on alt/delete; src/lib/use-modal.ts (Escape+focus restore) attached to MediaPicker + CropModal.

A 20-step OFFERS+INVOICES build sheet exists (saved /tmp/vp_r3_build.md) with exact code: shared src/lib/docs/{pdf,image,number}.ts (extract the puppeteer-core+@sparticuz/chromium launcher), Prisma DocCounter + Invoice models, offer schema images/sections/accent, offer-editor Obrázky+Sekce UI, src/lib/invoices/{schema,qr(SPAYD),store,pdf}.ts, invoice-document.tsx + invoice.css, (print)/faktura/[id], admin faktury/*, /api/faktury/*, Company dic/IBAN/plátce-DPH, sidebar Dokumenty group. The engineer is ABOUT TO IMPLEMENT it — your review must catch errors BEFORE they ship.

You are a STATIC-ANALYSIS auditor/reviewer. READ real files. Do NOT run dev server or mutate. Be adversarial + exact.`

const FINDINGS_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['scope', 'summary', 'findings'],
  properties: { scope: { type: 'string' }, summary: { type: 'string' },
    findings: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['title', 'severity', 'kind', 'file', 'evidence', 'fix'],
      properties: { title: { type: 'string' }, severity: { type: 'string', enum: ['critical','high','medium','low'] },
        kind: { type: 'string', enum: ['regression','new-bug','offers-invoices','correctness','admin','live-edit','dnd','a11y','polish'] },
        file: { type: 'string' }, evidence: { type: 'string' }, fix: { type: 'string' } } } } },
}

const agents_ = [
  { key: 'verify:r3', p: `Verify the round-3 fixes against live source + find new regressions: [...slug]/page.tsx (the !cms && !page && isClaimedUnpublished guard — any remaining false-404 OR a stale-snapshot leak?), admin-edit-bar.tsx Save gate + the input listener, visual-editor.tsx sensors (does removing KeyboardSensor leave any dangling import/usage? does PaletteItem onKeyDown double-fire with onClick?), cenik/sluzby reorder $transaction, media-manager row errors, use-modal.ts (does Escape in CropModal-inside-MediaPicker close BOTH? focus restore correct?). Concrete fixes.` },
  { key: 'review:docs-infra', p: `Adversarially review the SHARED /lib/docs plan (Steps 1-5 in the build sheet): the Prisma DocCounter + Invoice models (additive, no conflict with existing Offer model? index/unique correctness?), extracting the puppeteer launcher into src/lib/docs/pdf.ts and rewriting src/lib/offers/pdf.ts as a wrapper (does it preserve the EXACT working serverless launch — @sparticuz/chromium headless:'shell', defaultArgs await, document.fonts.ready? next.config serverExternalPackages still cover it? outputFileTracingIncludes still match /api/nabidky/*/pdf AND must add /api/faktury/*/pdf?). Read offers/pdf.ts + next.config.ts. Flag anything that would break the WORKING offer PDF.` },
  { key: 'review:offer-schema', p: `Review the offer schema additions (Step 6): images/sections/accentColor as optional/defaulted — do existing offers + SAMPLE_OFFERS (samples.ts) still parse? does buildOfferFromDraft (generate.ts) still work? does the offer-document section-registry break if sections is absent (must default to all sections in current order)? Read schema.ts + samples.ts + generate.ts + offer-document.tsx. Concrete corrections.` },
  { key: 'review:invoice-law', p: `Review the invoice schema (Step 10) for CZ daňový-doklad LEGAL correctness: required fields (DIČ vs IČO, DUZP, VAT recap per rate with rounding rules, neplátce-DPH mode hiding VAT, variabilní symbol derivation, the SPAYD QR string format Step 11 — is the SPAYD spec correct: SPD*1.0*ACC:IBAN*AM:amount*CC:CZK*X-VS:vs*MSG:...?), numbering (gapless per-series, allocate at issue). Flag legal/format errors that would produce an invalid invoice.` },
  { key: 'review:invoice-build', p: `Review the faktury build steps (12-19): store/pdf/print-route/document/admin/editor/API mirroring offers — any path/route/runtime mistake, the QR rendering approach (zero-dep canvas/svg QR — is the algorithm correct or does it need the 'qrcode' npm dep?), the invoice-document print CSS A4 correctness, create-from-offer mapping. Concrete corrections + whether to add a QR dependency.` },
  { key: 'audit:offers-current', p: `Audit the CURRENT offers admin (offer-editor.tsx, offer-chat.tsx, chat.ts, offers-manager.tsx, [id]/page.tsx) for bugs the build will sit on: unsaved guard, validation, error messages, the createManualOffer blank offer (does it render OK in the brochure + PDF?), the manual editor field coverage. Concrete fixes.` },
  { key: 'audit:admin-remaining', p: `Deep-audit remaining admin surfaces not yet touched: search/filter/pagination on long lists, CSV export of leads, Stránky list publish/delete (H11 — still open?), the ?special template page handling, dashboard task-hub. Concrete high-value fixes with code.` },
  { key: 'audit:public-regress', p: `Regression-scan the PUBLIC site after all the layout-system + nav-family + SEO changes: render every block type with and without a layout field (any crash/empty?), the nested nav tree (any duplicate/missing item, mobile drawer), per-page OG/noindex/sitemap correctness, the calculator on /kalkulacka, the contact pages with the new kontakt.image. Concrete fixes.` },
  { key: 'audit:security2', p: `Security re-audit: the live-text BLOCKED prefixes (complete? bypass via case/whitespace? does it block legit footer ft.*? — must NOT), media upload (SVG via accept=image/*? the server ALLOWED set), every API route auth, settings saveSettings whitelist, the Supabase service key only server-side. Concrete fixes.` },
  { key: 'audit:wysiwyg-remaining', p: `Final canvas-vs-public parity sweep after the accent/steps/layout fixes: list any block still visibly different in the editor vs live (the H4 hero/imagetext accent inline fix, H5 steps rich-ol — are these now needed, give exact editor-section.tsx code), bg-toggle visibility in canvas (still inert?), and the layout controls actually reflecting in the canvas. Exact code.` },
  { key: 'critic:completeness', p: `COMPLETENESS CRITIC over the whole session's owner demands: live-edit (works/gated/mobile ✓?), real visual editor + padding/center ✓?, crop ✓?, nav family ✓?, settings clarity (tabs NOT done — flag), offers one-path ✓ but variability/photos/design NOT done, invoices NOT done, calculator ✓, Pobočka Čechy (hero added — enough?). Produce the DEFINITIVE list of what's DONE vs STILL OPEN vs PARTIAL, ranked by owner emphasis, so nothing is silently dropped.` },
  { key: 'audit:a11y-final', p: `Final a11y pass: the new SegRow/LayoutControls/placement-select/crop-modal/use-modal — focus order, labels, the modal focus-trap (use-modal only does Escape+restore, NOT Tab-trap — is that enough or add trap?), aria-live for save/dnd, contrast. Concrete fixes.` },
  { key: 'audit:perf', p: `Performance: admin uses raw <img> everywhere (no next/Image) — list where it matters (media grid, offers); large lists without virtualization; the layout force-dynamic + per-request DB counts (the new unread-lead count adds a query to every admin page — cache it?); the calculator/getCalcConfig query cost. High-value only.` },
  { key: 'audit:data-model', p: `Review all the new columns added this session (Page.navParent/noindex, Service.image, Lead.read, Offer model) + the planned (Invoice, DocCounter): are they all saved everywhere they're read? any select that omits them? the prisma schema in sync with the live Supabase columns (added via ALTER)? Flag drift.` },
]

phase('Investigate')
const results = await parallel(agents_.map((a) => () =>
  agent(`${CTX}\n\nSCOPE [${a.key}]: ${a.p}`, { label: a.key, phase: 'Investigate', schema: a.key.startsWith('critic:') ? undefined : FINDINGS_SCHEMA, effort: 'high' })
))
const tagged = results.map((r, i) => ({ key: agents_[i].key, r })).filter((x) => x.r)
const structured = tagged.filter((x) => x.r && typeof x.r === 'object' && Array.isArray(x.r.findings))
const memos = tagged.filter((x) => typeof x.r === 'string')
const allFindings = structured.flatMap((x) => x.r.findings.map((f) => ({ ...f, scope: x.key })))
log(`Round 4: ${allFindings.length} findings`)

phase('Verify')
const byKind = {}
for (const f of allFindings) (byKind[f.kind] ??= []).push(f)
const VERDICT = { type: 'object', additionalProperties: false, required: ['kind','confirmed','rejected'],
  properties: { kind: { type: 'string' },
    confirmed: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['title','severity','file','fix'], properties: { title:{type:'string'}, severity:{type:'string',enum:['critical','high','medium','low']}, file:{type:'string'}, fix:{type:'string'} } } },
    rejected: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['title','reason'], properties: { title:{type:'string'}, reason:{type:'string'} } } } } }
const verdicts = await parallel(Object.keys(byKind).map((kind) => () =>
  agent(`${CTX}\n\nADVERSARIAL VERIFY the "${kind}" findings — READ cited files, confirm real, reject false positives, refine to exact fixes.\n\nFINDINGS:\n${JSON.stringify(byKind[kind])}`, { label: `verify:${kind}`, phase: 'Verify', schema: VERDICT, effort: 'high' })
))

phase('Synthesize')
const plan = await agent(`${CTX}\n\nSYNTHESIZE round-4: (1) a GO/NO-GO + exact corrections for the offers/invoices build sheet (anything that must change before implementing), (2) a prioritized remaining-fix list (verified, exact), (3) the completeness status (done/open/partial). Be exact and concise.\n\nVERIFIED:\n${JSON.stringify(verdicts)}\n\nCOMPLETENESS MEMO:\n${memos.map((m) => m.r).join('\n\n')}`, { label: 'synth', phase: 'Synthesize', effort: 'high' })

return { plan, totalFindings: allFindings.length, verdicts }
