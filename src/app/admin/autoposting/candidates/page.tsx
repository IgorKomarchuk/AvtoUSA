import Image from "next/image";
import { AdminShell } from "@/components/admin-shell";
import { CandidateActions } from "@/components/autopost-controls";
import { requireAdmin } from "@/lib/auth";
import { getAutopostCandidates } from "@/lib/autopost-admin-data";
import { formatNumber, formatUsd } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Кандидати на публікацію", robots: { index: false, follow: false } };

export default async function CandidatesPage(){await requireAdmin();const rows=await getAutopostCandidates();return <AdminShell title="Кандидати" description="Лише реальні активні лоти, які пройшли quality filter."><div className="grid gap-4 lg:grid-cols-2">{rows.map(({vehicle,publishedChannels})=><article key={vehicle.id} className="grid overflow-hidden rounded-3xl border border-white/10 bg-white/[.035] sm:grid-cols-[180px_1fr]"><div className="relative min-h-44 bg-black/30">{vehicle.photos[0]&&<Image src={vehicle.photos[0].url} alt={vehicle.title} fill sizes="180px" className="object-cover"/>}</div><div className="p-5"><div className="flex justify-between gap-3"><h2 className="font-bold">{vehicle.title}</h2><span className="text-xs text-white/40">{vehicle.platform}</span></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/50"><span>{formatUsd(vehicle.buyNowPrice??vehicle.currentBid)}</span><span>{formatNumber(vehicle.odometerMiles)} mi</span><span>{vehicle.primaryDamage}</span><span>{vehicle.state} · {vehicle.city}</span></div>{publishedChannels.length>0&&<p className="mt-3 text-xs text-amber-200">Уже в черзі: {publishedChannels.join(", ")}</p>}<CandidateActions vehicleId={vehicle.id} decision={vehicle.publicationDecision}/></div></article>)}{!rows.length&&<p className="text-white/45">Кандидатів немає. DEMO-авто навмисно не допускаються.</p>}</div></AdminShell>}
