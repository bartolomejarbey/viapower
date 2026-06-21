import { DigitRoll, Stagger, StaggerItem } from "@/components/ui/motion";
import { MiniBars } from "@/components/ui/mini-bars";
import { T, tx } from "@/components/site/t";
import type { Company } from "@/lib/company";

/** Split an editable stat string ("500+", "4,9/5", "15") into number + suffix for DigitRoll. */
function parseStat(raw: string, fallbackSuffix: string): { to: number; decimals: number; suffix: string } {
  const m = raw.trim().match(/^([\d.,]+)(.*)$/);
  if (!m) return { to: 0, decimals: 0, suffix: raw };
  const numStr = m[1].replace(",", ".");
  const to = parseFloat(numStr) || 0;
  const decimals = numStr.includes(".") ? (numStr.split(".")[1]?.length ?? 0) : 0;
  return { to, decimals, suffix: m[2] || fallbackSuffix };
}

export function Stats({ t, company }: { t?: Record<string, string>; company: Company }) {
  const STATS = [
    { key: "st1", label: "realizace", desc: "Nainstalovaných systémů", ...parseStat(company.stats.installations, "+") },
    { key: "st2", label: "zkušenosti", desc: "V oblasti energetiky", ...parseStat(company.stats.experienceYears, " let") },
    { key: "st3", label: "kvalita", desc: "Průměrné hodnocení", ...parseStat(company.stats.rating, "/5") },
    { key: "st4", label: "úspěšnost", desc: "Při vyřizování dotací", ...parseStat(company.stats.grantSuccess, "%") },
  ];
  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-9">
        <Stagger className="grid grid-cols-2 border border-line-strong lg:grid-cols-4">
          {STATS.map((s, i) => (
            <StaggerItem key={s.key} className="border-b border-line lg:border-b-0 lg:border-r lg:last:border-r-0">
              <div className="group flex h-full flex-col p-8 transition-colors hover:bg-red-soft sm:p-9">
                <span className="mb-3.5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-dim">
                  <span className="h-1.5 w-1.5 bg-red" />
                  <T k={`${s.key}.l`}>{tx(t, `${s.key}.l`, s.label)}</T>
                </span>
                <div className="text-[clamp(2.6rem,4vw,3.5rem)] font-bold leading-none tracking-tight text-ink [font-variant-numeric:tabular-nums]">
                  <DigitRoll to={s.to} decimals={s.decimals ?? 0} suffix={s.suffix} />
                </div>
                <T as="p" k={`${s.key}.d`} className="mt-2 block text-[13px] font-medium text-ink-muted">
                  {tx(t, `${s.key}.d`, s.desc)}
                </T>
                <MiniBars pattern={i} className="mt-5 opacity-60 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
