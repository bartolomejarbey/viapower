import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import type { ContentPackage } from "@/lib/content";
import { cn } from "@/lib/utils";

/** Product variant cards extracted from page content (VIAPOWER LOW/HIGH/ULTRA…). */
export function PackageCards({ packages, t }: { packages: ContentPackage[]; t?: Record<string, string> }) {
  const tt = (k: string, f: string) => t?.[k] ?? f;
  const cols = packages.length >= 3 ? "lg:grid-cols-3" : packages.length === 2 ? "lg:grid-cols-2" : "";
  return (
    <Stagger className={cn("grid gap-4", cols)}>
      {packages.map((p) => (
        <StaggerItem key={p.name} className="h-full">
          <div
            className={cn(
              "brackets group relative flex h-full flex-col border p-8 transition-all duration-300 hover:-translate-y-1",
              p.featured ? "border-red bg-elevated" : "brackets-draw border-line-strong bg-card hover:border-red",
            )}
          >
            <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-red-bright">
              <span className="h-2 w-2 bg-red" /> {p.name}
              {p.featured && <span className="ml-1 normal-case tracking-normal text-ink-dim">· {tt("pkg.badge", "doporučujeme")}</span>}
            </span>
            {p.tagline && <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">{p.tagline}</p>}
            <ul className="mt-5 flex-1 border-t border-line pt-4">
              {p.specs.map(([k, v]) => (
                <li
                  key={k}
                  className="flex items-center justify-between gap-4 border-b border-dashed border-line py-2.5 text-[13.5px] text-ink-muted last:border-0"
                >
                  <span>{k}</span>
                  <span className="text-right font-semibold text-ink">{v}</span>
                </li>
              ))}
            </ul>
            <Link
              href={p.href || "/poptavkovy-formular/"}
              className="mt-6 flex items-center justify-between border border-line-strong px-4 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:border-red hover:bg-red hover:text-white"
            >
              {tt("pkg.cta", "Více informací")} <ArrowRight size={14} />
            </Link>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
