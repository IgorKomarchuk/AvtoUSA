import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Gauge, MapPin, Wrench } from "lucide-react";
import type { VehicleData } from "@/lib/types";
import { auctionCountdown, formatDate, formatNumber, formatUsd, vehicleFreshness } from "@/lib/format";
import { Badge } from "./ui/badge";
import { buttonStyles } from "./ui/button";
import { vehicleSocialUrl } from "@/lib/social-template";
import type { SocialChannel } from "@prisma/client";

export function VehicleCard({ vehicle, priority = false, sourceChannel }: { vehicle: VehicleData; priority?: boolean; sourceChannel?: SocialChannel }) {
  const image = vehicle.photos[0]?.url ?? "/assets/hero-car.png";
  const freshness = !vehicle.isDemo && vehicle.isActive ? vehicleFreshness(vehicle.lastSyncedAt, process.env.TIMEZONE) : null;
  const vehicleHref = sourceChannel ? vehicleSocialUrl(vehicle, sourceChannel) : `/cars/${vehicle.slug}`;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[#101210] shadow-[0_24px_70px_rgba(0,0,0,.22)] transition duration-300 hover:-translate-y-1.5 hover:border-[#ff6b00]/50">
      <Link href={vehicleHref} className="relative block aspect-[16/10] overflow-hidden bg-[#161816]" aria-label={`Переглянути ${vehicle.title}`}>
        <Image src={image} alt={vehicle.photos[0]?.alt ?? vehicle.title} fill priority={priority} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition duration-700 group-hover:scale-[1.045]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge className={vehicle.isDemo ? "border-amber-400/40 bg-amber-500/90 text-black" : "border-emerald-300/30 bg-emerald-500/85"}>{vehicle.isDemo ? "DEMO" : "LIVE"}</Badge>
          <Badge>{vehicle.platform}</Badge>
          {freshness && <Badge className="border-sky-300/30 bg-sky-500/85">{freshness}</Badge>}
        </div>
        {auctionCountdown(vehicle.auctionDate) && <span className="absolute bottom-3 left-4 text-xs font-bold text-white/85">{auctionCountdown(vehicle.auctionDate)}</span>}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-black uppercase tracking-[.13em] text-[#ff7b1a]">{vehicle.year} · Lot #{vehicle.lotNumber}</p>
        <h3 className="mt-2 text-xl font-bold leading-tight tracking-[-.035em]">{vehicle.title}</h3>
        <div className="mt-5 grid grid-cols-2 gap-3 border-y border-white/[.07] py-4 text-xs text-white/55">
          <span className="flex items-center gap-2"><Gauge size={14} />{formatNumber(vehicle.odometerMiles)} mi</span>
          <span className="flex items-center gap-2"><Wrench size={14} />{vehicle.primaryDamage ?? "—"}</span>
          <span className="flex items-center gap-2"><MapPin size={14} />{[vehicle.state, vehicle.city].filter(Boolean).join(" · ") || "—"}</span>
          <span className="flex items-center gap-2"><CalendarDays size={14} />{formatDate(vehicle.auctionDate)}</span>
        </div>
        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] text-white/45">{vehicle.buyNowPrice ? "Купити зараз" : "Поточна ставка"}</p>
            <p className="text-2xl font-black tracking-[-.045em]">{formatUsd(vehicle.buyNowPrice ?? vehicle.currentBid)}</p>
          </div>
          <Link href={vehicleHref} className="premium-focus grid size-11 shrink-0 place-items-center rounded-full border border-white/15 transition hover:border-[#ff6b00] hover:bg-[#ff6b00]" aria-label={`Докладніше про ${vehicle.title}`}><ArrowUpRight size={18} /></Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href={vehicleHref} className={buttonStyles("secondary")}>Докладніше</Link>
          <Link href={`${vehicleHref}#quote`} className={buttonStyles("primary")}>Отримати розрахунок</Link>
        </div>
      </div>
    </article>
  );
}
