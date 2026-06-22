"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, LayoutGrid, Tag, Image as ImageIcon, Inbox, FileSpreadsheet, Settings, ExternalLink, LogOut, Menu, X, Pencil } from "lucide-react";
import { logoPath } from "@/config/site";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/", label: "Přehled", icon: LayoutDashboard, exact: true },
  { href: "/admin/stranky/", label: "Stránky", icon: FileText },
  { href: "/admin/sluzby/", label: "Služby", icon: LayoutGrid },
  { href: "/admin/cenik/", label: "Ceník", icon: Tag },
  { href: "/admin/media/", label: "Média", icon: ImageIcon },
  { href: "/admin/poptavky/", label: "Poptávky", icon: Inbox },
  { href: "/admin/nabidky/", label: "Nabídky", icon: FileSpreadsheet },
  { href: "/admin/nastaveni/", label: "Nastavení", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.href || pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "mb-0.5 flex items-center gap-3 px-3 py-2.5 text-[13.5px] font-medium transition-colors",
              active ? "bg-red-soft text-red-bright" : "text-ink-muted hover:bg-white/5 hover:text-ink",
            )}
          >
            <item.icon size={17} />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

function Footer({ email }: { email: string }) {
  return (
    <div className="border-t border-line px-3 py-3">
      <a href="/?edit=1" className="mb-0.5 hidden items-center gap-3 px-3 py-2.5 text-[13px] font-semibold text-red-bright transition-colors hover:text-ink lg:flex">
        <Pencil size={16} /> Upravit web naživo
      </a>
      <a href="/" target="_blank" rel="noopener noreferrer" className="mb-0.5 flex items-center gap-3 px-3 py-2.5 text-[13px] text-ink-muted transition-colors hover:text-ink">
        <ExternalLink size={16} /> Zobrazit web
      </a>
      <form action="/api/admin/logout/" method="post">
        <button type="submit" className="flex w-full items-center gap-3 px-3 py-2.5 text-[13px] text-ink-muted transition-colors hover:text-red-bright">
          <LogOut size={16} /> Odhlásit
        </button>
      </form>
      <p className="truncate px-3 pt-2 font-mono text-[10px] text-ink-dim">{email}</p>
    </div>
  );
}

export function AdminSidebar({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // close the mobile drawer on navigation
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      {/* mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-surface px-4 py-3 md:hidden">
        <span className="flex items-center gap-2.5">
          <img src={logoPath} alt="Viapower" className="h-5 [filter:brightness(0)_invert(1)]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-red-bright">CMS</span>
        </span>
        <button onClick={() => setOpen(true)} aria-label="Otevřít menu" className="grid h-9 w-9 place-items-center border border-line-strong text-ink">
          <Menu size={18} />
        </button>
      </div>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col border-r border-line-strong bg-surface">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="flex items-center gap-2.5">
                <img src={logoPath} alt="Viapower" className="h-6 [filter:brightness(0)_invert(1)]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-red-bright">CMS</span>
              </span>
              <button onClick={() => setOpen(false)} aria-label="Zavřít menu" className="grid h-9 w-9 place-items-center text-ink"><X size={20} /></button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4"><NavLinks onNavigate={() => setOpen(false)} /></nav>
            <Footer email={email} />
          </aside>
        </div>
      )}

      {/* static sidebar (md+) */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-surface md:flex">
        <div className="flex items-center gap-2.5 border-b border-line px-5 py-5">
          <img src={logoPath} alt="Viapower" className="h-6 [filter:brightness(0)_invert(1)]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-red-bright">CMS</span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4"><NavLinks /></nav>
        <Footer email={email} />
      </aside>
    </>
  );
}
