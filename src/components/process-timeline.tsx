import { BadgeCheck, CarFront, CreditCard, FileCheck2, Gavel, Search, Settings2, Truck } from "lucide-react";

const steps = [
  ["Заявка", Search],
  ["Підбір автомобіля", CarFront],
  ["Перевірка VIN", FileCheck2],
  ["Участь в аукціоні", Gavel],
  ["Оплата та доставка", CreditCard],
  ["Розмитнення", Truck],
  ["Ремонт", Settings2],
  ["Передача клієнту", BadgeCheck],
] as const;

export function ProcessTimeline() {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{steps.map(([label, Icon], index) => <article key={label} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[.035] p-6 transition hover:border-[#ff6b00]/40 hover:bg-white/[.055]"><span className="text-xs font-black tracking-[.15em] text-[#ff7b1a]">{String(index + 1).padStart(2, "0")}</span><Icon size={26} className="mt-7 text-white/70 transition group-hover:text-[#ff7b1a]" /><h3 className="mt-5 text-lg font-bold tracking-[-.03em]">{label}</h3></article>)}</div>;
}
