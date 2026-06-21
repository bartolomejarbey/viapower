import { requireSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSession();
  return (
    <div className="flex min-h-screen bg-base">
      <AdminSidebar email={user.email} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
