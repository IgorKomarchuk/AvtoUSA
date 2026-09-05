import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { QueueActions } from "@/components/autopost-controls";
import { requireAdmin } from "@/lib/auth";
import { getAutopostErrors } from "@/lib/autopost-admin-data";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Помилки автопублікацій", robots: { index: false, follow: false } };

export default async function AutopostErrorsPage() {
  await requireAdmin();
  const rows = await getAutopostErrors();
  return (
    <AdminShell title="Логи помилок" description="Кожна невдала спроба зберігається окремо й не зупиняє сайт або інші канали.">
      <div className="overflow-x-auto rounded-3xl border border-white/10">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-white/[.04] text-xs text-white/40"><tr>{["Timestamp","Канал","Авто","Vehicle ID","Код","Повідомлення","Retry","Дії"].map((value)=><th key={value} className="p-4">{value}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/[.06]">
            {rows.map((row)=><tr key={row.id}><td className="p-4">{formatDateTime(row.timestamp)}</td><td className="p-4">{row.channel}</td><td className="p-4 font-semibold"><Link href={`/cars/${row.vehicle.slug}`}>{row.vehicle.title}</Link></td><td className="p-4 font-mono text-xs text-white/45">{row.vehicleId}</td><td className="p-4">{row.errorCode??"—"}</td><td className="max-w-sm p-4 text-xs text-rose-200">{row.errorMessage}</td><td className="p-4">{row.retryCount}</td><td className="p-4">{row.publicationId&&row.publication?<QueueActions publicationId={row.publicationId}/>:"—"}</td></tr>)}
            {!rows.length&&<tr><td colSpan={8} className="p-10 text-center text-white/40">Помилок немає</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
