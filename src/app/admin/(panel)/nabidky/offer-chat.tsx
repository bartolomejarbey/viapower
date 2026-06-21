"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, Send, ArrowLeft, AlertTriangle, Check, Eye, Pencil, Download, Bot, User } from "lucide-react";
import { btnPrimary } from "@/components/admin/ui";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING =
  "Dobrý den! Pomůžu vám sestavit cenovou nabídku přímo tady v chatu. 🙂\n\nZačněme tím nejdůležitějším: jde o **fotovoltaiku, tepelné čerpadlo, klimatizaci** nebo kombinaci? Pro koho nabídku děláme (jméno investora) a kam (místo realizace)?";

export function OfferChat() {
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading || doneId) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/nabidky/chat/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const d = await res.json().catch(() => null);
      if (!res.ok || !d?.ok) {
        setError(res.status === 401 ? "Přihlášení vypršelo." : d?.error ? `Chyba: ${String(d.error).slice(0, 140)}` : "Chatbot neodpověděl. Zkuste to znovu.");
        return;
      }
      setMessages([...next, { role: "assistant", content: d.reply }]);
      setMissing(Array.isArray(d.missing) ? d.missing : []);
      if (d.ready && d.offerId) { setDoneId(d.offerId); setMissing([]); }
    } catch {
      setError("Spojení selhalo — zkontrolujte připojení.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMessages([{ role: "assistant", content: GREETING }]);
    setMissing([]); setDoneId(null); setError(""); setInput("");
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/nabidky/" className="grid h-9 w-9 place-items-center border border-line-strong text-ink-muted hover:border-white hover:text-ink" aria-label="Zpět"><ArrowLeft size={16} /></Link>
          <div>
            <h1 className="flex items-center gap-2 text-[19px] font-bold text-ink"><Sparkles size={18} className="text-red" /> Nabídka přes chat</h1>
            <p className="text-[12px] text-ink-dim">Popište zakázku v běžné řeči — asistent se doptá na vše potřebné a sestaví nabídku.</p>
          </div>
        </div>
        {doneId && <button onClick={reset} className="border border-line-strong px-3.5 py-2 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted hover:border-red hover:text-ink">Nová nabídka</button>}
      </div>

      {/* must-have warning strip */}
      {missing.length > 0 && !doneId && (
        <div className="mb-3 flex items-start gap-2 border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-[12.5px] text-ink-muted">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-400" />
          <span><b className="text-ink">Ještě chybí:</b> {missing.join(" · ")}</span>
        </div>
      )}

      {/* messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto border border-line-strong bg-card p-5">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center ${m.role === "user" ? "bg-red text-white" : "border border-red bg-red-soft text-red"}`}>
              {m.role === "user" ? <User size={15} /> : <Bot size={15} />}
            </span>
            <div className={`max-w-[80%] whitespace-pre-wrap px-4 py-2.5 text-[14px] leading-relaxed ${m.role === "user" ? "bg-elevated text-ink" : "bg-base text-ink-muted"}`}>
              {renderMd(m.content)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center border border-red bg-red-soft text-red"><Bot size={15} /></span>
            <div className="px-4 py-2.5"><Loader2 size={16} className="animate-spin text-ink-dim" /></div>
          </div>
        )}

        {doneId && (
          <div className="border border-success/40 bg-success/10 p-5">
            <div className="flex items-center gap-2 text-[15px] font-bold text-ink"><Check size={18} className="text-success" /> Nabídka je hotová!</div>
            <p className="mt-1 text-[13px] text-ink-muted">Můžete ji doladit v editoru, prohlédnout nebo stáhnout jako PDF.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/admin/nabidky/${doneId}/`} className={btnPrimary}><Pencil size={14} /> Upravit</Link>
              <a href={`/nabidka/${doneId}/`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 border border-line-strong px-4 py-2.5 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted hover:border-white hover:text-ink"><Eye size={14} /> Náhled</a>
              <a href={`/api/nabidky/${doneId}/pdf/`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 border border-line-strong px-4 py-2.5 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted hover:border-white hover:text-ink"><Download size={14} /> PDF</a>
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-red-bright"><AlertTriangle size={15} /> {error}</p>}

      {/* input */}
      {!doneId && (
        <div className="mt-3 flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={2}
            placeholder="Napište zprávu… (např. „FVE 9,9 kWp pro pana Nováka v Roztokách, baterie 15 kWh GoodWe, ceny doplň orientačně“)"
            className="min-h-[44px] flex-1 resize-none border border-line-strong bg-base px-3.5 py-3 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-dim focus:border-red"
          />
          <button onClick={send} disabled={loading || !input.trim()} className="grid h-[52px] w-[52px] shrink-0 place-items-center bg-red text-white transition-colors hover:bg-red-dark disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      )}
    </div>
  );
}

/** Minimal **bold** rendering for chat bubbles. */
function renderMd(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i} className="text-ink">{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>,
  );
}
