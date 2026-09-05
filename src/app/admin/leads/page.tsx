import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getAdminLeads } from "@/lib/admin-data";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Заявки", robots: { index: false, follow: false } };

export default async function AdminLeadsPage() {
  await requireAdmin();
  const rows = await getAdminLeads();
  return (
    <AdminShell title="Заявки" description="Джерело, кампанія та конкретний автомобіль зберігаються разом із контактом.">
      <div className="overflow-x-auto rounded-3xl border border-white/10">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead className="bg-white/[.04] text-xs text-white/40"><tr>{["Дата","Клієнт","Телефон","Месенджер","Авто","VIN / Lot","Джерело","UTM campaign","Статус"].map((value)=><th key={value} className="p-4">{value}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/[.06]">
            {rows.map((row)=><tr key={row.id}><td className="p-4">{formatDateTime(row.createdAt)}</td><td className="p-4 font-semibold">{row.name}</td><td className="p-4"><a href={`tel:${row.phone}`}>{row.phone}</a></td><td className="p-4">{row.messenger??"—"}</td><td className="p-4">{row.vehicleUrl?<Link href={row.vehicleUrl}>{row.vehicleTitle??"Відкрити авто"}</Link>:row.vehicleTitle??row.interest??"—"}</td><td className="p-4 text-xs"><div>{row.vin??"—"}</div><div className="text-white/40">Lot {row.lotNumber??"—"}</div></td><td className="p-4 font-bold uppercase">{row.sourceChannel??"direct"}<div className="mt-1 text-xs font-normal lowercase text-white/40">{row.utmSource||"direct"} / {row.utmMedium||"—"}</div></td><td className="p-4">{row.utmCampaign??"—"}</td><td className="p-4">{row.status}</td></tr>)}
            {!rows.length&&<tr><td colSpan={9} className="p-10 text-center text-white/40">Заявок ще немає</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
