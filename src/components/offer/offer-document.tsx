import { Fragment } from "react";
import {
  Zap, LayoutGrid, BatteryCharging, Cpu, Sun, Check,
  Phone, Mail, MapPin, CalendarClock, User,
} from "lucide-react";
import { computeTotals, type Offer } from "@/lib/offers/schema";
import { formatCZK, formatNumber } from "@/lib/utils";
import { company, logoPath } from "@/config/site";

function renderBold(s: string, keyBase: string) {
  return s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={`${keyBase}-${i}`}>{part.slice(2, -2)}</strong> : <span key={`${keyBase}-${i}`}>{part}</span>,
  );
}
function RichText({ text }: { text: string }) {
  return <>{text.split(/\n\n+/).map((para, i) => <p key={i}>{renderBold(para, `p${i}`)}</p>)}</>;
}

function Sec({ n, title }: { n: string; title: string }) {
  return (
    <div className="sec">
      <div className="sec-band" />
      <div className="sec-txt">
        <span className="sec-num">{n}</span>
        <span className="sec-title">{title}</span>
      </div>
    </div>
  );
}

function Foot({ pg }: { pg: number }) {
  return (
    <div className="offer-foot">
      <span><b>{company.legalName}</b> · {company.address.street}, {company.address.zip} {company.address.city} · IČ {company.ico}</span>
      <span>{company.phone} · {company.email}</span>
      <span className="pg">{String(pg).padStart(2, "0")}</span>
    </div>
  );
}

const fmtDate = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("cs-CZ");
};

