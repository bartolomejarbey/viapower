import { Phone } from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import { BtnRed, BtnOutline, Accent } from "@/components/ui/primitives";
import { getSettings } from "@/lib/cms";
import { getCompany } from "@/lib/company";

export async function CtaBand({
  title,
  sub,
}: {
  title?: React.ReactNode;
  sub?: React.ReactNode;
}) {
  const [t, company] = await Promise.all([getSettings(), getCompany()]);
  return (
    <section className="relative overflow-hidden border-t border-line bg-surface px-5 py-24 md:px-9">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_40%,rgba(192,15,10,0.16),transparent_55%)]" />
      <Reveal className="relative mx-auto max-w-[1100px] text-center">
        <h2 className="text-[clamp(2.2rem,4.4vw,3.5rem)] font-bold leading-tight text-ink">
          {title ?? (
            <>
              <span data-edit="cb.t1" suppressContentEditableWarning>{t["cb.t1"] || "Spočítáme"}</span>{" "}
              <Accent>
                <span data-edit="cb.acc" suppressContentEditableWarning>{t["cb.acc"] || "vaši úsporu."}</span>
              </Accent>
            </>
          )}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[18px] text-ink-muted" data-edit={sub ? undefined : "cb.sub"} suppressContentEditableWarning>
          {sub ?? (t["cb.sub"] || "Konzultace zdarma a bez závazku. Ozveme se vám do 24 hodin.")}
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3.5">
          <BtnRed href="/poptavkovy-formular/"><span data-edit="cb.btn" suppressContentEditableWarning>{t["cb.btn"] || "Konzultace zdarma"}</span></BtnRed>
          <BtnOutline href={company.phoneHref}>
            <Phone size={15} /> {company.phone}
          </BtnOutline>
        </div>
      </Reveal>
    </section>
  );
}
