const DEFAULT_CLIENTS = [
  "Mountfield a.s.",
  "ZŠ a MŠ Praha-Koloděje",
  "CB Auto a.s.",
  "ČOV Svémyslice",
  "Auto Dolanský s.r.o.",
  "Obec Němčice",
  "Obec Roprachtice",
];

function Row({ clients, hidden }: { clients: string[]; hidden?: boolean }) {
  return (
    <div
      className="animate-marquee flex shrink-0 items-center gap-14 pr-14 group-hover:[animation-play-state:paused]"
      aria-hidden={hidden}
    >
      {[...clients, ...clients].map((c, i) => (
        <span
          key={i}
          className="group/name inline-flex items-center gap-2 whitespace-nowrap font-mono text-[15px] font-medium text-ink-muted transition-colors duration-300 hover:text-ink"
        >
          <span aria-hidden className="h-1.5 w-1.5 scale-0 bg-red transition-transform duration-300 group-hover/name:scale-100" />
          {c}
        </span>
      ))}
    </div>
  );
}

export function LogosMarquee({ t }: { t?: Record<string, string> }) {
  // Admin-editable in Nastavení: one client name per line (or comma-separated).
  const raw = t?.["mq.clients"];
  const clients = raw && raw.trim() ? raw.split(/[\n,]+/).map((c) => c.trim()).filter(Boolean) : DEFAULT_CLIENTS;
  return (
    <section className="overflow-hidden border-y border-line bg-surface py-7">
      <div className="mx-auto mb-5 max-w-[1400px] px-5 md:px-9">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-dim" data-edit="mq.label" suppressContentEditableWarning>
          {t?.["mq.label"] || "Důvěřují nám firmy, obce i instituce"}
        </span>
      </div>
      <div className="group relative flex w-full select-none overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <Row clients={clients} />
        <Row clients={clients} hidden />
      </div>
    </section>
  );
}
