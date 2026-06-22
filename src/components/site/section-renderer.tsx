import Link from "next/link";
import {
  Sun, Home, Building2, Thermometer, Plug, Wind, Cpu, ShieldCheck, Clock, Award, BadgeCheck, Layers,
  Wallet, Zap, BatteryCharging, PiggyBank, TrendingUp, Leaf, Wrench, FileCheck, Phone, Mail, MapPin,
  Users, Sparkles, ArrowRight, Quote as QuoteIcon, type LucideIcon,
} from "lucide-react";
import { Reveal, MaskRise, FadeIn, TickIn, Stagger, StaggerItem, ParallaxY } from "@/components/ui/motion";
import { GlowCards } from "@/components/ui/glow-card";
import { Eyebrow, Accent, ArrowSwap } from "@/components/ui/primitives";
import { MiniBars } from "@/components/ui/mini-bars";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { LeadForm } from "@/components/site/lead-form";
import type { Company } from "@/lib/company";
import { bgClass, normalizeLogos, parseBlockData, type AnyBlock, type BlockBg } from "@/lib/blocks";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Sun, Home, Building2, Thermometer, Plug, Wind, Cpu, ShieldCheck, Clock, Award, BadgeCheck, Layers,
  Wallet, Zap, BatteryCharging, PiggyBank, TrendingUp, Leaf, Wrench, FileCheck, Phone, Mail, MapPin, Users, Sparkles,
};

const s = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

export function SectionRenderer({ blocks, company, t }: { blocks: { type: string; data: string }[]; company: Company; t?: Record<string, string> }) {
  const parsed: AnyBlock[] = blocks.map((b, i) => ({ id: `b${i}`, type: b.type as AnyBlock["type"], data: parseBlockData(b.data) }));
  return (
    <>
      {parsed.map((b) => (
        <Block key={b.id} block={b} company={company} t={t} />
      ))}
    </>
  );
}

/** Section heading: eyebrow + masked title (with accent) + sub. */
function SectionHead({ eyebrow, title, accent, sub, center }: { eyebrow?: string; title?: string; accent?: string; sub?: string; center?: boolean }) {
  if (!eyebrow && !title && !sub) return null;
  return (
    <div className={cn("max-w-3xl", center && "mx-auto text-center")}>
      {eyebrow ? <Eyebrow className={center ? "justify-center" : ""}>{eyebrow}</Eyebrow> : null}
      {title ? (
        <h2 className="mt-5 text-balance text-[clamp(2.2rem,4.6vw,4rem)] font-bold leading-[1.0] text-ink">
          <MaskRise delay={0.12}>
            {title}
            {accent ? <> <Accent>{accent}</Accent></> : null}
          </MaskRise>
        </h2>
      ) : null}
      {sub ? (
        <FadeIn delay={0.3}>
          <p className={cn("mt-5 max-w-2xl text-[18px] leading-relaxed text-ink-muted", center && "mx-auto")}>{sub}</p>
        </FadeIn>
      ) : null}
    </div>
  );
}

function band(bg: BlockBg | undefined, extra?: string) {
  return cn("relative overflow-hidden px-5 py-24 md:px-9 md:py-28", bgClass(bg), extra);
}

