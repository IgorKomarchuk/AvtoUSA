import type { Metadata } from "next";
import { AdminShell } from "@/components/admin-shell";
import { SyncControls } from "@/components/sync-controls";
import { requireAdmin } from "@/lib/auth";
import { getSyncLogs } from "@/lib/admin-data";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Синхронізація аукціонів", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminSyncPage() {
  await requireAdmin();
  const logs = await getSyncLogs();
  return <AdminShell title="Синхронізація" description="FREE-режим: один комбінований запит двічі на добу. Ручні операції витрачають додаткові запити."><section className="rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:p-6"><SyncControls /></section><section className="mt-6 overflow-hidden rounded-3xl border border-white/10"><div className="border-b border-white/10 bg-white/[.035] px-5 py-4"><h2 className="font-bold">Останні запуски</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[880px] border-collapse text-left text-sm"><thead className="bg-black/25 text-xs uppercase tracking-[.08em] text-white/35"><tr>{["Початок","Provider","Endpoint","Статус","API","Отримано","Додано","Оновлено","Помилка"].map((item)=><th key={item} className="px-4 py-3 font-semibold">{item}</th>)}</tr></thead><tbody className="divide-y divide-white/[.06]">{logs.length ? logs.map((log)=><tr key={log.id} className="text-white/65"><td className="whitespace-nowrap px-4 py-4">{formatDateTime(log.startedAt)}</td><td className="px-4 py-4">{log.provider}</td><td className="px-4 py-4">{log.endpoint}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${log.status === "SUCCESS" ? "bg-emerald-400/10 text-emerald-300" : log.status === "FAILED" ? "bg-rose-400/10 text-rose-300" : "bg-amber-400/10 text-amber-200"}`}>{log.status}</span></td><td className="px-4 py-4">{log.apiRequests}</td><td className="px-4 py-4">{log.receivedRecords}</td><td className="px-4 py-4">{log.createdRecords}</td><td className="px-4 py-4">{log.updatedRecords}</td><td className="max-w-sm px-4 py-4 text-xs text-rose-200/70">{log.errorMessage ?? "—"}</td></tr>) : <tr><td colSpan={9} className="px-5 py-12 text-center text-white/35">Логів поки немає. Без PostgreSQL історія не зберігається.</td></tr>}</tbody></table></div></section></AdminShell>;
}
