"use client";

import Link from "next/link";
import { Instagram, Menu, MessageCircle, Phone, Send, X } from "lucide-react";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { SiteContacts } from "@/lib/site-contacts";
import { trackEvent } from "@/lib/analytics";
import { buttonStyles } from "./ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { useLanguage } from "./language-provider";
import { TrackedPhoneLink } from "./tracked-phone-link";
import { BrandLogo } from "./brand-logo";
import { LeadDialogButton } from "./lead-dialog-button";

const nav = [["Авто зі США", "/cars"], ["Аукціони", "/#auctions"], ["Як ми працюємо", "/#process"], ["Калькулятор", "/#calculator"], ["Доставка", "/#delivery"], ["Відгуки", "/#reviews"], ["Питання", "/#faq"]] as const;
const subscribeToClient = () => () => undefined;

export function SiteHeaderClient({ contacts }: { contacts: SiteContacts }) {
  const [open, setOpen] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);
  const mounted = useSyncExternalStore(subscribeToClient, () => true, () => false);
  const contactTitleId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { language } = useLanguage();
  const phoneLabel = `Зателефонувати ${contacts.phoneDisplay}`;
  const whatsappUrl = `https://wa.me/${contacts.phoneHref.replace(/\D/g, "")}`;

  useEffect(() => {
    if (!contactsOpen) return;
    const menuButton = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setContactsOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", close);
      menuButton?.focus();
    };
  }, [contactsOpen]);

  const copy = language === "ru"
    ? { title: "Как удобно связаться?", description: "Выберите удобный способ — мы ответим как можно скорее.", phone: "Позвонить", close: "Закрыть контакты", contacts: "Контакты" }
    : { title: "Як зручно зв’язатися?", description: "Оберіть зручний спосіб — ми відповімо якнайшвидше.", phone: "Зателефонувати", close: "Закрити контакти", contacts: "Контакти" };

  function openContacts() {
    setOpen(false);
    setContactsOpen(true);
  }

  return <><header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#070807]/85 backdrop-blur-2xl">
    <div className="shell flex h-[68px] min-w-0 items-center justify-between gap-2 sm:h-[76px] sm:gap-4">
      <Link href="/" className="premium-focus min-w-0 flex-1 overflow-hidden rounded-lg no-underline md:flex-none" aria-label="BRILLIANTCARS — головна"><BrandLogo compact /></Link>
      <nav className="hidden items-center gap-5 xl:flex" aria-label="Основна навігація">{nav.map(([label,href])=><Link key={href} href={href} className="premium-focus rounded-md text-[13px] font-semibold text-white/65 no-underline transition hover:text-white">{label}</Link>)}</nav>
      <div className="hidden items-center gap-2 md:flex"><TrackedPhoneLink phone={contacts.phoneHref} location="header_desktop" className="premium-focus hidden rounded-lg px-2 text-sm font-bold no-underline lg:block" ariaLabel={phoneLabel}>{contacts.phoneDisplay}</TrackedPhoneLink><a href={contacts.telegramUrl} target="_blank" rel="noreferrer" className="premium-focus grid size-10 place-items-center rounded-xl border border-white/10 text-white/70 transition hover:text-white" aria-label="Telegram"><MessageCircle size={17}/></a><LanguageSwitcher/><LeadDialogButton className={buttonStyles("primary")}>Підібрати авто</LeadDialogButton></div>
      <div className="flex shrink-0 items-center gap-1.5 md:hidden"><LanguageSwitcher/><button ref={menuButtonRef} type="button" onClick={()=>setOpen(value=>!value)} className="premium-focus grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 sm:size-11" aria-expanded={open} aria-label={open?"Закрити меню":"Відкрити меню"}>{open?<X size={20}/>:<Menu size={20}/>}</button></div>
    </div>
    {open&&<div className="border-t border-white/10 bg-[#090a09] px-3 pb-5 pt-3 md:hidden"><nav className="mx-auto grid max-w-xl gap-1" aria-label="Мобільна навігація">{nav.map(([label,href])=><Link key={href} href={href} onClick={()=>setOpen(false)} className="premium-focus rounded-xl px-4 py-3 text-sm font-semibold text-white/75 no-underline hover:bg-white/[.06] hover:text-white">{label}</Link>)}<button type="button" onClick={openContacts} className="premium-focus flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-white/75 hover:bg-white/[.06] hover:text-white"><MessageCircle size={18} className="text-[#ff7a18]"/>{copy.contacts}</button><LeadDialogButton onOpen={()=>setOpen(false)} className={`${buttonStyles()} mt-3`}>Підібрати авто</LeadDialogButton></nav></div>}
  </header>{mounted&&createPortal(<>
    {!open&&!contactsOpen&&<button type="button" onClick={openContacts} className="premium-focus fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-3 z-[110] flex min-h-12 items-center gap-2 rounded-full border border-white/20 bg-[#ff6b00] px-4 text-sm font-black text-white shadow-[0_14px_40px_rgba(0,0,0,.5),0_8px_24px_rgba(255,107,0,.3)] md:hidden" aria-label={copy.contacts}><Phone size={19}/><span>{copy.contacts}</span></button>}
    {contactsOpen&&<div className="fixed inset-0 z-[120] flex min-h-dvh items-end justify-center bg-black/80 p-3 backdrop-blur-md md:hidden" role="presentation" onMouseDown={(event)=>{if(event.target===event.currentTarget)setContactsOpen(false);}}>
      <section role="dialog" aria-modal="true" aria-labelledby={contactTitleId} className="w-full max-w-md rounded-[28px] border border-white/15 bg-[#101210] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_30px_100px_rgba(0,0,0,.72)]">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-black uppercase tracking-[.16em] text-[#ff7a18]">BRILLIANTCARS</p><h2 id={contactTitleId} className="mt-2 text-2xl font-black tracking-[-.04em]">{copy.title}</h2></div><button ref={closeButtonRef} type="button" onClick={()=>setContactsOpen(false)} className="premium-focus grid size-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[.04]" aria-label={copy.close}><X size={20}/></button></div>
        <p className="mt-3 text-sm leading-6 text-white/55">{copy.description}</p>
        <div className="mt-5 grid gap-2.5">
          <TrackedPhoneLink phone={contacts.phoneHref} location="header_mobile_contacts" className="premium-focus flex min-h-14 items-center gap-3 rounded-2xl bg-[#ff6b00] px-4 font-bold text-white no-underline shadow-[0_12px_32px_rgba(255,107,0,.22)]" ariaLabel={phoneLabel}><Phone size={20}/><span><span className="block">{copy.phone}</span><span className="block text-xs font-medium text-white/75">{contacts.phoneDisplay}</span></span></TrackedPhoneLink>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" onClick={()=>trackEvent("contact_click",{contact_method:"whatsapp",link_location:"header_mobile_contacts"})} className="premium-focus flex min-h-14 items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/[.08] px-4 font-bold text-white no-underline"><MessageCircle size={20} className="text-emerald-400"/>WhatsApp</a>
          <a href={contacts.telegramUrl} target="_blank" rel="noreferrer" onClick={()=>trackEvent("contact_click",{contact_method:"telegram",link_location:"header_mobile_contacts"})} className="premium-focus flex min-h-14 items-center gap-3 rounded-2xl border border-sky-400/25 bg-sky-400/[.08] px-4 font-bold text-white no-underline"><Send size={20} className="text-sky-400"/>Telegram</a>
          <a href={contacts.instagramUrl} target="_blank" rel="noreferrer" onClick={()=>trackEvent("contact_click",{contact_method:"instagram",link_location:"header_mobile_contacts"})} className="premium-focus flex min-h-14 items-center gap-3 rounded-2xl border border-pink-400/25 bg-pink-400/[.08] px-4 font-bold text-white no-underline"><Instagram size={20} className="text-pink-400"/>Instagram</a>
        </div>
      </section>
    </div>}
  </>, document.body)}</>;
}
