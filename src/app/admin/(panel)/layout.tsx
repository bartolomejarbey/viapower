import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminSidebar } from "@/components/admin/sidebar";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSession();
  const unreadLeads = await db.lead.count({ where: { read: false } }).catch(() => 0);
  return (
    <div className="flex min-h-screen flex-col bg-base md:flex-row">
      <AdminSidebar email={user.email} unreadLeads={unreadLeads} />
      <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
