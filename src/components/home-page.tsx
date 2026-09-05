import Link from "next/link";
import { ArrowRight, Clock3, ShieldCheck, Ship, WalletCards } from "lucide-react";
import type { VehiclePageResult } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { Hero } from "./hero";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { VehicleGrid } from "./vehicle-grid";
import { DemoNotice } from "./demo-notice";
import { TurnkeyCalculator } from "./turnkey-calculator";
import { ProcessTimeline } from "./process-timeline";
import { LeadForm } from "./lead-form";
import { buttonStyles } from "./ui/button";

const advantages = [
  [ShieldCheck, "Перевіряємо до ставки", "VIN, документи, історія продажів і характер пошкоджень."],
  [WalletCards, "Показуємо всю економіку", "Аукціон, логістика, митні платежі, ремонт і наша комісія окремо."],
  [Ship, "Контролюємо маршрут", "Від майданчика у США до видачі автомобіля в Україні."],
  [Clock3, "Статуси без тиші", "Фото, документи та оновлення на кожному ключовому етапі."],
] as const;

export function HomePage({ catalog }: { catalog: VehiclePageResult }) {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <section id="auctions" className="scroll-mt-24 py-20 sm:py-28">
          <div className="shell">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div><div className="eyebrow">Реальні лоти Copart та IAAI</div><h2 className="section-title">Свіжі авто з аукціонів США</h2></div>
              <div className="max-w-sm text-sm leading-6 text-white/50"><p>Виберіть автомобіль безпосередньо з американського аукціону.</p><p className="mt-2">Дані оновлено: {formatDateTime(catalog.lastSyncedAt)}</p></div>
            </div>
            {catalog.isDemo && <div className="mt-7"><DemoNotice /></div>}
            <div className="mt-8"><VehicleGrid vehicles={catalog.vehicles} /></div>
            <div className="mt-8 flex justify-center"><Link href="/cars" className={buttonStyles("secondary")}>Дивитися весь каталог <ArrowRight size={17} /></Link></div>
          </div>
        </section>

        <section className="border-y border-white/[.07] bg-white/[.018] py-20 sm:py-28">
          <div className="shell"><div className="eyebrow">Чому DRIVE STATE</div><h2 className="section-title">Контроль угоди замість здогадок</h2><div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{advantages.map(([Icon, title, text]) => <article key={title} className="rounded-3xl border border-white/10 bg-[#0e100e] p-6"><Icon className="text-[#ff7b1a]" size={25} /><h3 className="mt-7 text-xl font-bold tracking-[-.035em]">{title}</h3><p className="mt-3 text-sm leading-6 text-white/48">{text}</p></article>)}</div></div>
        </section>

        <section id="calculator" className="scroll-mt-24 py-20 sm:py-28"><div className="shell"><div className="eyebrow">Попередній розрахунок</div><h2 className="section-title">Зрозумійте бюджет до початку торгів</h2><div className="mt-10"><TurnkeyCalculator /></div></div></section>

        <section id="process" className="scroll-mt-24 border-y border-white/[.07] bg-white/[.018] py-20 sm:py-28"><div className="shell"><div className="eyebrow">Від заявки до ключів</div><h2 className="section-title">Як ми працюємо</h2><div className="mt-10"><ProcessTimeline /></div></div></section>

        <section id="delivery" className="py-20 sm:py-28"><div className="shell grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-center"><div><div className="eyebrow">Логістика під контролем</div><h2 className="section-title">США → порт → Україна</h2><p className="mt-6 max-w-xl text-base leading-7 text-white/50">Організовуємо доставку з аукціонного майданчика, морський фрахт, брокерське оформлення, сертифікацію та доставку до вашого міста.</p></div><div className="glass grid gap-px overflow-hidden rounded-[32px] bg-white/10 sm:grid-cols-3"><div className="bg-[#0d0f0d] p-7"><strong className="text-4xl tracking-[-.06em]">01</strong><p className="mt-8 font-bold">Майданчик США</p><p className="mt-2 text-sm text-white/45">Забір і доставка до порту</p></div><div className="bg-[#0d0f0d] p-7"><strong className="text-4xl tracking-[-.06em]">02</strong><p className="mt-8 font-bold">Океан</p><p className="mt-2 text-sm text-white/45">Контейнер і контроль маршруту</p></div><div className="bg-[#0d0f0d] p-7"><strong className="text-4xl tracking-[-.06em]">03</strong><p className="mt-8 font-bold">Україна</p><p className="mt-2 text-sm text-white/45">Митниця, сертифікація, видача</p></div></div></div></section>

        <section id="reviews" className="border-y border-white/[.07] bg-[#efefe9] py-20 text-[#0a0b0a] sm:py-28"><div className="shell"><div className="text-xs font-black uppercase tracking-[.15em] text-[#c95100]">Відгуки клієнтів</div><h2 className="section-title">Спокійно на кожному етапі</h2><div className="mt-10 grid gap-4 lg:grid-cols-2"><blockquote className="rounded-3xl border border-black/10 bg-white p-7 text-xl leading-8">«До ставки показали історію, ризики та повну смету. Підсумкова цифра залишилася в межах погодженого бюджету.»<footer className="mt-7 text-sm text-black/45">Олександр · BMW X5 · Київ</footer></blockquote><blockquote className="rounded-3xl border border-black/10 bg-white p-7 text-xl leading-8">«Отримувала фото й документи на кожному етапі. Найбільше сподобався прозорий контроль доставки.»<footer className="mt-7 text-sm text-black/45">Марина · Audi Q5 · Львів</footer></blockquote></div></div></section>

        <section id="faq" className="scroll-mt-24 py-20 sm:py-28"><div className="shell grid gap-10 lg:grid-cols-[.7fr_1.3fr]"><div><div className="eyebrow">Питання</div><h2 className="section-title">Коротко про головне</h2></div><div className="divide-y divide-white/10">{[["Скільки часу займає доставка?","Зазвичай 6–10 тижнів від купівлі до прибуття в Україну. Термін залежить від штату, порту та судноплавної лінії."],["Чи можна купити авто без пошкоджень?","Так. На аукціонах є автомобілі з різними статусами — від мінімальних косметичних дефектів до повністю цілих."],["Як я контролюю процес?","Ви отримуєте фото, документи й оновлення статусу на кожному ключовому етапі угоди."],["Чи фіксується ціна заздалегідь?","До торгів ми надаємо докладний розрахунок і погоджуємо максимальну ставку. Змінні ринкові витрати показуємо окремо."]].map(([question,answer],index)=><details key={question} className="group py-6" open={index===0}><summary className="premium-focus flex cursor-pointer list-none items-center justify-between gap-5 rounded-lg text-lg font-bold">{question}<span className="text-2xl text-[#ff6b00] group-open:rotate-45">+</span></summary><p className="mt-4 max-w-2xl text-sm leading-7 text-white/50">{answer}</p></details>)}</div></div></section>

        <section id="request" className="scroll-mt-24 pb-20 sm:pb-28"><div className="shell"><div className="glass grid overflow-hidden rounded-[36px] lg:grid-cols-[.8fr_1.2fr]"><div className="bg-[linear-gradient(145deg,rgba(255,107,0,.2),transparent)] p-7 sm:p-10"><div className="eyebrow">Персональний підбір</div><h2 className="mt-5 text-4xl font-bold leading-none tracking-[-.055em] sm:text-6xl">Знайдемо ваш автомобіль</h2><p className="mt-5 max-w-md text-sm leading-6 text-white/50">Залиште контакти — менеджер уточнить бюджет і вимоги та підготує перші варіанти.</p></div><div className="p-7 sm:p-10"><LeadForm /></div></div></div></section>
      </main>
      <SiteFooter />
    </>
  );
}
