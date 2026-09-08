import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { SocialIntegrationsForm } from "@/components/social-integrations-form";
import { requireAdmin } from "@/lib/auth";
import { getSocialCredentialSummary } from "@/lib/social-credentials";

export const dynamic = "force-dynamic";
export const metadata = { title: "Інтеграції автопублікацій", robots: { index: false, follow: false } };

export default async function SocialIntegrationsPage() {
  await requireAdmin();
  const summary = await getSocialCredentialSummary();
  return <AdminShell title="Інтеграції месенджерів" description="Безпечне підключення Telegram, Facebook, Instagram і Viber для автоматичних публікацій.">
    <Link href="/admin/autoposting" className="inline-flex rounded-xl border border-white/10 px-4 py-2 text-sm font-bold no-underline hover:bg-white/[.06]">← До автопублікацій</Link>
    <div className="mt-5 rounded-2xl border border-sky-400/15 bg-sky-400/[.06] p-4 text-sm leading-6 text-sky-100">Спочатку збережіть credentials, потім натисніть «Перевірити». Лише після успішного підключення вмикайте автопублікацію каналу.</div>
    <SocialIntegrationsForm {...summary}/>
  </AdminShell>;
}
