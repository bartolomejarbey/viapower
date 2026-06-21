"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, FileText, LayoutDashboard, Loader2, Paintbrush, Pencil, Settings, X } from "lucide-react";
import { MediaPicker } from "@/components/editor/media-picker";
import { cn } from "@/lib/utils";

/**
 * Admin chrome on the live site: quick links + the Lovable-style LIVE EDIT
 * mode — click any [data-edit] text on the real page and type; click any
 * [data-edit-img] image to swap it from the media library. Changes save
 * into Settings via /api/admin/live-text and survive across deploys.
 */
export function AdminEditBar() {
  const [admin, setAdmin] = useState(false);
  const [live, setLive] = useState(false);
  const [changes, setChanges] = useState<Record<string, string>>({});
  const [imgTarget, setImgTarget] = useState<{ key: string; el: HTMLElement } | null>(null);
  const [saving, setSaving] = useState(false);
  const changesRef = useRef(changes);
  useEffect(() => { changesRef.current = changes; }, [changes]);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/admin/me/")
      .then((r) => r.json())
      .then((d) => {
        setAdmin(Boolean(d?.admin));
        if (d?.admin && sessionStorage.getItem("vp-live") === "1") setLive(true);
      })
      .catch(() => {});
  }, []);

  const applyEditable = useCallback((on: boolean) => {
    document.querySelectorAll<HTMLElement>("[data-edit]").forEach((el) => {
      if (on) {
        el.setAttribute("contenteditable", "plaintext-only");
        el.spellcheck = false;
      } else {
        el.removeAttribute("contenteditable");
      }
    });
    document.body.classList.toggle("vp-live", on);
  }, []);

  // enable/disable editing surface (re-run after route changes; late pass for revealed nodes)
  useEffect(() => {
    if (!admin) return;
    applyEditable(live);
    const late = live ? window.setTimeout(() => applyEditable(true), 900) : 0;
    return () => window.clearTimeout(late);
  }, [admin, live, pathname, applyEditable]);

  // capture edits + intercept clicks while live
  useEffect(() => {
    if (!admin || !live) return;

    const onFocusOut = (e: FocusEvent) => {
      const el = (e.target as HTMLElement)?.closest?.("[data-edit]") as HTMLElement | null;
      if (!el) return;
      const key = el.getAttribute("data-edit");
      if (!key) return;
      setChanges((c) => ({ ...c, [key]: el.innerText.replace(/\n+/g, " ").trim() }));
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const img = target.closest?.("[data-edit-img]") as HTMLElement | null;
      if (img) {
        e.preventDefault();
        e.stopPropagation();
        const key = img.getAttribute("data-edit-img");
        if (key) setImgTarget({ key, el: img });
        return;
      }
      // editing inside a link must not navigate
      if (target.closest?.("[data-edit]") && target.closest?.("a")) {
        e.preventDefault();
      }
    };

    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("click", onClick, true);
    };
  }, [admin, live]);

  function toggleLive() {
    const next = !live;
    if (!next && Object.keys(changesRef.current).length > 0 && !confirm("Máte neuložené změny. Opravdu ukončit bez uložení?")) {
      return;
    }
    sessionStorage.setItem("vp-live", next ? "1" : "0");
    setChanges({});
    setLive(next);
    if (!next) applyEditable(false);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/live-text/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changes: changesRef.current, path: pathname }),
      });
      if (res.ok) {
        sessionStorage.setItem("vp-live", "1");
        location.reload();
        return;
      }
      alert(res.status === 401 ? "Přihlášení vypršelo. Přihlaste se znovu." : "Uložení selhalo. Zkuste to znovu.");
    } catch {
      alert("Uložení selhalo — zkontrolujte připojení a zkuste to znovu.");
    } finally {
      setSaving(false);
    }
  }

  if (!admin) return null;

  const changeCount = Object.keys(changes).length;
  const editHref = pathname === "/" ? "/admin/nastaveni/" : `/admin/editor/by-path/?path=${encodeURIComponent(pathname)}`;

  return (
    <>
      <div className="fixed bottom-4 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-1 border border-red/50 bg-elevated/95 px-2 py-2 shadow-[var(--shadow-glow)] backdrop-blur-md">
        <span className="flex items-center gap-2 px-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-red-bright">
          <Pencil size={12} /> Editace
        </span>
        <button
          onClick={toggleLive}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors",
            live ? "bg-red text-white" : "bg-red/15 text-red-bright hover:bg-red hover:text-white",
          )}
        >
          <Pencil size={13} /> {live ? "Živá editace: ZAP" : "Živá editace"}
        </button>
        <a href={editHref} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-red-soft hover:text-ink">
          <Paintbrush size={13} /> Editor stránky
        </a>
        <BarLink href="/admin/" icon={LayoutDashboard} label="Admin" />
        <BarLink href="/admin/stranky/" icon={FileText} label="Stránky" />
        <BarLink href="/admin/nastaveni/" icon={Settings} label="Texty" />
      </div>

      {live && (
        <div className="fixed bottom-4 right-4 z-[71] flex items-center gap-2 border border-line-strong bg-surface/95 px-3 py-2.5 shadow-xl backdrop-blur-md">
          <span className="text-[12px] font-semibold text-ink-muted">
            {changeCount === 0 ? "Klikněte do textu a pište" : `Změn: ${changeCount}`}
          </span>
          <button
            onClick={save}
            disabled={changeCount === 0 || saving}
            className="inline-flex items-center gap-1.5 bg-red px-3.5 py-2 text-[11px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-dark disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Uložit
          </button>
          <button
            onClick={() => { if (changeCount === 0 || confirm("Zahodit neuložené změny?")) location.reload(); }}
            className="inline-flex items-center gap-1.5 border border-line-strong px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-ink-muted transition-colors hover:border-white hover:text-ink"
          >
            <X size={13} /> Zahodit
          </button>
        </div>
      )}

      {imgTarget && (
        <MediaPicker
          onPick={(url) => {
            setChanges((c) => ({ ...c, [imgTarget.key]: url }));
            // optimistic preview: swap the visible image in place
            const el = imgTarget.el;
            const img = el.querySelector("img");
            if (img) img.src = url;
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

function BarLink({ href, icon: Icon, label }: { href: string; icon: React.ComponentType<{ size?: number }>; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-red-soft hover:text-ink">
      <Icon size={13} /> {label}
    </Link>
  );
}
