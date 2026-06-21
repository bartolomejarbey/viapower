import { Phone, Mail } from "lucide-react";
import { FadeIn, MaskRise, Reveal } from "@/components/ui/motion";
import { Eyebrow, Accent } from "@/components/ui/primitives";
import { LeadForm } from "@/components/site/lead-form";
import type { Company } from "@/lib/company";

export function Contact({ t, company }: { t?: Record<string, string>; company: Company }) {
  const title = t?.["cta.title"] || "Spočítáme vaši úsporu.";
  const sub =
    t?.["cta.sub"] ||
    "Zanechte nám kontakt. Ozveme se vám do 24 hodin a probereme spotřebu, střechu a možnosti dotace. Konzultace zdarma a bez závazku.";
  const words = title.split(" ");
  const head = words.slice(0, -1).join(" ");
  const tail = words[words.length - 1];
  return (
    <section id="kontakt" className="relative overflow-hidden border-t border-line bg-surface px-5 py-32 md:px-9">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(192,15,10,0.18),transparent_50%)] [animation:vp-breathe_11s_ease-in-out_infinite]" />
      <div className="relative mx-auto grid max-w-[1280px] items-center gap-16 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <Eyebrow>
            <span data-edit="ct.eb" suppressContentEditableWarning>{t?.["ct.eb"] || "nezávazná poptávka"}</span>
          </Eyebrow>
          <h2 className="mt-5 text-[clamp(2.6rem,5.2vw,4.75rem)] font-bold leading-[0.98] text-ink">
            <MaskRise delay={0.15}>
              <span data-edit="cta.title" suppressContentEditableWarning>
                {head} <Accent>{tail}</Accent>
              </span>
            </MaskRise>
          </h2>
          <FadeIn delay={0.35}>
            <p className="mt-5 max-w-md text-[19px] leading-relaxed text-white/80" data-edit="cta.sub" suppressContentEditableWarning>
              {sub}
            </p>
          </FadeIn>
          <Reveal delay={0.45}>
            <div className="mt-9 flex flex-wrap gap-3.5">
              <a href={company.phoneHref} className="group relative inline-flex items-center gap-3 overflow-hidden border border-red bg-red px-7 py-4 font-mono text-[13px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:text-red">
                <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
                <Phone size={15} /> {company.phone}
              </a>
              <a href={`mailto:${company.email}`} className="inline-flex items-center gap-3 border border-line-strong px-6 py-4 font-mono text-[13px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:border-white hover:bg-white/5">
                <Mail size={15} /> {company.email}
              </a>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <LeadForm source="homepage" t={t} />
        </Reveal>
      </div>
    </section>
  );
}
