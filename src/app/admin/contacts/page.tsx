import { AdminShell } from "@/components/admin-shell";
import { ContactSettingsForm } from "@/components/contact-settings-form";
import { requireAdmin } from "@/lib/auth";
import { getSiteContacts } from "@/lib/site-contacts";

export const dynamic = "force-dynamic";
export const metadata = { title: "Контакти сайту", robots: { index: false, follow: false } };

export default async function ContactsPage() {
  await requireAdmin();
  return <AdminShell title="Контакти сайту" description="Телефон, email та посилання на месенджери у шапці й підвалі сайту."><ContactSettingsForm contacts={await getSiteContacts()}/></AdminShell>;
}
