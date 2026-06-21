import { FaqAccordion, type FaqItem } from "@/components/ui/faq-accordion";
import { SectionHeading } from "@/components/ui/primitives";
import { T, tx } from "@/components/site/t";

const DEFAULT_FAQ: FaqItem[] = [
  {
    q: "Jak velkou FVE bychom si měli zvolit?",
    a: "Velikost závisí na vaší spotřebě a ploše střechy. Doporučujeme mírně předimenzovat — větší FVE vyrobí víc i v horších podmínkách, přebytky můžete prodat a snížit tak návratnost.",
  },
  {
    q: "Mohu zálohovat celý dům včetně elektrického topení?",
    a: "Zálohovat celý dům včetně elektrického kotle nedoporučujeme — systém by se mohl přetížit. Můžete však vyčlenit kotel a zálohovat celý zbytek domácnosti.",
  },
  {
    q: "Jaké jsou podmínky pro získání dotace?",
    a: "Systémy do 10 kWp, maximální dotace 160 000 Kč. Objekt musí sloužit z více než poloviny k trvalému bydlení, mít nejvýše 3 bytové jednotky a žadatel nesmí dlužit na sociálním pojištění.",
  },
  {
    q: "Mohu přebytky elektřiny prodávat?",
    a: "Ano. Od 1. 1. 2023 si můžete u distribuční soustavy zařídit výrobní EAN a dohodnout výkup přebytků u některého z obchodníků.",
  },
  {
    q: "Jaké jsou záruky na jednotlivé komponenty?",
    a: "Panely: 20 let mechanika, 30 let na výkon 82,4 %. Baterie: 10 let. Střídače: 5 nebo 10 let podle typu. Montážní práce a kabely: 2 roky.",
  },
];

export function Faq({ t }: { t?: Record<string, string> }) {
  const items = DEFAULT_FAQ.map((it, i) => ({
    q: tx(t, `fq.${i}.q`, it.q),
    a: tx(t, `fq.${i}.a`, it.a),
  }));

  return (
    <section id="faq" className="px-5 py-28 md:px-9 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <SectionHeading
          center
          eyebrow={<T k="fq.eb">{tx(t, "fq.eb", "časté dotazy")}</T>}
          title={<T k="fq.title">{tx(t, "fq.title", "Než nám zavoláte.")}</T>}
          sub={<T k="fq.sub">{tx(t, "fq.sub", "Odpovědi na nejčastější otázky. Něco vám tu chybí? Napište nám — odpovíme do hodiny.")}</T>}
        />
        <div className="mt-12">
          <FaqAccordion items={items} editPrefix="fq" />
        </div>
      </div>
    </section>
  );
}