export function OfferDocument({ offer }: { offer: Offer }) {
  const { subtotal, vat, total } = computeTotals(offer.budget);
  const sys = offer.system ?? {};

  const metrics: { icon: typeof Zap; value: string; unit: string; label: string }[] = [];
  if (sys.powerKwp) metrics.push({ icon: Zap, value: formatNumber(sys.powerKwp, 2), unit: "kWp", label: "Instalovaný výkon" });
  if (sys.panels?.count) metrics.push({ icon: LayoutGrid, value: String(sys.panels.count), unit: "ks", label: `Panely ${sys.panels.brand ?? ""} ${sys.panels.wattPeak ?? ""} Wp`.replace(/\s+/g, " ").trim() });
  if (sys.battery?.capacityKwh) metrics.push({ icon: BatteryCharging, value: String(sys.battery.capacityKwh), unit: "kWh", label: `Baterie ${sys.battery.model ?? ""}`.trim() });
  if (sys.inverter?.model) metrics.push({ icon: Cpu, value: sys.inverter.kw ? String(sys.inverter.kw) : "1", unit: sys.inverter.kw ? "kW" : "ks", label: `Střídač ${sys.inverter.model}` });
  if (sys.panels?.count && sys.panels.wattPeak) metrics.push({ icon: Sun, value: formatNumber((sys.panels.count * sys.panels.wattPeak) / 1000, 1), unit: "kWp", label: "Celkový výkon panelů" });

  const metaCells = [
    offer.investor.name && { k: "Investor", v: offer.investor.name },
    offer.location && { k: "Místo realizace", v: offer.location },
    offer.validUntil && { k: "Platnost nabídky", v: `do ${offer.validUntil}` },
    (offer.createdAt || offer.number) && { k: "Vystaveno", v: [offer.number, fmtDate(offer.createdAt)].filter(Boolean).join(" · ") },
  ].filter(Boolean) as { k: string; v: string }[];

  const mgrInitials = offer.manager.name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  return (
    <div className="offer-root">
      {/* ── PAGE 1 · COVER ── */}
      <section className="offer-page cover">
        <div className="cover-img" />
        <div className="cover-grad" />
        <header className="cover-head">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="cover-logo" src={logoPath} alt="Viapower" />
          <span className="cover-eyebrow">Cenová nabídka{offer.number ? ` · ${offer.number}` : ""}</span>
        </header>
        <div className="cover-body">
          <span className="cover-kicker"><span className="dot" /> Energetika na klíč</span>
          <h1 className="cover-h1">Cenová<br /><span className="accent">nabídka.</span></h1>
          <p className="cover-sub">{offer.subject}</p>
        </div>
        {metaCells.length > 0 && (
          <div className="cover-meta">
            {metaCells.map((c, i) => (
              <div className="cover-cell" key={i}>
                <div className="k">{c.k}</div>
                <div className="v">{c.v}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── PAGE 2 · SOLUTION ── */}
      <section className="offer-page">
        <div className="offer-pad">
          <Sec n="01 — TECHNOLOGIE" title="Vaše řešení" />
          <div className="lead"><RichText text={offer.technology.summary} /></div>
          {offer.technology.bullets && offer.technology.bullets.length > 0 && (
            <ul className="bullets">{offer.technology.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
          )}
          {metrics.length > 0 && (
            <div className="metrics">
              {metrics.map((m, i) => (
                <div className="metric" key={i}>
                  <m.icon className="ic" size={22} strokeWidth={1.8} />
                  <div className="val">{m.value}<span className="u">{m.unit}</span></div>
                  <div className="lbl">{m.label}</div>
                </div>
              ))}
            </div>
          )}
          {offer.technology.annualProductionMWh && (
            <div className="highlight">
              <div className="t">Předpokládaná roční výroba elektřiny z navržené elektrárny pokryje podstatnou část vaší spotřeby a začne šetřit od prvního dne.</div>
              <div className="n">cca {offer.technology.annualProductionMWh}<span className="u">MWh / rok</span></div>
            </div>
          )}
        </div>
        <Foot pg={2} />
      </section>

      {/* ── PAGE 3 · INVESTMENT ── */}
      <section className="offer-page">
        <div className="offer-pad">
          <Sec n="02 — KALKULACE" title="Investice" />
          {(offer.budget.installedPowerKwp != null || offer.budget.batteryKwh != null) && (
            <div className="proj-meta">
              {offer.budget.installedPowerKwp != null && (
                <span className="chip"><Zap className="ic" size={14} /> Výkon <b>{formatNumber(offer.budget.installedPowerKwp, 2)} kWp</b></span>
              )}
              {offer.budget.batteryKwh != null && (
                <span className="chip"><BatteryCharging className="ic" size={14} /> Baterie <b>{offer.budget.batteryKwh} kWh</b></span>
              )}
            </div>
          )}
          <table className="btable">
            <thead><tr><td>Položka</td><td className="num">Počet</td><td className="num">Cena bez DPH</td></tr></thead>
            <tbody>
              {offer.budget.groups.map((g, gi) => (
                <Fragment key={`g-${gi}`}>
                  <tr className="grp"><td colSpan={3}><span>{g.title}</span></td></tr>
                  {g.items.map((it, ii) => (
                    <tr className="item" key={`g-${gi}-i-${ii}`}>
                      <td><span className="name">{it.name}</span>{it.detail ? <div className="detail">{it.detail}</div> : null}</td>
                      <td className="num">{it.qty}</td>
                      <td className="num">{formatCZK(it.priceNoVat)}</td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>

          {offer.budget.included && offer.budget.included.length > 0 && (
            <div className="included">
              <div className="h">V ceně zahrnuto</div>
              <div className="tags">{offer.budget.included.map((x, i) => <span className="tag" key={i}>{x}</span>)}</div>
            </div>
          )}

          <div className="price">
            <div className="row sub"><span>Cena celkem bez DPH</span><span className="num">{formatCZK(subtotal)}</span></div>
            <div className="row sub"><span>DPH {offer.budget.vatRate} %</span><span className="num">{formatCZK(vat)}</span></div>
            <div className="grand">
              <div><div className="gl">Cena celkem s DPH</div></div>
              <div className="gv">{formatCZK(total)}</div>
            </div>
          </div>

          {offer.addons && offer.addons.length > 0 && (
            <div className="addons">
              <Sec n="VOLITELNĚ" title="Doplňkové možnosti" />
              {offer.addons.map((a, i) => (
                <div className="addon" key={i}><b>{a.name}</b><span className="p">{formatCZK(a.priceWithVat)} s DPH</span></div>
              ))}
            </div>
          )}
        </div>
        <Foot pg={3} />
      </section>

      {/* ── PAGE 4 · PROCESS ── */}
      <section className="offer-page">
        <div className="offer-pad">
          <Sec n="03 — POSTUP" title="Jak to probíhá" />
          <ol className="timeline">
            {offer.process.map((s, i) => (
              <li className="tl" key={i}><span className="n">{i + 1}</span><div className="ttl">{s}</div></li>
            ))}
          </ol>
        </div>
        <Foot pg={4} />
      </section>

      {/* ── PAGE 5 · WHY + CONTACT + CLOSE ── */}
      <section className="offer-page">
        <div className="offer-pad">
          <Sec n="04 — ZÁRUKY" title="Proč Viapower" />
          <ul className="why">
            {offer.whyUs.map((w, i) => <li key={i}><Check className="ic" size={15} strokeWidth={2.4} /> {w}</li>)}
          </ul>
          <div className="pm">
            <div className="av">{mgrInitials || <User size={18} />}</div>
            <div>
              <div className="name">{offer.manager.name}</div>
              <div className="role">{offer.manager.role}</div>
              <div className="c">
                <span><Phone className="ic" size={14} /> {offer.manager.phone}</span>
                <span><Mail className="ic" size={14} /> {offer.manager.email}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="close-band">
          <div className="close-img" />
          <div className="close-grad" />
          <div className="inner">
            <div className="big">Pojďme vám vyrobit<br /><span className="accent">vlastní energii.</span></div>
            <div className="meta">
              <span><Phone className="ic" size={15} /> {company.phone}</span>
              <span><Mail className="ic" size={15} /> {company.email}</span>
              <span><MapPin className="ic" size={15} /> viapower.cz</span>
              {offer.validUntil && <span><CalendarClock className="ic" size={15} /> Platnost do {offer.validUntil}</span>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
