"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";
import type { LeadVehicleContext } from "./lead-form";
import { LeadForm } from "./lead-form";

interface DialogVehicle extends LeadVehicleContext {
  image?: string;
  platform?: string;
}

export function LeadDialogButton({
  children,
  className,
  vehicle,
  autoOpenFromQuery = false,
  onOpen,
}: {
  children: ReactNode;
  className?: string;
  vehicle?: DialogVehicle;
  autoOpenFromQuery?: boolean;
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const image = vehicle?.image ?? "/assets/hero-car.png";
  const externalImage = /^https?:\/\//i.test(image);

  function showDialog() {
    onOpen?.();
    setOpen(true);
  }

  useEffect(() => {
    if (!autoOpenFromQuery) return;
    const query = new URLSearchParams(window.location.search);
    if (query.get("request") !== "1") return;
    const timer = window.setTimeout(() => setOpen(true), 0);
    return () => window.clearTimeout(timer);
  }, [autoOpenFromQuery]);

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
    <button type="button" className={className} onClick={showDialog}>{children}</button>
    {open && <div className="fixed inset-0 z-[100] flex w-screen items-end justify-center overflow-hidden overscroll-contain bg-black/80 p-2 backdrop-blur-md sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] min-w-0 max-w-2xl overflow-y-auto overflow-x-hidden rounded-[24px] border border-white/15 bg-[#101210] shadow-[0_30px_100px_rgba(0,0,0,.7)] [scrollbar-gutter:stable] sm:max-h-[calc(100dvh-3rem)] sm:w-full sm:rounded-[30px]">
        <button type="button" onClick={() => setOpen(false)} className="premium-focus absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full border border-white/15 bg-black/70 sm:right-4 sm:top-4 sm:size-11" aria-label="Закрити"><X size={20} /></button>
        <div className="grid min-w-0 sm:grid-cols-[.8fr_1.2fr]">
          <div className="relative min-h-40 min-w-0 bg-black sm:min-h-52">
            <Image src={image} alt={vehicle?.vehicleTitle ?? "Підбір автомобіля BRILLIANTCARS"} fill unoptimized={externalImage} sizes="(max-width: 640px) 100vw, 40vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 min-w-0 p-4 sm:p-5">
              <span className="text-[11px] font-black uppercase tracking-[.12em] text-[#ff7b1a]">{vehicle ? `${vehicle.platform ?? "Аукціон"} · Lot #${vehicle.lotNumber ?? "—"}` : "Персональний підбір"}</span>
              <h2 id={titleId} className="mt-1 line-clamp-2 break-words pr-12 text-lg font-bold leading-tight sm:mt-2 sm:text-2xl">{vehicle?.vehicleTitle ?? "Знайдемо ваш автомобіль"}</h2>
              {vehicle?.price && <p className="mt-1 text-base font-black sm:mt-2 sm:text-lg">{vehicle.price}</p>}
            </div>
          </div>
          <div className="min-w-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:p-7 sm:pt-16">
            <p className="text-[11px] font-black uppercase tracking-[.13em] text-[#ff7b1a] sm:text-xs">{vehicle ? "Дізнатися деталі" : "Підібрати авто"}</p>
            <h3 className="mt-2 max-w-full break-words text-[clamp(1.45rem,7vw,1.7rem)] font-bold leading-[1.08] tracking-[-.04em] sm:text-2xl">Залиште номер — ми все перевіримо</h3>
            <p className="mt-3 text-sm leading-6 text-white/50">Менеджер уточнить ваші побажання, бюджет і зв’яжеться з вами найближчим часом.</p>
            <div className="mt-4 sm:mt-5"><LeadForm compact vehicle={vehicle} /></div>
          </div>
        </div>
      </section>
    </div>}
  </>;
}
