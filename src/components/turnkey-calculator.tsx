"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Calculator as CalculatorIcon } from "lucide-react";
import { calculateTurnkey, calculatorDefaults, type CalculatorInput } from "@/lib/calculator";
import { formatUsd } from "@/lib/format";
import { buttonStyles } from "./ui/button";

const fields: Array<[keyof CalculatorInput, string]> = [
  ["vehiclePrice", "Ціна автомобіля на аукціоні"],
  ["auctionFee", "Комісія аукціону"],
  ["inlandDelivery", "Доставка по США"],
  ["oceanFreight", "Морська доставка"],
  ["broker", "Брокер"],
  ["customs", "Розмитнення"],
  ["certification", "Сертифікація"],
  ["ukraineDelivery", "Доставка по Україні"],
  ["repair", "Ремонт"],
  ["companyFee", "Комісія компанії"],
];

export function TurnkeyCalculator({ initialPrice }: { initialPrice?: number }) {
  const [values, setValues] = useState<CalculatorInput>({ ...calculatorDefaults, vehiclePrice: initialPrice ?? calculatorDefaults.vehiclePrice });
  const total = useMemo(() => calculateTurnkey(values), [values]);
  return (
    <div className="glass grid overflow-hidden rounded-[32px] lg:grid-cols-[1.15fr_.85fr]">
      <div className="p-5 sm:p-8 lg:p-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([key, label]) => (
            <label key={key} className="grid gap-2 text-xs font-semibold text-white/55">
              {label}, $
              <input
                className="input"
                type="number"
                min="0"
                inputMode="decimal"
                value={values[key]}
                onChange={(event) => setValues((current) => ({ ...current, [key]: Number(event.target.value) || 0 }))}
              />
            </label>
          ))}
        </div>
      </div>
      <aside className="flex flex-col justify-center bg-[linear-gradient(145deg,rgba(255,107,0,.2),rgba(255,255,255,.025))] p-6 sm:p-10">
        <CalculatorIcon className="text-[#ff7b1a]" size={28} />
        <p className="mt-6 text-xs font-black uppercase tracking-[.15em] text-white/45">Орієнтовна вартість під ключ</p>
        <output className="mt-2 text-[clamp(3.2rem,7vw,5.8rem)] font-black leading-none tracking-[-.07em]">{formatUsd(total)}</output>
        <p className="mt-6 text-sm leading-6 text-white/50">Розрахунок попередній. Фінальна вартість залежить від конкретного автомобіля, комісії аукціону, доставки та курсу валют.</p>
        <a href="#request" className={`${buttonStyles("primary")} mt-7`}>Отримати точний розрахунок <ArrowRight size={17} /></a>
      </aside>
    </div>
  );
}
