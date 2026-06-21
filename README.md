# Viapower

Web + admin/CMS + generátor cenových nabídek pro **Viapower** (fotovoltaika, baterie,
tepelná čerpadla, elektromobilita). Next.js 16 · React 19 · Tailwind v4 · Prisma · Playwright.

## Rychlý start

```bash
npm install
npx prisma migrate deploy
DATABASE_URL="file:./dev.db" ADMIN_EMAIL="admin@viapower.cz" ADMIN_PASSWORD="<vaše-heslo>" npx tsx prisma/seed.ts
npx playwright install chromium
npm run dev
```

- Web: http://localhost:3000
- Admin: http://localhost:3000/admin (`admin@viapower.cz` · heslo dle `ADMIN_PASSWORD` v `.env.local`)

👉 Kompletní dokumentace, architektura, nasazení a TODO: **[HANDOFF.md](./HANDOFF.md)**.
