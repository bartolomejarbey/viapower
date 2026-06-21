import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TickIn, MaskRise, FadeIn } from "@/components/ui/motion";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 font-mono text-[11.5px] font-semibold uppercase tracking-[0.18em] text-red-bright",
        className,
      )}
    >
      <TickIn className="w-6" />
      <FadeIn inline delay={0.05}>
        {children}
      </FadeIn>
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  center,
  className,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", center && "mx-auto text-center", className)}>
      <Eyebrow className={center ? "justify-center" : ""}>{eyebrow}</Eyebrow>
      <h2 className="mt-5 text-[clamp(2.6rem,5.2vw,4.75rem)] font-bold leading-[0.98] text-ink">
        <MaskRise delay={0.15} className="text-balance">
          {title}
        </MaskRise>
      </h2>
      {sub && (
        <FadeIn delay={0.35}>
          <p className={cn("mt-5 max-w-2xl text-[18px] leading-relaxed text-ink-muted", center && "mx-auto")}>{sub}</p>
        </FadeIn>
      )}
    </div>
  );
}

/** Red accent word inside a heading. */
export function Accent({ children }: { children: ReactNode }) {
  return <span className="text-red">{children}</span>;
}

/** Arrow conveyor: first arrow exits right, its twin enters from the left. */
export function ArrowSwap({ size = 14 }: { size?: number }) {
  return (
    <span className="relative inline-block size-3.5 overflow-hidden" aria-hidden>
      <ArrowRight size={size} className="transition-transform duration-300 group-hover:translate-x-[150%]" />
      <ArrowRight
        size={size}
        className="absolute inset-0 -translate-x-[150%] transition-transform delay-75 duration-300 group-hover:translate-x-0"
      />
    </span>
  );
}

export function BtnRed({
  href,
  children,
  className,
  icon = true,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  icon?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex items-center gap-3 overflow-hidden border border-red bg-red px-7 py-4 font-mono text-[13px] font-bold uppercase tracking-[0.1em] text-white transition-colors duration-300 hover:border-white hover:text-red",
        className,
      )}
    >
      <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" aria-hidden />
      {children}
      {icon && <ArrowSwap />}
    </Link>
  );
}

export function BtnOutline({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-3 border border-line-strong px-6 py-4 font-mono text-[13px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:border-white hover:bg-white/5",
        className,
      )}
    >
      {children}
    </Link>
  );
}
