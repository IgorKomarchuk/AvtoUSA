import Link from "next/link";
import { ArrowLeft, CalendarDays, ExternalLink, MapPin, ShieldCheck } from "lucide-react";
import type { VehicleData } from "@/lib/types";
import { formatDate, formatNumber, formatUsd } from "@/lib/format";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { VehicleGallery } from "./vehicle-gallery";
import { Badge } from "./ui/badge";
import { buttonStyles } from "./ui/button";
import { TurnkeyCalculator } from "./turnkey-calculator";
import { LeadForm } from "./lead-form";
import { DemoNotice } from "./demo-notice";

export function VehicleDetail({ vehicle }: { vehicle: VehicleData }) {
  const specs = [
    ["VIN", vehicle.vin], ["Номер лота", vehicle.lotNumber], ["Рік", vehicle.year], ["Марка", vehicle.make], ["Модель", vehicle.model],
    ["Двигун", vehicle.engine], ["Трансмісія", vehicle.transmission], ["Пальне", vehicle.fuel], ["Привід", vehicle.drive], ["Тип кузова", vehicle.bodyStyle],
    ["Колір", vehicle.color], ["Пробіг", vehicle.odometerMiles == null ? null : `${formatNumber(vehicle.odometerMiles)} mi / ${formatNumber(vehicle.odometerKm)} км`],
    ["Ключі", vehicle.keysAvailable == null ? null : vehicle.keysAvailable ? "Є" : "Немає"], ["Run & Drive", vehicle.runCondition], ["Основне пошкодження", vehicle.primaryDamage],
    ["Додаткове пошкодження", vehicle.secondaryDamage], ["Документ", vehicle.saleDocument], ["Продавець", vehicle.seller], ["Аукціон", vehicle.platform],
    ["Місце аукціону", [vehicle.state, vehicle.city, vehicle.facility].filter(Boolean).join(" · ")], ["Дата торгів", formatDate(vehicle.auctionDate)],
  ];
  const displayPrice = vehicle.buyNowPrice ?? vehicle.currentBid;
  return (
    <>
      <SiteHeader />
      <main className="pb-24">
        <div className="shell py-6 sm:py-9"><Link href="/cars" className="premium-focus inline-flex items-center gap-2 rounded-lg text-sm text-white/50 no-underline hover:text-white"><ArrowLeft size={16} />До каталогу</Link></div>
        <section className="shell grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
          <div><VehicleGallery photos={vehicle.photos} title={vehicle.title} />{vehicle.isDemo && <div className="mt-5"><DemoNotice /></div>}</div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="glass rounded-[28px] p-6 sm:p-8">
              <div className="flex flex-wrap gap-2"><Badge className={vehicle.isDemo ? "bg-amber-400 text-black" : "bg-emerald-500"}>{vehicle.isDemo ? "DEMO" : "LIVE AUCTION"}</Badge><Badge>{vehicle.platform}</Badge></div>
              <h1 className="mt-5 text-[clamp(2.2rem,4vw,4rem)] font-bold leading-[.98] tracking-[-.055em]">{vehicle.title}</h1>
              <div className="mt-5 grid gap-2 text-sm text-white/50"><p>VIN: <strong className="text-white/85">{vehicle.vin ?? "—"}</strong></p><p>Lot #: <strong className="text-white/85">{vehicle.lotNumber}</strong></p></div>
              <div className="mt-7 border-y border-white/10 py-6"><p className="text-xs text-white/45">{vehicle.buyNowPrice ? "Купити зараз" : "Поточна ставка"}</p><p className="mt-1 text-5xl font-black tracking-[-.065em]">{formatUsd(displayPrice)}</p>{vehicle.buyNowPrice && vehicle.currentBid && <p className="mt-2 text-sm text-white/45">Поточна ставка: {formatUsd(vehicle.currentBid)}</p>}</div>
              <div className="mt-6 grid gap-3 text-sm text-white/60"><p className="flex items-center gap-2"><CalendarDays size={16} className="text-[#ff7b1a]" />{formatDate(vehicle.auctionDate)}</p><p className="flex items-center gap-2"><MapPin size={16} className="text-[#ff7b1a]" />{[vehicle.state, vehicle.city].filter(Boolean).join(" · ") || "Уточнюється"}</p><p className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#ff7b1a]" />{vehicle.auctionStatus ?? "Статус уточнюється"}</p></div>
              <div className="mt-7 grid gap-3"><a href="#quote" className={buttonStyles("primary")}>Розрахувати вартість в Україні</a><a href="#lead" className={buttonStyles("secondary")}>Замовити автомобіль</a>{vehicle.sourceUrl && !vehicle.isDemo && <a href={vehicle.sourceUrl} target="_blank" rel="nofollow noreferrer" className={`${buttonStyles("ghost")} text-xs`}>Джерело лота <ExternalLink size={14} /></a>}</div>
            </div>
          </aside>
        </section>
        <section className="shell py-20"><div className="eyebrow">Повні дані лота</div><h2 className="section-title">Характеристики автомобіля</h2><dl className="mt-10 grid overflow-hidden rounded-[28px] border border-white/10 sm:grid-cols-2 lg:grid-cols-3">{specs.map(([label,value])=><div key={String(label)} className="border-b border-white/[.07] p-5 last:border-0 sm:border-r"><dt className="text-xs text-white/40">{label}</dt><dd className="mt-2 font-semibold">{value || "—"}</dd></div>)}</dl></section>
        <section id="quote" className="scroll-mt-24 border-y border-white/[.07] bg-white/[.018] py-20"><div className="shell"><div className="eyebrow">Калькулятор</div><h2 className="section-title">Орієнтовна ціна під ключ</h2><div className="mt-10"><TurnkeyCalculator initialPrice={displayPrice ?? undefined} /></div></div></section>
        <section id="lead" className="shell scroll-mt-24 py-20"><div className="glass grid overflow-hidden rounded-[34px] lg:grid-cols-[.8fr_1.2fr]"><div className="bg-[linear-gradient(145deg,rgba(255,107,0,.22),transparent)] p-7 sm:p-10"><div className="eyebrow">Цей автомобіль</div><h2 className="mt-5 text-4xl font-bold leading-none tracking-[-.055em]">Отримати точний розрахунок</h2><p className="mt-5 text-sm leading-6 text-white/50">Передамо менеджеру VIN, номер лота та посилання на цю сторінку автоматично.</p></div><div className="p-7 sm:p-10"><LeadForm vehicle={{ vehicleId: vehicle.id, vin: vehicle.vin, lotNumber: vehicle.lotNumber, vehicleTitle: vehicle.title, price: formatUsd(displayPrice) }} /></div></div></section>
      </main>
      <SiteFooter />
    </>
  );
}
