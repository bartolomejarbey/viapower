"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { ArrowRight, ChevronDown, Menu, Phone, X } from "lucide-react";
import { logoPath, primaryNav, type NavLink } from "@/config/site";
import { ArrowSwap } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export function SiteNav({ extraNav = [], phone, phoneHref, cta = "Konzultace", ctaHref = "/poptavkovy-formular/" }: { extraNav?: NavLink[]; phone: string; phoneHref: string; cta?: string; ctaHref?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const nav = [...primaryNav, ...extraNav];

  // red telemetry hairline — the site's single scroll-progress readout
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progressSpring = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });
  const progressX = reduce ? scrollYProgress : progressSpring;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // lock scroll while mobile menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-line backdrop-blur-xl transition-all duration-300",
        scrolled ? "bg-base/95 py-2.5" : "bg-base/80 py-4",
      )}
    >
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-5 md:px-9">
        <Link href="/" className="shrink-0" aria-label="Viapower — domů">
          {/* black source logo, inverted to white for the dark brand */}
          <img
            src={logoPath}
            alt="Viapower"
            className="h-7 w-auto [filter:brightness(0)_invert(1)]"
          />
        </Link>

        <ul className="hidden items-center gap-0.5 lg:flex">
          {nav.map((item) => (
            <li key={item.href} className="group relative">
              <Link
                href={item.href}
                className={cn(
                  "group/link flex items-center gap-1 px-3.5 py-2.5 font-mono text-[13px] font-medium transition-colors duration-200",
                  pathname === item.href ? "text-red-bright" : "text-ink-muted hover:text-red-bright",
                )}
              >
                <span className="u-draw pb-0.5">{item.label}</span>
                {item.children && <ChevronDown size={13} className="mt-0.5 transition-transform group-hover:rotate-180" />}
              </Link>

              {item.children && (
                <div className="invisible absolute left-0 top-full w-72 translate-y-1 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <div className="brackets border border-line-strong bg-card p-2 shadow-2xl">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-3 py-2.5 transition-colors hover:bg-red-soft"
                      >
                        <span className="block text-[14px] font-semibold text-ink">{child.label}</span>
                        {child.desc && <span className="mt-0.5 block font-mono text-[11px] text-ink-dim">{child.desc}</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3.5">
          <a href={phoneHref} className="hidden items-center gap-2 font-mono text-[13px] font-medium text-white/85 hover:text-white md:flex">
            <Phone size={14} className="text-red" /> {phone}
          </a>
          <Link
            href={ctaHref}
            className="group relative hidden items-center gap-2.5 overflow-hidden border border-red bg-red px-5 py-3 font-mono text-[12.5px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:border-white hover:text-red sm:inline-flex"
          >
            <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
            {cta}
            <ArrowSwap size={13} />
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="grid h-10 w-10 place-items-center text-ink lg:hidden"
            aria-label="Otevřít menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>

      {/* red telemetry hairline — sits exactly on the border-b */}
      <motion.div
        aria-hidden
        style={{ scaleX: progressX }}
        className="absolute inset-x-0 -bottom-px h-[2px] origin-left bg-red"
      />

      {/* mobile drawer */}
      {open && <MobileMenu nav={nav} phone={phone} phoneHref={phoneHref} cta={cta} ctaHref={ctaHref} onClose={() => setOpen(false)} />}
    </header>
  );
}

function MobileMenu({ nav, phone, phoneHref, cta, ctaHref, onClose }: { nav: NavLink[]; phone: string; phoneHref: string; cta: string; ctaHref: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col border-l border-line-strong bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <img src={logoPath} alt="Viapower" className="h-6 w-auto [filter:brightness(0)_invert(1)]" />
          <button onClick={onClose} className="grid h-10 w-10 place-items-center text-ink" aria-label="Zavřít menu">
            <X size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {nav.map((item) => (
            <div key={item.href} className="border-b border-line/60">
              <Link
                href={item.href}
                onClick={onClose}
                className="block px-3 py-3.5 font-mono text-[15px] text-ink hover:text-red-bright"
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="pb-2 pl-5">
                  {item.children.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      onClick={onClose}
                      className="block py-2 text-[14px] text-ink-muted hover:text-red-bright"
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="border-t border-line p-4">
          <a href={phoneHref} className="mb-3 flex items-center justify-center gap-2 font-mono text-sm text-ink">
            <Phone size={15} className="text-red" /> {phone}
          </a>
          <Link
            href={ctaHref}
            onClick={onClose}
            className="flex items-center justify-center gap-2 bg-red px-5 py-3.5 font-mono text-[12.5px] font-bold uppercase tracking-[0.1em] text-white"
          >
            {cta} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
