import { getSettings } from "@/lib/cms";
import { getCompany, companyFields } from "@/lib/company";
import { AdminHeader } from "@/components/admin/ui";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsAdminPage() {
  const [settings, company] = await Promise.all([getSettings(), getCompany()]);
  // Prefill company.* inputs with their effective values (seed or saved override)
  // so the form never shows blank contact fields.
  const initial = { ...companyFields(company), ...settings };
  return (
    <div className="p-8">
      <AdminHeader title="Nastavení" desc="Upravte texty a firemní údaje napříč webem. Změny se projeví okamžitě." />
      <SettingsForm initial={initial} />
    </div>
  );
}
