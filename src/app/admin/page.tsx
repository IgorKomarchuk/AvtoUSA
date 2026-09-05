import type { Metadata } from "next";
import { Activity, CarFront, CircleDollarSign, Database, Gavel, MessageSquareText } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getAdminDashboard } from "@/lib/admin-data";
import { formatDateTime } from "@/lib/format";
import { maskSecret } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const dashboard = await getAdminDashboard();
  const cards = [
    ["Автомобілі", dashboard.vehicles, CarFront], ["Copart", dashboard.copart, Gavel], ["IAAI", dashboard.iaai, Gavel],
    ["Активні лоти", dashboard.active, Activity], ["Продані / завершені", dashboard.sold, CircleDollarSign], ["Заявки", dashboard.leads, MessageSquareText],
  ] as const;
  const remaining = dashboard.usage.remaining;
  const warning = remaining != null && remaining < 10 ? "border-rose-400/30 bg-rose-400/[.08] text-rose-200" : remaining != null && remaining < 20 ? "border-amber-400/30 bg-amber-400/[.08] text-amber-100" : "border-white/10 bg-white/[.035] text-white/60";
  return <AdminShell title="Dashboard" description={dashboard.demo ? "Локальний DEMO-режим — PostgreSQL не підключено або недоступний." : "Операційний стан каталогу, заявок і API."}><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label,value,Icon])=><article key={label} className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><Icon size={20} className="text-[#ff7b1a]" /><p className="mt-7 text-sm text-white/45">{label}</p><strong className="mt-1 block text-4xl tracking-[-.055em]">{value}</strong></article>)}</div><div className="mt-6 grid gap-4 lg:grid-cols-2"><section className={`rounded-3xl border p-6 ${warning}`}><p className="text-xs font-black uppercase tracking-[.12em]">Apibara API usage</p><div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4"><div><span className="text-xs opacity-55">Plan</span><strong className="mt-1 block">{dashboard.usage.plan ?? "No data"}</strong></div><div><span className="text-xs opacity-55">Used</span><strong className="mt-1 block">{dashboard.usage.used ?? "—"}</strong></div><div><span className="text-xs opacity-55">Remaining</span><strong className="mt-1 block">{remaining ?? "—"}</strong></div><div><span className="text-xs opacity-55">Limit</span><strong className="mt-1 block">{dashboard.usage.limit ?? "—"}</strong></div></div>{remaining != null && remaining < 20 && <p className="mt-5 text-sm font-semibold">{remaining < 10 ? "Критично мало API-запитів. Зупиніть ручні синхронізації." : "Залишилося менше 20 API-запитів."}</p>}</section><section className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><Database size={20} className="text-[#ff7b1a]" /><dl className="mt-6 grid gap-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-white/45">Остання синхронізація</dt><dd>{formatDateTime(dashboard.lastSync)}</dd></div><div className="flex justify-between gap-4"><dt className="text-white/45">Режим</dt><dd>{process.env.AUCTION_SYNC_MODE ?? "free"}</dd></div><div className="flex justify-between gap-4"><dt className="text-white/45">API key</dt><dd>{maskSecret(process.env.APIBARA_API_KEY)}</dd></div><div className="flex justify-between gap-4"><dt className="text-white/45">База даних</dt><dd>{dashboard.demo ? "Fallback / DEMO" : "PostgreSQL"}</dd></div></dl></section></div></AdminShell>;
}
