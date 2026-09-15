"use client";

import Link from "next/link";
import { Instagram, Menu, MessageCircle, Phone, X } from "lucide-react";
import { useState } from "react";
import type { SiteContacts } from "@/lib/site-contacts";
import { buttonStyles } from "./ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { TrackedPhoneLink } from "./tracked-phone-link";
import { BrandLogo } from "./brand-logo";
import { LeadDialogButton } from "./lead-dialog-button";

const nav = [["Авто зі США", "/cars"], ["Аукціони", "/#auctions"], ["Як ми працюємо", "/#process"], ["Калькулятор", "/#calculator"], ["Доставка", "/#delivery"], ["Відгуки", "/#reviews"], ["Питання", "/#faq"]] as const;

export function SiteHeaderClient({ contacts }: { contacts: SiteContacts }) {
  const [open, setOpen] = useState(false);
  const phoneLabel = `Зателефонувати ${contacts.phoneDisplay}`;
  return <header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#070807]/85 backdrop-blur-2xl">
    <div className="shell flex h-[68px] min-w-0 items-center justify-between gap-2 sm:h-[76px] sm:gap-4">
      <Link href="/" className="premium-focus min-w-0 flex-1 overflow-hidden rounded-lg no-underline md:flex-none" aria-label="BRILLIANTCARS — головна"><BrandLogo compact /></Link>
      <nav className="hidden items-center gap-5 xl:flex" aria-label="Основна навігація">{nav.map(([label,href])=><Link key={href} href={href} className="premium-focus rounded-md text-[13px] font-semibold text-white/65 no-underline transition hover:text-white">{label}</Link>)}</nav>
      <div className="hidden items-center gap-2 md:flex"><TrackedPhoneLink phone={contacts.phoneHref} location="header_desktop" className="premium-focus hidden rounded-lg px-2 text-sm font-bold no-underline lg:block" ariaLabel={phoneLabel}>{contacts.phoneDisplay}</TrackedPhoneLink><a href={contacts.telegramUrl} target="_blank" rel="noreferrer" className="premium-focus grid size-10 place-items-center rounded-xl border border-white/10 text-white/70 transition hover:text-white" aria-label="Telegram"><MessageCircle size={17}/></a><LanguageSwitcher/><LeadDialogButton className={buttonStyles("primary")}>Підібрати авто</LeadDialogButton></div>
      <div className="flex shrink-0 items-center gap-1.5 md:hidden"><LanguageSwitcher/><button type="button" onClick={()=>setOpen(value=>!value)} className="premium-focus grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 sm:size-11" aria-expanded={open} aria-label={open?"Закрити меню":"Відкрити меню"}>{open?<X size={20}/>:<Menu size={20}/>}</button></div>
    </div>
    {open&&<div className="border-t border-white/10 bg-[#090a09] px-3 pb-5 pt-3 md:hidden"><nav className="mx-auto grid max-w-xl gap-1" aria-label="Мобільна навігація">{nav.map(([label,href])=><Link key={href} href={href} onClick={()=>setOpen(false)} className="premium-focus rounded-xl px-4 py-3 text-sm font-semibold text-white/75 no-underline hover:bg-white/[.06] hover:text-white">{label}</Link>)}<div className="mt-3 border-t border-white/10 px-1 pt-4"><p className="px-3 text-[11px] font-black uppercase tracking-[.16em] text-white/45">Контакти</p><TrackedPhoneLink phone={contacts.phoneHref} location="header_mobile" className="premium-focus mt-3 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#ff6b00] px-4 py-3 font-bold text-white no-underline shadow-[0_10px_30px_rgba(255,107,0,.22)]" ariaLabel={phoneLabel}><Phone size={17}/>Зателефонувати</TrackedPhoneLink><div className="mt-2 grid grid-cols-2 gap-2"><a href={contacts.telegramUrl} target="_blank" rel="noreferrer" className="premium-focus flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.04] font-semibold text-white/80 no-underline" aria-label="Відкрити Telegram"><MessageCircle size={18} className="text-[#ff7a18]"/>Telegram</a><a href={contacts.instagramUrl} target="_blank" rel="noreferrer" className="premium-focus flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.04] font-semibold text-white/80 no-underline" aria-label="Відкрити Instagram"><Instagram size={18} className="text-[#ff7a18]"/>Instagram</a></div><p className="mt-2 text-center text-xs text-white/45">{contacts.phoneDisplay}</p></div><LeadDialogButton onOpen={()=>setOpen(false)} className={`${buttonStyles()} mt-3`}>Підібрати авто</LeadDialogButton></nav></div>}
  </header>;
}
