"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Loader2 } from "lucide-react";

type State = "idle" | "loading" | "ok" | "error";

export function LeadForm({ source = "web", withMessage = false, t }: { source?: string; withMessage?: boolean; t?: Record<string, string> }) {
  const [state, setState] = useState<State>("idle");
  const reduce = useReducedMotion();
  const c = (k: string, f: string) => t?.[k] ?? f;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/lead/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          phone: form.get("phone"),
          email: form.get("email"),
          message: form.get("message") ?? "",
          source,
        }),
      });
      if (res.ok) {
        setState("ok");
        // Conversion signal for the marketing agency to trigger tags in GTM/GA/Ads/Meta.
        const w = window as Window & { dataLayer?: unknown[] };
        w.dataLayer?.push({ event: "lead_submitted", form_source: source });
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  if (state === "ok") {
    return (
      <div className="brackets flex flex-col items-center gap-4 border border-line-strong bg-card px-8 py-14 text-center">
        <motion.span
          initial={reduce ? false : { scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
          className="grid h-14 w-14 place-items-center border border-success/40 bg-success/10 text-success"
        >
          <Check size={26} />
        </motion.span>
        <h3 className="text-[22px] font-bold text-ink">{c("form.successTitle", "Děkujeme!")}</h3>
        <p className="max-w-xs text-[15px] text-ink-muted">{c("form.successText", "Ozveme se vám do 24 hodin a probereme spotřebu, střechu a možnosti dotace.")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="brackets border border-line-strong bg-card p-8 md:p-9">
      <h3 className="mb-6 flex items-center gap-2 font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-red-bright">
        <span className="h-2 w-2 bg-red" /> {c("form.title", "Poptávkový formulář")}
      </h3>
      <Field name="name" label={c("form.f.name", "Jméno")} type="text" placeholder="Jak vás máme oslovit?" />
      <Field name="phone" label={c("form.f.phone", "Telefon")} type="tel" placeholder="+420 ___ ___ ___" />
      <Field name="email" label={c("form.f.email", "E-mail")} type="email" placeholder="vas@email.cz" />
      {withMessage && (
        <div className="group/field mb-4 flex flex-col gap-1.5">
          <label
            htmlFor="message"
            className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-dim transition-colors group-focus-within/field:text-red-bright"
          >
            {c("form.f.message", "Zpráva")}
          </label>
          <div className="relative">
            <FocusBrackets />
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder="Krátký popis vašeho záměru…"
              className="w-full resize-none border border-line-strong bg-base px-3.5 py-3 text-[15px] text-ink caret-red outline-none transition-colors placeholder:text-ink-dim focus:border-white/30"
            />
          </div>
        </div>
      )}
      <label className="mb-4 flex items-start gap-2.5 text-[12.5px] leading-snug text-ink-muted">
        <input type="checkbox" name="consent" required className="mt-0.5 accent-red" aria-label="Souhlas se zpracováním osobních údajů" />
        <span>{c("form.consent", "Souhlasím se zpracováním osobních údajů za účelem vyřízení mé poptávky.")}</span>
      </label>
      <button
        type="submit"
        disabled={state === "loading"}
        className="group relative mt-2 inline-flex w-full items-center justify-center gap-2.5 overflow-hidden border border-red bg-red px-5 py-4 font-mono text-[12.5px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:text-red disabled:opacity-70"
      >
        <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
        {state === "loading" ? <Loader2 size={15} className="animate-spin" /> : <>{c("form.submit", "Odeslat poptávku")} <ArrowRight size={14} /></>}
      </button>
      {state === "error" && <p className="mt-3 text-center font-mono text-[12px] text-red-bright">{c("form.error", "Něco se pokazilo. Zkuste to prosím znovu nebo nám zavolejte.")}</p>}
    </form>
  );
}

/** Tiny corner brackets that acquire the focused field — same geometry as .brackets at 10px legs. */
function FocusBrackets() {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute -left-px -top-px h-2.5 w-2.5 scale-75 border-l-2 border-t-2 border-red opacity-0 transition-all duration-200 group-focus-within/field:scale-100 group-focus-within/field:opacity-100"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-px -right-px h-2.5 w-2.5 scale-75 border-b-2 border-r-2 border-red opacity-0 transition-all duration-200 group-focus-within/field:scale-100 group-focus-within/field:opacity-100"
      />
    </>
  );
}

function Field({ name, label, type, placeholder }: { name: string; label: string; type: string; placeholder: string }) {
  return (
    <div className="group/field mb-4 flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-dim transition-colors group-focus-within/field:text-red-bright"
      >
        {label}
      </label>
      <div className="relative">
        <FocusBrackets />
        <input
          id={name}
          name={name}
          type={type}
          required
          placeholder={placeholder}
          className="w-full border border-line-strong bg-base px-3.5 py-3 text-[15px] text-ink caret-red outline-none transition-colors placeholder:text-ink-dim focus:border-white/30"
        />
      </div>
    </div>
  );
}
