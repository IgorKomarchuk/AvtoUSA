import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { ChannelControl, ModeControl, PublicationFilters, RunAutopostButton } from "@/components/autopost-controls";
import { requireAdmin } from "@/lib/auth";
import { getAutopostDashboard } from "@/lib/autopost-admin-data";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Автопублікації", robots: { index: false, follow: false } };

export default async function AutopostingPage() {
  await requireAdmin();
  const data = await getAutopostDashboard();
  const sections = [
    ["Кандидати", "/admin/autoposting/candidates"],
    ["Черга", "/admin/autoposting/queue"],
    ["Історія", "/admin/autoposting/history"],
    ["Помилки", "/admin/autoposting/errors"],
    ["Шаблони", "/admin/autoposting/templates"],
  ];
  return (
    <AdminShell title="Автопублікації" description="Керування якістю лотів, каналами, чергою та історією публікацій.">
      <div className="flex flex-wrap gap-2">{sections.map(([label, href]) => <Link key={href} href={href} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold no-underline hover:bg-white/[.06]">{label}</Link>)}</div>
      <div className="mt-6 rounded-3xl border border-white/10 bg-white/[.035] p-5"><ModeControl mode={data.mode}/><p className="mt-3 text-xs text-white/40">MANUAL увімкнено за замовчуванням: система знаходить лоти, але не публікує їх без схвалення.</p></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Готові",data.ready],["Сьогодні",data.publishedToday],["Помилки",data.errors],["Остання",formatDateTime(data.lastPublishedAt)]].map(([label,value])=><article key={label} className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><p className="text-xs text-white/40">{label}</p><strong className="mt-3 block text-2xl">{value}</strong></article>)}</div>
      {!data.databaseReady&&<p className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/[.07] p-4 text-sm text-amber-100">PostgreSQL не підключено. Інтерфейс доступний, але черга та історія не зберігаються.</p>}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">{data.channels.map((item)=><ChannelControl key={item.channel} {...item}/>)}</div>
      <PublicationFilters filters={data.filters}/>
      <div className="mt-6 rounded-3xl border border-white/10 bg-white/[.035] p-5"><RunAutopostButton/></div>
    </AdminShell>
  );
}
