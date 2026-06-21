import Link from "next/link";
import { ParallaxY, Stagger, StaggerItem } from "@/components/ui/motion";
import { SectionHeading, Accent, ArrowSwap } from "@/components/ui/primitives";
import { T, tx } from "@/components/site/t";
import { cn } from "@/lib/utils";

type Tile = { img: string; label: string; title: string; span: string };

const TILES: Tile[] = [
  { img: "/img/real/install-7.jpg", label: "veřejný sektor · 2024", title: "ZŠ a MŠ Praha-Koloděje · 42 kWp", span: "sm:col-span-2 sm:row-span-2" },
  { img: "/img/real/install-8.jpg", label: "komerční · 2024", title: "Mountfield · 120 kWp", span: "sm:col-span-2" },
  { img: "/img/real/tremosna.jpg", label: "rodinný dům", title: "Třemošná · FVE + baterie + wallbox", span: "sm:col-span-1" },
  { img: "/img/real/install-1.jpg", label: "obec · 2024", title: "ČOV Svémyslice", span: "sm:col-span-2" },
  { img: "/img/real/install-5.jpg", label: "rodinný dům · 2024", title: "Chytrá domácnost na míru", span: "sm:col-span-2" },
];

export function Gallery({ t }: { t?: Record<string, string> }) {
  return (
    <section id="realizace" className="border-y border-line bg-surface px-5 py-28 md:px-9 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow={<T k="gl.eb">{tx(t, "gl.eb", "realizace")}</T>}
            title={
              <>
                <T k="gl.t1">{tx(t, "gl.t1", "Stovky")}</T>{" "}
                <Accent>
                  <T k="gl.acc">{tx(t, "gl.acc", "instalací.")}</T>
                </Accent>{" "}
                <T k="gl.t2">{tx(t, "gl.t2", "Tady jsou některé.")}</T>
              </>
            }
            sub={<T k="gl.sub">{tx(t, "gl.sub", "Od malých rodinných domů po veřejné instituce. Každý projekt na klíč včetně dotace, revize a servisního dohledu.")}</T>}
          />
          <Link
            href="/reference/"
            className="group group/link inline-flex items-center gap-2 font-mono text-[12.5px] font-bold uppercase tracking-[0.12em] text-red-bright"
          >
            <span className="u-draw pb-0.5" data-edit="gl.link" suppressContentEditableWarning>
              {tx(t, "gl.link", "Všechny reference")}
            </span>{" "}
            <ArrowSwap />
          </Link>
        </div>

        <Stagger className="mt-12 grid auto-rows-[180px] grid-cols-1 gap-3.5 sm:grid-cols-4">
          {TILES.slice(0, 3).map((tile, i) => (
            <GalleryTile key={i} index={i} tile={tile} t={t} />
          ))}

          <StaggerItem className="h-full min-h-0 sm:col-span-1">
            <div className="brackets flex h-full flex-col items-center justify-center bg-gradient-to-br from-red-dark to-red p-5 text-center">
              <span className="text-[42px] font-bold leading-none tracking-tight text-white" data-edit="gl.count" suppressContentEditableWarning>
                {tx(t, "gl.count", "500+")}
              </span>
              <span className="mt-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/90" data-edit="gl.countL" suppressContentEditableWarning>
                {tx(t, "gl.countL", "realizací")}
              </span>
            </div>
          </StaggerItem>

          {TILES.slice(3).map((tile, i) => (
            <GalleryTile key={i + 3} index={i + 3} tile={tile} t={t} />
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function GalleryTile({ tile, index, t }: { tile: Tile; index: number; t?: Record<string, string> }) {
  const img = tx(t, `gl.${index}.img`, tile.img);
  return (
    <StaggerItem className={cn("h-full min-h-0", tile.span)}>
      <Link
        href="/reference/"
        data-edit-img={`gl.${index}.img`}
        className="brackets brackets-draw group relative block h-full overflow-hidden border border-line-strong transition-transform duration-300 hover:-translate-y-1"
      >
        <ParallaxY range={tile.span.includes("row-span-2") ? 20 : 12} className="absolute -inset-y-10 inset-x-0">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url('${img}')` }}
          />
        </ParallaxY>
        <div className="absolute inset-0 bg-gradient-to-t from-base via-base/10 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-red-bright" data-edit={`gl.${index}.label`} suppressContentEditableWarning>
            {tx(t, `gl.${index}.label`, tile.label)}
          </span>
          <span className="mt-1 block text-[14px] font-bold text-white" data-edit={`gl.${index}.title`} suppressContentEditableWarning>
            {tx(t, `gl.${index}.title`, tile.title)}
          </span>
        </div>
      </Link>
    </StaggerItem>
  );
}
