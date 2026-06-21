import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/primitives";
import { FadeIn, MaskRise } from "@/components/ui/motion";
import type { ReactNode } from "react";

export type Crumb = { label: string; href?: string };

export function PageHero({
  eyebrow,
  title,
  sub,
  crumbs,
  image,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  crumbs?: Crumb[];
  image?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line px-5 pb-20 pt-16 md:px-9 md:pb-28 md:pt-20">
      {image && (
        <>
          <div className="absolute inset-0 -z-20 scale-105 bg-cover bg-center opacity-25" style={{ backgroundImage: `url('${image}')` }} />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-base via-base/70 to-base/60" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-base via-base/40 to-transparent" />
        </>
      )}
      <div className="bg-grid bg-grid-mask absolute inset-0 -z-10 opacity-40" />
      <div className="pointer-events-none absolute -right-32 -top-40 -z-10 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(192,15,10,0.22),transparent_60%)] blur-2xl" />
      <div aria-hidden className="aurora absolute -bottom-32 left-1/4 -z-10 h-[420px] w-[420px] opacity-70" />
      <div className="mx-auto max-w-[1400px]">
        {crumbs && crumbs.length > 0 && (
          <nav className="mb-7 flex flex-wrap items-center gap-1.5 font-mono text-[11.5px] text-ink-dim">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={12} className="text-ink-dim/60" />}
                {c.href ? (
                  <Link href={c.href} className="hover:text-red-bright">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-ink-muted">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-4xl text-[clamp(2.4rem,5vw,4.5rem)] font-bold leading-[1.0] text-ink">
          <MaskRise delay={0.1} className="text-balance">
            {title}
          </MaskRise>
        </h1>
        {sub && (
          <FadeIn delay={0.3}>
            <p className="mt-5 max-w-2xl text-[18px] leading-relaxed text-ink-muted">{sub}</p>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
