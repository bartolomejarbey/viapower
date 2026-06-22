import Link from "next/link";
import { Lock } from "lucide-react";
import { footerNav } from "@/config/site";
import { FooterWordmark } from "@/components/site/footer-wordmark";
import { getSettings } from "@/lib/cms";
import { getCompany } from "@/lib/company";

export async function SiteFooter() {
  const [t, company] = await Promise.all([getSettings(), getCompany()]);
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-base px-5 pb-8 pt-20 md:px-9">
      <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <img src={company.logoLight} alt={company.name} className={`h-7 w-auto${company.logoLight === company.logo ? " [filter:brightness(0)_invert(1)]" : ""}`} data-edit-img="brand.logo" />
          <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-white/55" data-edit="ft.tag" suppressContentEditableWarning>
            {t["ft.tag"] || company.tagline ||
              "Komplexní partner v energetice — fotovoltaika, baterie, tepelná čerpadla a elektromobilita. 15+ let zkušeností, stovky realizací po celé ČR."}
          </p>
          <p className="mt-5 font-mono text-[12px] text-ink-dim">
            {company.legalName} · {company.address.street}, {company.address.zip} {company.address.city} · IČ {company.ico}
          </p>
        </div>

        {footerNav.map((col) => (
          <div key={col.title}>
            <h5 className="mb-5 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-red-bright">
              <span className="h-1.5 w-1.5 bg-red" /> {col.title}
            </h5>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="group/link group relative inline-block text-[14px] text-white/80 transition-colors duration-200 hover:text-red-bright"
                  >
                    <span
                      aria-hidden
                      className="absolute -left-5 font-mono text-red opacity-0 transition-all duration-200 group-hover:-left-4 group-hover:opacity-100"
                    >
                      {"//"}
                    </span>
                    <span className="u-draw pb-0.5">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-14 flex max-w-[1400px] flex-col gap-3 border-t border-line pt-7 font-mono text-[11.5px] uppercase tracking-wide text-ink-dim sm:flex-row sm:items-center sm:justify-between">
        <span>© {year} {company.name} — <span data-edit="ft.rights" suppressContentEditableWarning>{t["ft.rights"] || "všechna práva vyhrazena"}</span></span>
        <div className="flex flex-wrap items-center gap-4">
          <a href={company.phoneHref} className="hover:text-red-bright">{company.phone}</a>
          <a href={`mailto:${company.email}`} className="hover:text-red-bright">{company.email}</a>
          <Link href="/gdpr/" className="hover:text-red-bright">GDPR</Link>
          <Link href="/zasady-cookies-eu/" className="hover:text-red-bright">Cookies</Link>
          {/* admin proklik — required in the footer */}
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-ink-dim/70 transition-colors hover:text-red-bright"
            aria-label="Administrace"
          >
            <Lock size={11} /> Admin
          </Link>
        </div>
      </div>

      <FooterWordmark />
    </footer>
  );
}
