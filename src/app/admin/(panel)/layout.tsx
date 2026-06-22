import { requireSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSession();
  return (
    <div className="flex min-h-screen flex-col bg-base md:flex-row">
      <AdminSidebar email={user.email} />
      <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
