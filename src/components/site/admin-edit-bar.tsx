"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, FileText, LayoutDashboard, Loader2, Pencil, Settings, X } from "lucide-react";
import { MediaPicker } from "@/components/editor/media-picker";

/**
 * Live on-site editor. It is NOT shown just because someone is logged in — it
 * activates ONLY when an admin explicitly launches it (URL `?edit=1`, from the
 * admin "Upravit web naživo" action). Desktop-only. Click any [data-edit] text
 * to type, click any [data-edit-img] image to swap it. Saves into Settings.
 */
export function AdminEditBar() {
  const [admin, setAdmin] = useState(false);
  const [editActive, setEditActive] = useState(false);
  const [desktop, setDesktop] = useState(true);
  const [changes, setChanges] = useState<Record<string, string>>({});
  const [imgTarget, setImgTarget] = useState<{ key: string; el: HTMLElement } | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasEditable, setHasEditable] = useState(true);
  const changesRef = useRef(changes);
  useEffect(() => { changesRef.current = changes; }, [changes]);
  const pathname = usePathname();
  const router = useRouter();

  // admin check
  useEffect(() => {
    fetch("/api/admin/me/").then((r) => r.json()).then((d) => setAdmin(Boolean(d?.admin))).catch(() => {});
  }, []);

  // edit mode is triggered ONLY by ?edit=1 (an explicit admin launch) — never persisted
  useEffect(() => {
    if (typeof window === "undefined") return;
    setEditActive(new URLSearchParams(window.location.search).get("edit") === "1");
  }, [pathname]);

  // desktop guard — editor/live-edit is blocked on phones & small tablets
  useEffect(() => {
    const check = () => setDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const on = admin && editActive && desktop;

  const applyEditable = useCallback((enabled: boolean) => {
    document.querySelectorAll<HTMLElement>("[data-edit]").forEach((el) => {
      if (enabled) { el.setAttribute("contenteditable", "plaintext-only"); el.spellcheck = false; }
      else el.removeAttribute("contenteditable");
    });
    document.body.classList.toggle("vp-live", enabled);
  }, []);

  useEffect(() => {
    if (!on) { applyEditable(false); return; }
    const check = () => setHasEditable(((document.querySelector("main")?.querySelectorAll("[data-edit], [data-edit-img]").length) ?? 0) > 0);
    applyEditable(true); check();
    const late = window.setTimeout(() => { applyEditable(true); check(); }, 900); // catch late-revealed nodes
    return () => window.clearTimeout(late);
  }, [on, pathname, applyEditable]);

  // capture text edits + intercept image clicks while editing
  useEffect(() => {
    if (!on) return;
    const capture = (e: Event) => {
      const el = (e.target as HTMLElement)?.closest?.("[data-edit]") as HTMLElement | null;
      const key = el?.getAttribute("data-edit");
      if (el && key) setChanges((c) => ({ ...c, [key]: el.innerText.replace(/\n+/g, " ").trim() }));
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const img = target.closest?.("[data-edit-img]") as HTMLElement | null;
      if (img) {
        e.preventDefault(); e.stopPropagation();
        const key = img.getAttribute("data-edit-img");
        if (key) setImgTarget({ key, el: img });
        return;
      }
      if (target.closest?.("[data-edit]") && target.closest?.("a")) e.preventDefault();
    };
    document.addEventListener("focusout", capture);
    document.addEventListener("input", capture, true); // keep change count live so Save enables mid-edit
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("focusout", capture);
      document.removeEventListener("input", capture, true);
      document.removeEventListener("click", onClick, true);
    };
  }, [on]);

  /** Merge the currently-focused field before reading changes (avoids losing the last edit). */
  function flushActive(): Record<string, string> {
    const el = (document.activeElement as HTMLElement)?.closest?.("[data-edit]") as HTMLElement | null;
    const key = el?.getAttribute("data-edit");
    const merged = { ...changesRef.current };
    if (el && key) merged[key] = el.innerText.replace(/\n+/g, " ").trim();
    return merged;
  }

  async function save() {
    const payload = flushActive();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/live-text/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changes: payload, path: pathname }),
      });
      if (res.ok) { setChanges({}); router.refresh(); return; } // soft refresh keeps ?edit=1 + scroll
      alert(res.status === 401 ? "Přihlášení vypršelo. Přihlaste se znovu." : "Uložení selhalo. Zkuste to znovu.");
    } catch {
      alert("Uložení selhalo — zkontrolujte připojení.");
    } finally {
      setSaving(false);
    }
  }

  function exit() {
    if (Object.keys(changesRef.current).length > 0 && !confirm("Máte neuložené změny. Opravdu ukončit?")) return;
    window.location.href = pathname; // drop ?edit=1
  }

  // Same guard for the bar's in-app navigation links (they leave the live page,
  // unmounting the bar) — otherwise unsaved edits vanish without warning.
  function guardNav(e: React.MouseEvent) {
    if (Object.keys(changesRef.current).length > 0 && !confirm("Máte neuložené změny. Opravdu odejít bez uložení?")) e.preventDefault();
  }

  if (!on) return null;

  const changeCount = Object.keys(changes).length;
  const isCmsBlockPage = pathname !== "/";
  const editorHref = pathname === "/" ? "/admin/nastaveni/" : `/admin/editor/by-path/?path=${encodeURIComponent(pathname)}`;

  return (
    <>
      <div className="fixed bottom-4 left-1/2 z-[70] flex -translate-x-1/2 flex-wrap items-center gap-1.5 border border-red/50 bg-elevated/95 px-2.5 py-2 shadow-[var(--shadow-glow)] backdrop-blur-md">
        <span className="flex items-center gap-2 px-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-red-bright">
          <Pencil size={12} /> Živá editace
        </span>
        <span className="px-1 text-[12px] font-semibold text-ink-muted">
          {!hasEditable ? "Obsah této stránky upravíte v Editoru stránky →" : changeCount === 0 ? "Klikněte do textu a pište" : `Změn: ${changeCount}`}
        </span>
        {(hasEditable || changeCount > 0) && (
          <button onClick={save} disabled={changeCount === 0 || saving} className="inline-flex items-center gap-1.5 bg-red px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-dark disabled:opacity-50">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Uložit
          </button>
        )}
        {isCmsBlockPage && (
          <Link href={editorHref} onClick={guardNav} className="inline-flex items-center gap-1.5 border border-line-strong px-3 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:border-red hover:text-ink">
            <FileText size={13} /> Editor stránky
          </Link>
        )}
        <BarLink href="/admin/" icon={LayoutDashboard} label="Admin" onClick={guardNav} />
        <BarLink href="/admin/nastaveni/" icon={Settings} label="Texty" onClick={guardNav} />
        <button onClick={exit} className="inline-flex items-center gap-1.5 border border-line-strong px-3 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:border-white hover:text-ink">
          <X size={13} /> Ukončit
        </button>
      </div>

      {imgTarget && (
        <MediaPicker
          onPick={(url) => {
            setChanges((c) => ({ ...c, [imgTarget.key]: url }));
            const el = imgTarget.el;
            // data-edit-img may sit on a wrapper OR directly on the <img> (e.g. footer logo).
            const img = el.tagName === "IMG" ? (el as HTMLImageElement) : el.querySelector("img");
            if (img) { img.removeAttribute("srcset"); img.removeAttribute("sizes"); img.src = url; }
            const bg = el.querySelector<HTMLElement>('[style*="background-image"]') ?? el;
            if (bg.style.backgroundImage) bg.style.backgroundImage = `url('${url}')`;
            setImgTarget(null);
          }}
          onClose={() => setImgTarget(null)}
        />
      )}
    </>
  );
}

function BarLink({ href, icon: Icon, label, onClick }: { href: string; icon: React.ComponentType<{ size?: number }>; label: string; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-red-soft hover:text-ink">
      <Icon size={13} /> {label}
    </Link>
  );
}
