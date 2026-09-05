import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getAutopostHistory } from "@/lib/autopost-admin-data";
import { formatDateTime } from "@/lib/format";

export const dynamic="force-dynamic";
export const metadata={title:"Історія автопублікацій",robots:{index:false,follow:false}};
export default async function HistoryPage(){await requireAdmin();const rows=await getAutopostHistory();return <AdminShell title="Історія публікацій"><div className="overflow-x-auto rounded-3xl border border-white/10"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-white/[.04] text-xs text-white/40"><tr>{["Авто","Канал","Дата","Статус","Пост","Сторінка авто","Помилка"].map(v=><th key={v} className="p-4">{v}</th>)}</tr></thead><tbody className="divide-y divide-white/[.06]">{rows.map(row=><tr key={row.id}><td className="p-4 font-semibold">{row.vehicle.title}</td><td className="p-4">{row.channel}</td><td className="p-4">{formatDateTime(row.publishedAt??row.updatedAt)}</td><td className="p-4">{row.status}</td><td className="p-4">{row.externalPostUrl?<a href={row.externalPostUrl} target="_blank" rel="noreferrer">Відкрити</a>:"—"}</td><td className="p-4"><Link href={`/cars/${row.vehicle.slug}`}>Авто</Link></td><td className="max-w-xs p-4 text-xs text-rose-200">{row.errorMessage??"—"}</td></tr>)}{!rows.length&&<tr><td colSpan={7} className="p-10 text-center text-white/40">Історія порожня</td></tr>}</tbody></table></div></AdminShell>}
