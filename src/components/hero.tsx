import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { buttonStyles } from "./ui/button";

const benefits = ["Перевірка VIN", "Прозора вартість", "Доставка під ключ", "Повний супровід"];

export function Hero() {
  return (
    <section className="hero-bright relative min-h-[650px] overflow-hidden border-b border-white/[.08] sm:min-h-[720px] lg:min-h-[760px]">
      <Image src="/assets/hero-car.png" alt="Преміальний автомобіль BRILLIANTCARS" fill priority sizes="100vw" className="object-cover object-[72%_center] sm:object-[64%_center]" />
      <div className="hero-veil absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#24241f] via-[#22221e]/70 to-transparent sm:h-64" />
      <div className="shell relative z-10 flex min-h-[650px] min-w-0 items-center py-16 sm:min-h-[720px] sm:py-24 lg:min-h-[760px]">
        <div className="w-full min-w-0 max-w-3xl animate-rise">
          <div className="eyebrow">Copart · IAAI · доставка в Україну</div>
          <h1 className="mt-5 max-w-3xl text-[clamp(2.85rem,13vw,4.8rem)] font-[780] leading-[.9] tracking-[-.06em] sm:mt-6 sm:text-[clamp(4.6rem,7.5vw,7.4rem)]">Авто зі США <span className="text-[#ff6b00]">під ключ</span></h1>
          <p className="mt-7 w-full max-w-xl text-base leading-7 text-white/65 sm:text-lg">Підберемо автомобіль на Copart та IAAI, перевіримо історію, викупимо, доставимо й розмитнимо в Україні.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#request" className={buttonStyles("primary")}>Підібрати авто <ArrowUpRight size={17} /></Link>
            <Link href="#calculator" className={buttonStyles("secondary")}>Розрахувати вартість</Link>
          </div>
          <div className="mt-10 grid max-w-2xl grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-4">
            {benefits.map((benefit) => <div key={benefit} className="flex items-center gap-2 text-xs font-bold text-white/70"><CheckCircle2 size={15} className="shrink-0 text-[#ff7a18]" />{benefit}</div>)}
          </div>
        </div>
      </div>
    </section>
  );
}
