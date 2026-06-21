# Viapower — design & architecture spec (2026-06-08)

Retroactive design doc for the autonomous build. Captures the decisions behind the three
pillars so future work has the rationale, not just the code.

## Goal

Rebuild the existing WordPress site **viapower.cz** in Next.js with a **brand refresh**
(not a rebrand): black-dominant, red `#FF1830`-led, light white. Preserve **every URL,
its content and SEO**. Add a custom **CMS** (loveable-style, not Elementor-JSON) and an
**offer-PDF generator**.

## Decomposition (3 independent pillars, one codebase)

- **A — Web:** brand refresh + migrate ~52 URLs + SEO + animations + fullscreen hero.
- **C — Offer generator:** LLM brief → structured offer → branded A4 PDF.
- **B — Admin/CMS:** auth, services/prices CRUD, custom pages → navbar, block editor,
  drag-and-drop, media, settings, leads. Max scope.

Build order requested: A → C → B, shipped as one Next.js app.

## Key decisions

| Decision | Choice | Why |
|---|---|---|
| Framework | Next.js 16 App Router + TS + Tailwind v4 | Modern, SSG for marketing SEO, RSC for DB reads |
| Fonts | Space Grotesk + JetBrains Mono (latin-ext) | From the sold proposal; mono accents = brand voice; latin-ext for Czech diacritics |
| Content migration | Scrape live site → `data/viapower-content.json`; render via one catch-all `[...slug]` that templatizes by category | Guarantees all 51 non-home URLs resolve with correct per-page SEO without 51 bespoke files |
| URL preservation | `trailingSlash: true` | Original WP URLs end with `/`; 1:1 match, no SEO loss |
| CMS storage | Prisma + SQLite (Postgres-ready), **typed** entities + typed content blocks | User explicitly rejected "Elementor JSON soup"; relational + typed > opaque blobs |
| Auth | JWT (jose) in httpOnly cookie + edge middleware | Edge-safe verification, bcrypt only in the Node login route |
| Custom pages | DB Page+Block, rendered on-demand via catch-all `dynamicParams`; nav reads `showInNav` pages | New pages appear without rebuild; revalidatePath keeps static pages fresh |
| Drag-n-drop | dnd-kit, gated behind mount to avoid SSR id mismatch | Standard, accessible |
| Rich text | Tiptap (HTML output) rendered with `.cms-html` | WYSIWYG, not markdown soup |
| PDF | Headless Chromium (Playwright) over a print route `/nabidka/[id]/` | Full CSS fidelity → premium branded A4 |
| LLM | Provider-agnostic adapter, OpenAI default, no-key fallback | Works without credentials for dev/testing |

## Public site keeps SSG; CMS edits propagate via `revalidatePath`

Layout/pages read services/packages/nav/settings from the DB at build; admin server actions
call `revalidatePath("/", "layout")` after writes. The admin edit-bar self-gates client-side
(`/api/admin/me`) so the public site is never forced dynamic.

## Known gaps

Real photos (JS-rendered source ⇒ stock used), production deploy + Postgres, full in-place
inline editing, offer persistence to DB, legacy-landing-page canonicalization. See `HANDOFF.md`.
