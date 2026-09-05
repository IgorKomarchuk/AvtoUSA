"use client";

import Link from "next/link";
import { Menu, MessageCircle, Phone, X } from "lucide-react";
import { useState } from "react";
import { buttonStyles } from "./ui/button";
import { LanguageSwitcher } from "./language-switcher";

const nav = [
  ["Авто зі США", "/cars"],
  ["Аукціони", "/#auctions"],
  ["Як ми працюємо", "/#process"],
  ["Калькулятор", "/#calculator"],
  ["Доставка", "/#delivery"],
  ["Відгуки", "/#reviews"],
  ["Питання", "/#faq"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#070807]/85 backdrop-blur-2xl">
      <div className="shell flex h-[76px] items-center justify-between gap-4">
        <Link href="/" className="premium-focus rounded-lg text-xl font-black tracking-[-.045em] no-underline" aria-label="DRIVE STATE — головна">
          DRIVE<span className="text-[#ff6b00]">STATE</span>
        </Link>
        <nav className="hidden items-center gap-5 xl:flex" aria-label="Основна навігація">
          {nav.map(([label, href]) => <Link key={href} href={href} className="premium-focus rounded-md text-[13px] font-semibold text-white/65 no-underline transition hover:text-white">{label}</Link>)}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <a href="tel:+380671234567" className="premium-focus hidden rounded-lg px-2 text-sm font-bold no-underline lg:block">+38 067 123 45 67</a>
          <a href="https://t.me/" target="_blank" rel="noreferrer" className="premium-focus grid size-10 place-items-center rounded-xl border border-white/10 text-white/70 transition hover:text-white" aria-label="Telegram"><MessageCircle size={17} /></a>
          <LanguageSwitcher />
          <Link href="/#request" className={buttonStyles("primary")}>Підібрати авто</Link>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <button type="button" onClick={() => setOpen((value) => !value)} className="premium-focus grid size-11 place-items-center rounded-xl border border-white/10" aria-expanded={open} aria-label={open ? "Закрити меню" : "Відкрити меню"}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-white/10 bg-[#090a09] px-3 pb-5 pt-3 md:hidden">
          <nav className="mx-auto grid max-w-xl gap-1" aria-label="Мобільна навігація">
            {nav.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="premium-focus rounded-xl px-4 py-3 text-sm font-semibold text-white/75 no-underline hover:bg-white/[.06] hover:text-white">{label}</Link>)}
            <a href="tel:+380671234567" className="premium-focus mt-2 flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 font-bold no-underline"><Phone size={16} />+38 067 123 45 67</a>
            <Link href="/#request" onClick={() => setOpen(false)} className={`${buttonStyles()} mt-2`}>Підібрати авто</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
