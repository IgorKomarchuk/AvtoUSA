import Image from "next/image";
import { AdminShell } from "@/components/admin-shell";
import { QueueActions } from "@/components/autopost-controls";
import { requireAdmin } from "@/lib/auth";
import { getAutopostQueue } from "@/lib/autopost-admin-data";
import { formatDateTime } from "@/lib/format";

export const dynamic="force-dynamic";
export const metadata={title:"Черга автопублікацій",robots:{index:false,follow:false}};
export default async function QueuePage(){await requireAdmin();const rows=await getAutopostQueue();return <AdminShell title="Черга публікацій"><div className="overflow-x-auto rounded-3xl border border-white/10"><table className="w-full min-w-[1040px] text-left text-sm"><thead className="bg-white/[.04] text-xs text-white/40"><tr>{["Фото","Авто","Канал","Час","Статус","Спроби","Помилка","Дії"].map(v=><th key={v} className="p-4">{v}</th>)}</tr></thead><tbody className="divide-y divide-white/[.06]">{rows.map(row=><tr key={row.id}><td className="p-4"><div className="relative h-14 w-20 overflow-hidden rounded-lg bg-white/5">{row.vehicle.photos[0]&&<Image src={row.vehicle.photos[0].url} alt={row.vehicle.title} fill sizes="80px" className="object-cover"/>}</div></td><td className="p-4 font-semibold">{row.vehicle.title}</td><td className="p-4">{row.channel}</td><td className="p-4">{formatDateTime(row.scheduledAt)}</td><td className="p-4">{row.status}</td><td className="p-4">{row.retryCount}</td><td className="max-w-xs p-4 text-xs text-rose-200">{row.errorMessage??"—"}</td><td className="p-4"><QueueActions publicationId={row.id}/></td></tr>)}{!rows.length&&<tr><td colSpan={8} className="p-10 text-center text-white/40">Черга порожня</td></tr>}</tbody></table></div></AdminShell>}
