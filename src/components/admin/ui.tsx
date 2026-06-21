import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 bg-red px-4 py-2.5 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-red-dark disabled:opacity-60";
export const btnGhost =
  "inline-flex items-center justify-center gap-2 border border-line-strong px-4 py-2.5 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-ink-muted transition-colors hover:border-white hover:text-ink";
export const btnDanger =
  "inline-flex items-center justify-center gap-2 border border-red/40 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-red-bright transition-colors hover:bg-red hover:text-white";
export const inputCls =
  "w-full border border-line-strong bg-base px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-dim focus:border-red";
export const labelCls = "mb-1.5 block font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-dim";

export function AdminHeader({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-ink">{title}</h1>
        {desc && <p className="mt-1 text-[14px] text-ink-muted">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("border border-line-strong bg-card", className)}>{children}</div>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <span className={labelCls}>{label}</span>
      {children}
    </div>
  );
}
