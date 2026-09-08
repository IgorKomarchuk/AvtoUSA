import { AdminShell } from "@/components/admin-shell";
import { GoogleSettingsForm } from "@/components/google-settings-form";
import { requireAdmin } from "@/lib/auth";
import { getGoogleTrackingSettings } from "@/lib/google-settings";

export const dynamic = "force-dynamic";

export default async function GoogleSettingsPage() {
  await requireAdmin();
  const settings = await getGoogleTrackingSettings();
  return <AdminShell title="Google Analytics та Ads" description="Керування GA4, рекламними конверсіями та Google Consent Mode v2."><GoogleSettingsForm settings={settings} /></AdminShell>;
}
