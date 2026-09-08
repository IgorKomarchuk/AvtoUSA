"use client";

import { useEffect, useRef, useState } from "react";

const advantages = [
  ["01", "Договір і рахунок", "Працюємо за договором з офіційною юридичною особою. Ваші платежі та права документально захищені."],
  ["02", "Чесна ціна", "До ставки показуємо аукціон, логістику, митні платежі, ремонт і нашу комісію окремо."],
  ["03", "Безпечна купівля", "Перевіряємо VIN, документи, історію продажів і характер пошкоджень до участі в торгах."],
  ["04", "Контроль доставки", "Надаємо фото, документи й статуси від майданчика у США до передачі автомобіля в Україні."],
] as const;

export function AdvantagesShowcase() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.18, rootMargin: "-8% 0px -8%" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <div ref={rootRef} className="advantages-stage mt-10 overflow-hidden rounded-[34px] border border-white/10 bg-[#0a0c0b]/72 px-5 py-8 shadow-2xl backdrop-blur-xl sm:px-8 sm:py-10 lg:px-12">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div><div className="eyebrow">Наші переваги</div><h3 className="mt-3 text-3xl font-bold tracking-[-.05em] sm:text-5xl">Спокій на кожному етапі</h3></div>
      <p className="max-w-sm text-sm leading-6 text-white/48">Не обіцянки дрібним шрифтом, а зрозумілий процес, цифри й відповідальність.</p>
    </div>
    <div className="mt-10 grid gap-x-8 gap-y-2 lg:grid-cols-2">
      {advantages.map(([number, title, text], index) => <article key={number} style={{ transitionDelay: visible ? `${index * 90}ms` : "0ms" }} className={`advantage-row group ${visible ? "is-visible" : ""} ${index % 2 ? "from-right" : "from-left"}`}>
        <div className="advantage-number" aria-hidden="true">{number}</div>
        <div className="relative z-10 pb-8 pt-7 sm:pb-10 sm:pt-9">
          <h4 className="text-xl font-black uppercase tracking-[-.035em] sm:text-2xl">{title}</h4>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/52 sm:text-base">{text}</p>
        </div>
      </article>)}
    </div>
  </div>;
}
