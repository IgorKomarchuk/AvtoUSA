"use client";

import Link from "next/link";
import { Menu, MessageCircle, Phone, X } from "lucide-react";
import { useState } from "react";
import type { SiteContacts } from "@/lib/site-contacts";
import { buttonStyles } from "./ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { TrackedPhoneLink } from "./tracked-phone-link";
import { BrandLogo } from "./brand-logo";

const nav = [["Авто зі США", "/cars"], ["Аукціони", "/#auctions"], ["Як ми працюємо", "/#process"], ["Калькулятор", "/#calculator"], ["Доставка", "/#delivery"], ["Відгуки", "/#reviews"], ["Питання", "/#faq"]] as const;

export function SiteHeaderClient({ contacts }: { contacts: SiteContacts }) {
  const [open, setOpen] = useState(false);
  const phoneLabel = `Зателефонувати ${contacts.phoneDisplay}`;
  return <header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#070807]/85 backdrop-blur-2xl">
    <div className="shell flex h-[76px] items-center justify-between gap-4">
      <Link href="/" className="premium-focus rounded-lg no-underline" aria-label="BRILLIANTCARS — головна"><BrandLogo compact /></Link>
      <nav className="hidden items-center gap-5 xl:flex" aria-label="Основна навігація">{nav.map(([label,href])=><Link key={href} href={href} className="premium-focus rounded-md text-[13px] font-semibold text-white/65 no-underline transition hover:text-white">{label}</Link>)}</nav>
      <div className="hidden items-center gap-2 md:flex"><TrackedPhoneLink phone={contacts.phoneHref} location="header_desktop" className="premium-focus hidden rounded-lg px-2 text-sm font-bold no-underline lg:block" ariaLabel={phoneLabel}>{contacts.phoneDisplay}</TrackedPhoneLink><a href={contacts.telegramUrl} target="_blank" rel="noreferrer" className="premium-focus grid size-10 place-items-center rounded-xl border border-white/10 text-white/70 transition hover:text-white" aria-label="Telegram"><MessageCircle size={17}/></a><LanguageSwitcher/><Link href="/#request" className={buttonStyles("primary")}>Підібрати авто</Link></div>
      <div className="flex items-center gap-2 md:hidden"><LanguageSwitcher/><button type="button" onClick={()=>setOpen(value=>!value)} className="premium-focus grid size-11 place-items-center rounded-xl border border-white/10" aria-expanded={open} aria-label={open?"Закрити меню":"Відкрити меню"}>{open?<X size={20}/>:<Menu size={20}/>}</button></div>
    </div>
    {open&&<div className="border-t border-white/10 bg-[#090a09] px-3 pb-5 pt-3 md:hidden"><nav className="mx-auto grid max-w-xl gap-1" aria-label="Мобільна навігація">{nav.map(([label,href])=><Link key={href} href={href} onClick={()=>setOpen(false)} className="premium-focus rounded-xl px-4 py-3 text-sm font-semibold text-white/75 no-underline hover:bg-white/[.06] hover:text-white">{label}</Link>)}<TrackedPhoneLink phone={contacts.phoneHref} location="header_mobile" className="premium-focus mt-2 flex min-h-12 items-center gap-2 rounded-xl border border-white/10 px-4 py-3 font-bold no-underline" ariaLabel={phoneLabel}><Phone size={16}/>{contacts.phoneDisplay}</TrackedPhoneLink><Link href="/#request" onClick={()=>setOpen(false)} className={`${buttonStyles()} mt-2`}>Підібрати авто</Link></nav></div>}
  </header>;
}
