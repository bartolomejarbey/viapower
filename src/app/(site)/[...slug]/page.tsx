import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Mail, MapPin, Phone, Briefcase } from "lucide-react";
import {
  categorize,
  categoryLabel,
  cleanTitle,
  getAllPaths,
  getCareerDetailPages,
  getMarkdown,
  getPageBySegments,
  getReferenceDetailPages,
  pathFromUrl,
  segmentsFromPath,
} from "@/lib/content";
import { PackageCards } from "@/components/site/package-cards";
import { PageHero, type Crumb } from "@/components/site/page-hero";
import { RichProse } from "@/components/site/rich-prose";
import { CtaBand } from "@/components/site/cta-band";
import { LeadForm } from "@/components/site/lead-form";
import { Calculator } from "@/components/site/calculator";
import { getCalcConfig } from "@/lib/calc.server";
import { Reveal } from "@/components/ui/motion";
import { getCmsPage, isClaimedUnpublished, getSettings, setting } from "@/lib/cms";
import { getCompany, type Company } from "@/lib/company";
import { SectionRenderer } from "@/components/site/section-renderer";

/** Inline-editable text node (Živá editace on the live site writes it to Settings). */
function Editable({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <span data-edit={k} suppressContentEditableWarning>
      {children}
    </span>
  );
}

// Pre-render the 51 migrated URLs; custom CMS pages render on-demand.
export const dynamicParams = true;

const GALLERY = [
  "/img/real/install-7.jpg",
  "/img/real/install-5.jpg",
  "/img/real/install-8.jpg",
  "/img/real/tremosna.jpg",
  "/img/real/install-1.jpg",
  "/img/real/dolansky.webp",
  "/img/real/ref-1.webp",
  "/img/real/ref-2.webp",
  "/img/real/ref-3.webp",
];

