import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { buttonStyles } from "./ui/button";

const benefits = ["Перевірка VIN", "Прозора вартість", "Доставка під ключ", "Повний супровід"];

export function Hero() {
  return (
    <section className="relative min-h-[760px] overflow-hidden border-b border-white/[.06]">
      <Image src="/assets/hero-car.png" alt="Преміальний автомобіль DRIVE STATE" fill priority sizes="100vw" className="object-cover object-[64%_center]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#050605_0%,rgba(5,6,5,.96)_32%,rgba(5,6,5,.35)_68%,rgba(5,6,5,.15)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#070807] to-transparent" />
      <div className="shell relative z-10 flex min-h-[760px] items-center py-24">
        <div className="max-w-3xl animate-rise">
          <div className="eyebrow">Copart · IAAI · доставка в Україну</div>
          <h1 className="mt-6 max-w-3xl text-[clamp(3.7rem,7.5vw,7.4rem)] font-[780] leading-[.88] tracking-[-.07em]">Авто зі США <span className="text-[#ff6b00]">під ключ</span></h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/65 sm:text-lg">Підберемо автомобіль на Copart та IAAI, перевіримо історію, викупимо, доставимо й розмитнимо в Україні.</p>
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
