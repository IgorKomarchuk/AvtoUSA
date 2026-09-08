"use client";

import Image from "next/image";
import { ArrowUpRight, Gauge, MapPin, Wrench, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { VehicleData } from "@/lib/types";
import { formatNumber, formatUsd, vehicleFreshness } from "@/lib/format";
import { Badge } from "./ui/badge";
import { buttonStyles } from "./ui/button";
import type { SocialChannel } from "@prisma/client";
import { AuctionSchedule } from "./auction-schedule";
import { LeadForm } from "./lead-form";

export function VehicleCard({ vehicle, priority = false, sourceChannel }: { vehicle: VehicleData; priority?: boolean; sourceChannel?: SocialChannel }) {
  const [open, setOpen] = useState(false);
  const image = vehicle.photos[0]?.url ?? "/assets/hero-car.png";
  const externalImage = /^https?:\/\//i.test(image);
  const freshness = !vehicle.isDemo && vehicle.isActive ? vehicleFreshness(vehicle.lastSyncedAt) : null;
  const detailUrl = `/cars/${vehicle.slug}${sourceChannel ? `?utm_source=${sourceChannel.toLowerCase()}&utm_medium=social&utm_campaign=auto_lots` : ""}`;
  const openDialog = () => setOpen(true);
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const previous = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previous.overflow;
      document.body.style.position = previous.position;
      document.body.style.top = previous.top;
      document.body.style.width = previous.width;
      window.scrollTo({ top: scrollY, behavior: "instant" });
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  return <>
    <article role="button" tabIndex={0} onClick={openDialog} onKeyDown={(event)=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();openDialog();}}} className="premium-focus group flex h-full cursor-pointer flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[#101210] text-left shadow-[0_24px_70px_rgba(0,0,0,.22)] transition duration-300 hover:-translate-y-1.5 hover:border-[#ff6b00]/50" aria-label={`Дізнатися деталі про ${vehicle.title}`}>
      <div className="relative block aspect-[16/10] overflow-hidden bg-[#161816]"><Image src={image} alt={vehicle.photos[0]?.alt ?? vehicle.title} fill priority={priority} unoptimized={externalImage} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition duration-700 group-hover:scale-[1.045]"/><div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 to-transparent"/><div className="absolute left-3 top-3 flex flex-wrap gap-2"><Badge className={vehicle.isDemo?"border-amber-400/40 bg-amber-500/90 text-black":"border-emerald-300/30 bg-emerald-500/85"}>{vehicle.isDemo?"DEMO":"LIVE"}</Badge><Badge>{vehicle.platform}</Badge>{freshness&&<Badge className="border-sky-300/30 bg-sky-500/85">{freshness}</Badge>}</div></div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-black uppercase tracking-[.13em] text-[#ff7b1a]">{vehicle.year} · Lot #{vehicle.lotNumber}</p>
        <h3 className="mt-2 text-xl font-bold leading-tight tracking-[-.035em]">{vehicle.title}</h3>
        <div className="mt-5 grid grid-cols-2 gap-3 border-y border-white/[.07] py-4 text-xs text-white/55">
          <span className="flex items-center gap-2"><Gauge size={14}/>{formatNumber(vehicle.odometerMiles)} mi</span>
          <span className="flex items-center gap-2"><Wrench size={14}/>{vehicle.primaryDamage??"—"}</span>
          <span className="flex items-center gap-2"><MapPin size={14}/>{[vehicle.state,vehicle.city].filter(Boolean).join(" · ")||"—"}</span>
          <AuctionSchedule auctionDate={vehicle.auctionDate} compact/>
        </div>
        <div className="mt-5 flex items-end justify-between gap-4"><div><p className="text-[11px] text-white/45">{vehicle.buyNowPrice?"Купити зараз":"Поточна ставка"}</p><p className="text-2xl font-black tracking-[-.045em]">{formatUsd(vehicle.buyNowPrice??vehicle.currentBid)}</p></div><span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/15 transition group-hover:border-[#ff6b00] group-hover:bg-[#ff6b00]"><ArrowUpRight size={18}/></span></div>
        <div className="mt-4 grid gap-2 min-[390px]:grid-cols-2"><button type="button" className={buttonStyles("secondary")}>Дізнатися деталі</button><button type="button" className={buttonStyles("primary")}>Отримати розрахунок</button></div>
      </div>
    </article>
    {open&&<div className="fixed inset-0 z-[100] flex w-screen items-end justify-center overflow-hidden overscroll-contain bg-black/80 p-2 backdrop-blur-md sm:items-center sm:p-6" role="presentation" onMouseDown={(event)=>{if(event.target===event.currentTarget)setOpen(false)}}>
      <section role="dialog" aria-modal="true" aria-labelledby={`lead-${vehicle.id}`} className="relative w-[calc(100vw-1rem)] min-w-0 max-w-2xl max-h-[calc(100dvh-1rem)] overflow-y-auto overflow-x-hidden rounded-[24px] border border-white/15 bg-[#101210] shadow-[0_30px_100px_rgba(0,0,0,.7)] [scrollbar-gutter:stable] sm:w-full sm:max-h-[calc(100dvh-3rem)] sm:rounded-[30px]">
        <button type="button" onClick={()=>setOpen(false)} className="premium-focus absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full border border-white/15 bg-black/70 sm:right-4 sm:top-4 sm:size-11" aria-label="Закрити"><X size={20}/></button>
        <div className="grid min-w-0 sm:grid-cols-[.8fr_1.2fr]">
          <div className="relative min-h-40 min-w-0 bg-black sm:min-h-52">
            <Image src={image} alt={vehicle.title} fill unoptimized={externalImage} sizes="(max-width: 640px) 100vw, 40vw" className="object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent"/>
            <div className="absolute inset-x-0 bottom-0 min-w-0 p-4 sm:p-5">
              <span className="text-[11px] font-black uppercase tracking-[.12em] text-[#ff7b1a]">{vehicle.platform} · Lot #{vehicle.lotNumber}</span>
              <h2 id={`lead-${vehicle.id}`} className="mt-1 line-clamp-2 break-words pr-12 text-lg font-bold leading-tight sm:mt-2 sm:text-2xl">{vehicle.title}</h2>
              <p className="mt-1 text-base font-black sm:mt-2 sm:text-lg">{formatUsd(vehicle.buyNowPrice??vehicle.currentBid)}</p>
            </div>
          </div>
          <div className="min-w-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:p-7 sm:pt-16">
            <p className="text-[11px] font-black uppercase tracking-[.13em] text-[#ff7b1a] sm:text-xs">Дізнатися деталі</p>
            <h3 className="mt-2 max-w-full break-words text-[clamp(1.45rem,7vw,1.7rem)] font-bold leading-[1.08] tracking-[-.04em] sm:text-2xl">Залиште номер — ми все перевіримо</h3>
            <p className="mt-3 text-sm leading-6 text-white/50">Менеджер уточнить стан лота, витрати та зв’яжеться з вами найближчим часом.</p>
            <div className="mt-4 sm:mt-5"><LeadForm compact vehicle={{vehicleId:vehicle.id,vin:vehicle.vin,lotNumber:vehicle.lotNumber,vehicleTitle:vehicle.title,price:formatUsd(vehicle.buyNowPrice??vehicle.currentBid),vehicleUrl:detailUrl,source:"vehicle_card"}}/></div>
          </div>
        </div>
      </section>
    </div>}
  </>;
}