export function generateStaticParams() {
  return getAllPaths().map((p) => ({ slug: segmentsFromPath(p) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const path = "/" + slug.join("/") + "/";
  // published CMS pages (incl. taken-over migrated pages) win over the migration snapshot
  const cms = await getCmsPage(slug.join("/"));
  if (cms) {
    const desc = cms.metaDescription || undefined;
    return {
      title: cms.title,
      description: desc,
      alternates: { canonical: path },
      robots: cms.noindex ? { index: false, follow: true } : undefined,
      openGraph: { title: cms.title, description: desc, url: path, type: "article", ...(cms.heroImage ? { images: [cms.heroImage] } : {}) },
    };
  }
  const page = getPageBySegments(slug);
  if (page) {
    return { title: cleanTitle(page), description: page.metaDescription || undefined, alternates: { canonical: path } };
  }
  return {};
}

function buildCrumbs(path: string, title: string): Crumb[] {
  const segs = segmentsFromPath(path);
  const crumbs: Crumb[] = [{ label: "Domů", href: "/" }];
  if (segs[0] === "nase-reference" && segs.length > 1) crumbs.push({ label: "Reference", href: "/reference/" });
  if (segs[0] === "volne-pozice" && segs.length > 1) crumbs.push({ label: "Kariéra", href: "/kariera-volne-pozice/" });
  crumbs.push({ label: title });
  return crumbs;
}

export default async function CatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;

  // CMS pages first — a published CMS page (created or taken over in the
  // visual editor) overrides the migrated snapshot for the same URL.
  const cms = await getCmsPage(slug.join("/"));
  const page = cms ? null : getPageBySegments(slug);
  // Only suppress when an unpublished CMS page claims a slug with NO migrated fallback
  // (a genuine draft/hidden page) — never 404 a live migrated page mid-takeover.
  if (!cms && !page && (await isClaimedUnpublished(slug.join("/")))) notFound();
  const [company, t] = await Promise.all([getCompany(), getSettings()]);

  if (cms) {
    // Every CMS page is a sequence of designed full-width sections (its first
    // block is a hero). No wrapper chrome — the blocks own the whole layout.
    return <SectionRenderer blocks={cms.blocks} company={company} t={t} />;
  }

  if (!page) notFound();

  const path = "/" + slug.join("/") + "/";
  const cat = categorize(path);
  const title = cleanTitle(page);
  const md = getMarkdown(page);
  const crumbs = buildCrumbs(path, title);

  // ── reference index ──────────────────────────────────────────
  if (cat === "reference-index") {
    const refs = getReferenceDetailPages();
    return (
      <>
        <PageHero
          eyebrow={<Editable k="ref.eb">{setting(t, "ref.eb", "reference")}</Editable>}
          title={<Editable k="ref.title">{setting(t, "ref.title", "Stovky realizací po celé ČR.")}</Editable>}
          sub={<Editable k="ref.sub">{setting(t, "ref.sub", "Rodinné domy, firmy, obce i veřejné instituce. Každý projekt na klíč — včetně dotace, revize a servisního dohledu.")}</Editable>}
          crumbs={crumbs}
          image={setting(t, "ref.image", "/img/real/install-7.jpg")}
          imageKey="ref.image"
        />
        <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-9">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {refs.map((r, i) => {
              const rp = pathFromUrl(r.url);
              return (
                <Reveal key={rp} delay={(i % 3) * 0.08}>
                  <Link href={rp} className="brackets brackets-draw group block h-full overflow-hidden border border-line-strong bg-card transition-transform hover:-translate-y-1">
                    <div className="relative h-48 overflow-hidden">
                      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${GALLERY[i % GALLERY.length]}')` }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                    </div>
                    <div className="p-6">
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-red-bright">realizace</span>
                      <h3 className="mt-2 text-[18px] font-bold leading-snug text-ink group-hover:text-red-bright">{cleanTitle(r)}</h3>
                      <span className="mt-4 inline-flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-wide text-ink-muted">
                        Detail <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
          {md && <div className="mx-auto mt-16 max-w-3xl"><RichProse markdown={md} /></div>}
        </section>
        <CtaBand />
      </>
    );
  }

  // ── career index ─────────────────────────────────────────────
  if (cat === "career-index") {
    const jobs = getCareerDetailPages();
    return (
      <>
        <PageHero
          eyebrow={<Editable k="car.eb">{setting(t, "car.eb", "kariéra")}</Editable>}
          title={<Editable k="car.title">{setting(t, "car.title", "Pojďte stavět energetiku budoucnosti.")}</Editable>}
          sub={<Editable k="car.sub">{setting(t, "car.sub", "Rosteme a hledáme parťáky do týmu. Rodinná firma, férové jednání, práce, která dává smysl.")}</Editable>}
          crumbs={crumbs}
          image={setting(t, "car.image", "/img/real/team.jpg")}
          imageKey="car.image"
        />
        <section className="mx-auto max-w-[1000px] px-5 py-20 md:px-9">
          <div className="flex flex-col gap-4">
            {jobs.map((j, i) => {
              const jp = pathFromUrl(j.url);
              return (
                <Reveal key={jp} delay={i * 0.07}>
                  <Link href={jp} className="brackets brackets-draw group flex items-center justify-between gap-6 border border-line-strong bg-card p-7 transition-colors hover:border-red">
                    <div className="flex items-center gap-5">
                      <span className="grid h-12 w-12 shrink-0 place-items-center border border-red bg-red-soft text-red"><Briefcase size={22} /></span>
                      <div>
                        <h3 className="text-[19px] font-bold text-ink group-hover:text-red-bright">{cleanTitle(j)}</h3>
                        <span className="font-mono text-[12px] text-ink-dim">Plný úvazek · ČR</span>
                      </div>
                    </div>
                    <ArrowRight size={20} className="shrink-0 text-red transition-transform group-hover:translate-x-1" />
                  </Link>
                </Reveal>
              );
            })}
          </div>
          {md && <div className="mt-14"><RichProse markdown={md} /></div>}
        </section>
        <CtaBand
          title={<Editable k="car.cta.title">{setting(t, "car.cta.title", "Nevidíte svoji pozici?")}</Editable>}
          sub={<Editable k="car.cta.sub">{setting(t, "car.cta.sub", "Napište nám i tak — šikovné lidi si vždycky rádi najdeme.")}</Editable>}
        />
      </>
    );
  }

  // ── contact ──────────────────────────────────────────────────
  if (cat === "contact") {
    const isMorava = path.includes("morava");
    return (
      <>
        <PageHero
          eyebrow={<Editable k="kontakt.eb">{setting(t, "kontakt.eb", "kontakt")}</Editable>}
          title={<Editable k={`kontakt.title.${isMorava ? "morava" : "cechy"}`}>{setting(t, `kontakt.title.${isMorava ? "morava" : "cechy"}`, isMorava ? "Pobočka Morava" : "Pobočka Čechy")}</Editable>}
          sub={<Editable k="kontakt.sub">{setting(t, "kontakt.sub", "Ozvěte se nám — rádi probereme váš projekt. Konzultace je zdarma a bez závazku.")}</Editable>}
          crumbs={crumbs}
          image={setting(t, "kontakt.image", "/img/real/firmy.jpg")}
          imageKey="kontakt.image"
        />
        <section className="mx-auto grid max-w-[1400px] gap-12 px-5 py-20 md:px-9 lg:grid-cols-[1fr_1fr]">
          <div>
            <ContactInfo company={company} />
            {md && <div className="mt-10"><RichProse markdown={md} /></div>}
          </div>
          <Reveal delay={0.1}><LeadForm source={`kontakt-${isMorava ? "morava" : "cechy"}`} withMessage t={t} /></Reveal>
        </section>
        <CtaBand />
      </>
    );
  }

  // ── form (poptávkový formulář) ───────────────────────────────
  if (cat === "form") {
    return (
      <>
        <PageHero
          eyebrow={<Editable k="poptavka.eb">{setting(t, "poptavka.eb", "nezávazná poptávka")}</Editable>}
          title={<Editable k="poptavka.title">{setting(t, "poptavka.title", "Spočítáme vaši úsporu.")}</Editable>}
          sub={<Editable k="poptavka.sub">{setting(t, "poptavka.sub", "Zanechte nám kontakt. Ozveme se vám do 24 hodin a probereme spotřebu, střechu a možnosti dotace.")}</Editable>}
          crumbs={crumbs}
        />
        <section className="mx-auto grid max-w-[1100px] gap-12 px-5 py-20 md:px-9 lg:grid-cols-[1fr_1fr]">
          <div>
            <ContactInfo company={company} />
            {md && <div className="mt-10"><RichProse markdown={md} /></div>}
          </div>
          <Reveal delay={0.1}><LeadForm source="poptavkovy-formular" withMessage t={t} /></Reveal>
        </section>
      </>
    );
  }

  // ── thank-you pages ──────────────────────────────────────────
  if (cat === "thanks") {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 py-24 text-center">
        <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-red-bright">děkujeme</span>
        <h1 className="mt-5 text-[clamp(2.4rem,5vw,4rem)] font-bold leading-tight text-ink">{title}</h1>
        <div className="mt-4 max-w-lg"><RichProse markdown={md || "Děkujeme za zprávu. Brzy se vám ozveme."} /></div>
        <Link href="/" className="group mt-8 inline-flex items-center gap-2.5 border border-red bg-red px-6 py-3.5 font-mono text-[12.5px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-dark">
          <ArrowLeft size={14} /> Zpět na hlavní stránku
        </Link>
      </section>
    );
  }

  // ── reference / career detail ────────────────────────────────
  const isDetail = cat === "reference-detail" || cat === "career-detail";
  const heroImage =
    cat === "reference-detail"
      ? GALLERY[getReferenceDetailPages().findIndex((r) => pathFromUrl(r.url) === path) % GALLERY.length]
      : cat === "service"
        ? setting(t, "svc.image", "/img/real/install-5.jpg")
        : undefined;
  const heroImageKey = cat === "service" ? "svc.image" : undefined;

  // ── default: service / generic / legal / news / detail ───────
  const isCalculator = path === "/kalkulacka/";
  const calcCfg = isCalculator ? await getCalcConfig() : undefined;
  // aside facts: drop extraction meta-noise and package specs already rendered as cards
  const asideFacts = (page.keyFacts ?? []).filter(
    (f) => !/banner|placeholder|widget|VIAPOWER (LOW|HIGH|ULTRA|MINI|MEDIUM)\s*:/i.test(f),
  );
  const showAside = (cat === "service" || cat === "generic" || cat === "news") && asideFacts.length > 0;

  return (
    <>
      <PageHero
        eyebrow={categoryLabel(cat)}
        title={title}
        sub={page.metaDescription || undefined}
        crumbs={crumbs}
        image={heroImage}
        imageKey={heroImageKey}
      />
      <section className="relative overflow-hidden px-5 py-16 md:px-9 md:py-20">
        <div aria-hidden className="aurora absolute -left-40 top-1/4 -z-10 h-[480px] w-[480px] opacity-50" />
        <div aria-hidden className="aurora aurora-2 absolute -right-40 bottom-10 -z-10 h-[420px] w-[420px] opacity-50" />
        <div className="relative mx-auto max-w-[1400px]">
        {isCalculator && (
          <div className="mb-16">
            <Calculator t={t} cfg={calcCfg} />
          </div>
        )}
        {page.packages && page.packages.length > 0 && (
          <div className="mb-16">
            <PackageCards packages={page.packages} t={t} />
          </div>
        )}
        <div className={showAside ? "grid gap-12 lg:grid-cols-[1fr_320px]" : "mx-auto max-w-3xl"}>
          <article>
            {md ? <RichProse markdown={md} /> : <p className="text-ink-muted">Obsah této stránky připravujeme.</p>}
            {cat === "career-detail" && (
              <div className="mt-12">
                <LeadForm source={`kariera-${slug[slug.length - 1]}`} withMessage t={t} />
              </div>
            )}
            {isDetail && (
              <Link href={cat === "reference-detail" ? "/reference/" : "/kariera-volne-pozice/"} className="mt-10 inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-wide text-red-bright hover:text-red">
                <ArrowLeft size={14} /> {cat === "reference-detail" ? "Všechny reference" : "Všechny pozice"}
              </Link>
            )}
          </article>
          {showAside && <KeyFactsAside facts={asideFacts} />}
        </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}

function KeyFactsAside({ facts }: { facts: string[] }) {
  return (
    <aside className="h-fit lg:sticky lg:top-28">
      <div className="brackets border border-line-strong bg-card p-6">
        <h3 className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-red-bright">
          <span className="h-1.5 w-1.5 bg-red" /> ve zkratce
        </h3>
        <ul className="mt-4 flex flex-col gap-3">
          {facts.slice(0, 10).map((f, i) => (
            <li key={i} className="flex gap-2.5 text-[13.5px] leading-snug text-ink-muted">
              <span className="mt-[0.45em] h-1.5 w-1.5 shrink-0 bg-red" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function ContactInfo({ company }: { company: Company }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <InfoCard icon={MapPin} label="Sídlo">
        {company.legalName}
        <br />
        {company.address.street}
        <br />
        {company.address.zip} {company.address.city}
        <br />
        IČ: {company.ico}
      </InfoCard>
      <InfoCard icon={Phone} label="Telefon">
        <a href={company.phoneHref} className="hover:text-red-bright">{company.phone}</a>
      </InfoCard>
      <InfoCard icon={Mail} label="E-mail">
        <a href={`mailto:${company.email}`} className="hover:text-red-bright">{company.email}</a>
      </InfoCard>
      <InfoCard icon={Briefcase} label={company.projectManager.role || "Projektový manažer"}>
        {company.projectManager.name}
        <br />
        <a href={company.projectManager.phoneHref} className="hover:text-red-bright">{company.projectManager.phone}</a>
        {company.projectManager.email && (
          <>
            <br />
            <a href={`mailto:${company.projectManager.email}`} className="hover:text-red-bright">{company.projectManager.email}</a>
          </>
        )}
      </InfoCard>
    </div>
  );
}

function InfoCard({ icon: Icon, label, children }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <div className="border border-line-strong bg-card p-5">
      <span className="grid h-10 w-10 place-items-center border border-red bg-red-soft text-red"><Icon size={18} /></span>
      <div className="mt-3.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-dim">{label}</div>
      <div className="mt-1.5 text-[14.5px] leading-relaxed text-ink-muted">{children}</div>
    </div>
  );
}
