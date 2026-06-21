"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, LayoutGrid, Tag, Image as ImageIcon, Inbox, FileSpreadsheet, Settings, ExternalLink, LogOut } from "lucide-react";
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

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-surface">
      <div className="flex items-center gap-2.5 border-b border-line px-5 py-5">
        <img src={logoPath} alt="Viapower" className="h-6 [filter:brightness(0)_invert(1)]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-red-bright">CMS</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href || pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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
      </nav>
      <div className="border-t border-line px-3 py-3">
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
    </aside>
  );
}