function Block({ block, company, t }: { block: AnyBlock; company: Company; t?: Record<string, string> }) {
  const d = block.data;
  const bg = s(d.bg, "base") as BlockBg;
  const tt = (k: string, f: string) => t?.[k] ?? f;

  switch (block.type) {
    /* ── HERO ─────────────────────────────────────────────── */
    case "hero": {
      const image = s(d.image);
      const primary = (d.primary as { label?: string; href?: string }) ?? {};
      const secondary = (d.secondary as { label?: string; href?: string }) ?? {};
      return (
        <section className="relative flex min-h-[58vh] items-center overflow-hidden border-b border-line px-5 py-20 md:px-9 md:py-28">
          {image && (
            <>
              <div className="absolute inset-0 -z-20 scale-105 bg-cover bg-center opacity-30" style={{ backgroundImage: `url('${image}')` }} />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-base via-base/70 to-base/55" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-base via-base/40 to-transparent" />
            </>
          )}
          <div className="bg-grid bg-grid-mask absolute inset-0 -z-10 opacity-40" />
          <div className="pointer-events-none absolute -right-32 -top-40 -z-10 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(192,15,10,0.22),transparent_60%)] blur-2xl" />
          <div aria-hidden className="aurora absolute -bottom-32 left-1/4 -z-10 h-[420px] w-[420px] opacity-70" />
          <div className="mx-auto w-full max-w-[1400px]">
            {s(d.eyebrow) ? <Eyebrow>{s(d.eyebrow)}</Eyebrow> : null}
            <h1 className="mt-5 max-w-4xl text-[clamp(2.6rem,5.6vw,5rem)] font-bold leading-[0.98] text-ink">
              <MaskRise delay={0.1} className="text-balance">
                {s(d.title)}
                {s(d.accent) ? <> <Accent>{s(d.accent)}</Accent></> : null}
              </MaskRise>
            </h1>
            {s(d.sub) ? (
              <FadeIn delay={0.3}>
                <p className="mt-5 max-w-2xl text-[19px] leading-relaxed text-ink-muted">{s(d.sub)}</p>
              </FadeIn>
            ) : null}
            {(primary.label || secondary.label) && (
              <FadeIn delay={0.45}>
                <div className="mt-9 flex flex-wrap items-center gap-3.5">
                  {primary.label ? (
                    <Link href={primary.href || "#"} className="group relative inline-flex items-center gap-3 overflow-hidden border border-red bg-red px-7 py-4 text-[13px] font-bold uppercase tracking-[0.1em] text-white transition-colors duration-300 hover:border-white hover:text-red">
                      <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
                      {primary.label} <ArrowSwap />
                    </Link>
                  ) : null}
                  {secondary.label ? (
                    <Link href={secondary.href || "#"} className="inline-flex items-center gap-3 border border-line-strong px-6 py-4 text-[13px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:border-white hover:bg-white/5">
                      {secondary.label}
                    </Link>
                  ) : null}
                </div>
              </FadeIn>
            )}
          </div>
        </section>
      );
    }

    /* ── HEADING ──────────────────────────────────────────── */
    case "heading":
      return (
        <section className={band(bg)}>
          <div className="mx-auto max-w-[1400px]">
            <SectionHead eyebrow={s(d.eyebrow)} title={s(d.title)} accent={s(d.accent)} sub={s(d.sub)} center={d.align === "center"} />
          </div>
        </section>
      );

    /* ── RICHTEXT ─────────────────────────────────────────── */
    case "richtext":
      return (
        <section className={band(bg, "!py-16 md:!py-20")}>
          <Reveal className="mx-auto max-w-3xl">
            <div className="cms-html text-[16.5px] leading-relaxed text-ink-muted" dangerouslySetInnerHTML={{ __html: s(d.html) }} />
          </Reveal>
        </section>
      );

    /* ── IMAGE + TEXT ─────────────────────────────────────── */
    case "imagetext": {
      const right = d.side === "right";
      const image = s(d.image);
      const button = (d.button as { label?: string; href?: string }) ?? {};
      return (
        <section className={band(bg)}>
          <div className="mx-auto grid max-w-[1400px] items-center gap-12 lg:grid-cols-2">
            <Reveal className={cn("overflow-hidden border border-line-strong", right && "lg:order-2")}>
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={s(d.title) || s(d.eyebrow) || ""} className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="aspect-[4/3] w-full bg-card" />
              )}
            </Reveal>
            <div>
              <SectionHead eyebrow={s(d.eyebrow)} title={s(d.title)} accent={s(d.accent)} />
              <FadeIn delay={0.2}>
                <div className="cms-html mt-5 text-[16.5px] leading-relaxed text-ink-muted" dangerouslySetInnerHTML={{ __html: s(d.html) }} />
              </FadeIn>
              {button.label ? (
                <Link href={button.href || "#"} className="group mt-7 inline-flex items-center gap-2.5 border border-red bg-red px-6 py-3.5 text-[12.5px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-dark">
                  {button.label} <ArrowSwap />
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      );
    }

    /* ── FEATURES ─────────────────────────────────────────── */
    case "features": {
      const items = arr<{ icon?: string; title?: string; text?: string }>(d.items);
      const cols = Number(d.columns) || 3;
      return (
        <section className={band(bg)}>
          <div className="mx-auto max-w-[1400px]">
            <SectionHead eyebrow={s(d.eyebrow)} title={s(d.title)} accent={s(d.accent)} sub={s(d.sub)} />
            <GlowCards>
              <Stagger className={cn("mt-12 grid gap-4 sm:grid-cols-2", cols >= 3 ? "lg:grid-cols-3" : cols === 2 ? "lg:grid-cols-2" : "")}>
                {items.map((it, i) => {
                  const Icon = ICONS[s(it.icon, "Sparkles")] ?? Sparkles;
                  return (
                    <StaggerItem key={i}>
                      <div data-glow className="brackets brackets-draw group flex h-full items-start gap-4 border border-line-strong bg-card p-6 transition-colors hover:border-red">
                        <span aria-hidden className="glow-ring" />
                        <span className="grid h-12 w-12 shrink-0 place-items-center border border-red bg-red-soft text-red"><Icon size={22} /></span>
                        <div>
                          <h4 className="text-[16.5px] font-bold text-ink">{s(it.title)}</h4>
                          <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">{s(it.text)}</p>
                        </div>
                      </div>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </GlowCards>
          </div>
        </section>
      );
    }

    /* ── STEPS / TIMELINE ─────────────────────────────────── */
    case "steps": {
      const items = arr<{ title?: string; text?: string }>(d.items);
      return (
        <section className={band(bg)}>
          <div className="mx-auto max-w-3xl">
            <SectionHead eyebrow={s(d.eyebrow)} title={s(d.title)} accent={s(d.accent)} sub={s(d.sub)} />
            <ol className="rich-ol mt-10">
              {items.map((it, i) => (
                <li key={i}>
                  <Reveal>
                    <strong className="text-ink">{s(it.title)}</strong>
                    {s(it.text) ? <span> — {s(it.text)}</span> : null}
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>
      );
    }

    /* ── STATS ────────────────────────────────────────────── */
    case "stats": {
      const items = arr<{ value?: string; label?: string; desc?: string }>(d.items);
      return (
        <section className={band(bg, "!py-14")}>
          <div className="mx-auto max-w-[1400px]">
            {(s(d.title) || s(d.eyebrow) || s(d.sub)) ? (
              <div className="mb-10">
                <SectionHead eyebrow={s(d.eyebrow)} title={s(d.title)} accent={s(d.accent)} sub={s(d.sub)} />
              </div>
            ) : null}
            <Stagger className="grid grid-cols-2 border border-line-strong lg:grid-cols-4">
              {items.map((it, i) => (
                <StaggerItem key={i} className="border-b border-line lg:border-b-0 lg:border-r lg:last:border-r-0">
                  <div className="group flex h-full flex-col p-8 transition-colors hover:bg-red-soft sm:p-9">
                    <span className="mb-3.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">
                      <span className="h-1.5 w-1.5 bg-red" /> {s(it.label)}
                    </span>
                    <div className="text-[clamp(2.4rem,4vw,3.4rem)] font-bold leading-none tracking-tight text-ink">{s(it.value)}</div>
                    <p className="mt-2 text-[13px] font-medium text-ink-muted">{s(it.desc)}</p>
                    <MiniBars pattern={i} className="mt-5 opacity-60 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      );
    }

    /* ── PRICING / PACKAGES ───────────────────────────────── */
    case "pricing": {
      const items = arr<{ name?: string; tagline?: string; specs?: [string, string][]; href?: string; featured?: boolean; ctaLabel?: string; badge?: string }>(d.items);
      return (
        <section className={band(bg)}>
          <div className="mx-auto max-w-[1400px]">
            <SectionHead eyebrow={s(d.eyebrow)} title={s(d.title)} accent={s(d.accent)} sub={s(d.sub)} center />
            <GlowCards>
              <Stagger className={cn("mt-12 grid gap-4", items.length >= 3 ? "lg:grid-cols-3" : items.length === 2 ? "lg:grid-cols-2" : "mx-auto max-w-md")}>
                {items.map((p, i) => (
                  <StaggerItem key={i} className="h-full">
                    <div data-glow className={cn("brackets group relative flex h-full flex-col border p-8 transition-all duration-300 hover:-translate-y-1", p.featured ? "border-red bg-elevated" : "brackets-draw border-line-strong bg-card hover:border-red")}>
                      <span aria-hidden className="glow-ring" />
                      <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-red-bright">
                        <span className="h-2 w-2 bg-red" /> {s(p.name, "Balíček")}
                        {p.featured ? <span className="ml-1 normal-case tracking-normal text-ink-dim">· {s(p.badge) || tt("pkg.badge", "doporučujeme")}</span> : null}
                      </span>
                      {s(p.tagline) ? <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">{s(p.tagline)}</p> : null}
                      <ul className="mt-5 flex-1 border-t border-line pt-4">
                        {arr<[string, string]>(p.specs).map(([k, v], j) => (
                          <li key={j} className="flex items-center justify-between gap-4 border-b border-dashed border-line py-2.5 text-[13.5px] text-ink-muted last:border-0">
                            <span>{k}</span>
                            <span className="text-right font-semibold text-ink">{v}</span>
                          </li>
                        ))}
                      </ul>
                      <Link href={s(p.href, "/poptavkovy-formular/")} className="mt-6 flex items-center justify-between border border-line-strong px-4 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:border-red hover:bg-red hover:text-white">
                        {s(p.ctaLabel) || tt("pkg.cta", "Více informací")} <ArrowRight size={14} />
                      </Link>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </GlowCards>
          </div>
        </section>
      );
    }

    /* ── GALLERY ──────────────────────────────────────────── */
    case "gallery": {
      const items = arr<{ image?: string; label?: string; title?: string }>(d.items);
      return (
        <section className={band(bg)}>
          <div className="mx-auto max-w-[1400px]">
            <SectionHead eyebrow={s(d.eyebrow)} title={s(d.title)} accent={s(d.accent)} />
            <Stagger className="mt-12 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((it, i) => (
                <StaggerItem key={i}>
                  <div className="brackets brackets-draw group relative block h-64 overflow-hidden border border-line-strong">
                    <ParallaxY range={12} className="absolute -inset-y-8 inset-x-0">
                      {s(it.image) ? (
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${s(it.image)}')` }} />
                      ) : (
                        <div className="absolute inset-0 bg-card" />
                      )}
                    </ParallaxY>
                    <div className="absolute inset-0 bg-gradient-to-t from-base via-base/10 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-red-bright">{s(it.label)}</span>
                      <span className="mt-1 block text-[14px] font-bold text-white">{s(it.title)}</span>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      );
    }

    /* ── TESTIMONIALS ─────────────────────────────────────── */
    case "testimonials": {
      const items = arr<{ text?: string; author?: string; role?: string; image?: string }>(d.items);
      return (
        <section className={band(bg)}>
          <div className="mx-auto max-w-[1400px]">
            <SectionHead eyebrow={s(d.eyebrow)} title={s(d.title)} accent={s(d.accent)} center />
            <Stagger className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((it, i) => (
                <StaggerItem key={i} className="h-full">
                  <figure className="brackets brackets-draw group flex h-full flex-col border border-line-strong bg-card p-7 transition-colors hover:border-red">
                    <QuoteIcon size={26} className="mb-3 text-red" />
                    <blockquote className="flex-1 text-[16px] italic leading-relaxed text-ink">{s(it.text)}</blockquote>
                    {(s(it.author) || s(it.image)) ? (
                      <figcaption className="mt-4 flex items-center gap-3">
                        {s(it.image) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s(it.image)} alt={s(it.author)} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                        ) : null}
                        <span>
                          <span className="block text-[13px] font-semibold text-red-bright">{s(it.author)}</span>
                          {s(it.role) ? <span className="block text-[12px] text-ink-muted">{s(it.role)}</span> : null}
                        </span>
                      </figcaption>
                    ) : null}
                  </figure>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      );
    }

    /* ── FAQ ──────────────────────────────────────────────── */
    case "faq": {
      const items = arr<{ q?: string; a?: string }>(d.items).map((it) => ({ q: s(it.q), a: s(it.a) }));
      return (
        <section className={band(bg)}>
          <div className="mx-auto max-w-[1400px]">
            <SectionHead eyebrow={s(d.eyebrow)} title={s(d.title)} accent={s(d.accent)} center />
            <div className="mt-12">
              <FaqAccordion items={items} startOpen={-1} />
            </div>
          </div>
        </section>
      );
    }

    /* ── LOGOS ────────────────────────────────────────────── */
    case "logos": {
      const all = normalizeLogos(d.items).filter((it) => it.image || it.name.trim());
      // duplicate only when there are enough items for a seamless marquee
      const row = all.length >= 4 ? [...all, ...all] : all;
      return (
        <section className={cn("overflow-hidden", bgClass(bg), "py-10")}>
          <div className="mx-auto mb-5 max-w-[1400px] px-5 md:px-9">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-dim">{s(d.label)}</span>
          </div>
          <div className="group relative flex w-full select-none overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
            {[0, 1].map((r) => (
              <div key={r} aria-hidden={r === 1} className="animate-marquee flex shrink-0 items-center gap-14 pr-14 group-hover:[animation-play-state:paused]">
                {row.map((c, i) => (
                  c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={c.image} alt={c.name} className="h-9 w-auto shrink-0 object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  ) : (
                    <span key={i} className="whitespace-nowrap text-[15px] font-medium text-ink-muted">{c.name}</span>
                  )
                ))}
              </div>
            ))}
          </div>
        </section>
      );
    }

    /* ── CTA ──────────────────────────────────────────────── */
    case "cta":
      return (
        <section className={cn("relative overflow-hidden border-t border-line px-5 py-24 md:px-9", bgClass(s(d.bg, "surface") as BlockBg))}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_40%,rgba(192,15,10,0.16),transparent_55%)] [animation:vp-breathe_11s_ease-in-out_infinite]" />
          <Reveal className="relative mx-auto max-w-[1100px] text-center">
            <h2 className="text-[clamp(2.2rem,4.4vw,3.5rem)] font-bold leading-tight text-ink">{s(d.title)}</h2>
            {s(d.text) ? <p className="mx-auto mt-4 max-w-xl text-[18px] text-ink-muted">{s(d.text)}</p> : null}
            <div className="mt-9 flex flex-wrap justify-center gap-3.5">
              <Link href={s(d.buttonHref, "/poptavkovy-formular/")} className="group inline-flex items-center gap-3 border border-red bg-red px-7 py-4 text-[13px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-dark">
                {s(d.buttonLabel, "Konzultace zdarma")} <ArrowSwap />
              </Link>
              <a href={company.phoneHref} className="inline-flex items-center gap-3 border border-line-strong px-6 py-4 text-[13px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:border-white hover:bg-white/5">
                <Phone size={15} /> {company.phone}
              </a>
            </div>
          </Reveal>
        </section>
      );

    /* ── LEAD FORM ────────────────────────────────────────── */
    case "leadform":
      return (
        <section className={band(bg)}>
          <div className="mx-auto grid max-w-[1100px] items-center gap-12 lg:grid-cols-2">
            <div>
              <SectionHead eyebrow={s(d.eyebrow)} title={s(d.title)} accent={s(d.accent)} sub={s(d.sub)} />
              <div className="mt-7 flex flex-col gap-2.5 text-[15px] text-ink-muted">
                <a href={company.phoneHref} className="flex items-center gap-2.5 hover:text-red-bright"><Phone size={16} className="text-red" /> {company.phone}</a>
                <a href={`mailto:${company.email}`} className="flex items-center gap-2.5 hover:text-red-bright"><Mail size={16} className="text-red" /> {company.email}</a>
              </div>
            </div>
            <Reveal delay={0.1}><LeadForm source="page" withMessage t={t} /></Reveal>
          </div>
        </section>
      );

    /* ── SPACER ───────────────────────────────────────────── */
    case "spacer": {
      const size = s(d.size, "m");
      return <div aria-hidden className={size === "s" ? "h-10" : size === "l" ? "h-32" : "h-20"} />;
    }

    default:
      return null;
  }
}
