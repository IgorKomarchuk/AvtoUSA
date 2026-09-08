import Link from "next/link";
import { Instagram, Mail, MessageCircle } from "lucide-react";
import { TrackedPhoneLink } from "./tracked-phone-link";
import { CookieSettingsButton } from "./cookie-settings-button";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#050605] py-14">
      <div className="shell">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_.8fr_.8fr_1fr]">
          <div>
            <Link href="/" className="text-2xl font-black tracking-[-.05em] no-underline">BRILLIANT<span className="text-[#ff6b00]">CARS</span></Link>
            <p className="mt-4 max-w-sm text-sm text-white/50">Підбір, перевірка, купівля та доставка автомобілів зі США в Україну.</p>
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-[.14em] text-white/40">Авто зі США</h2>
            <div className="mt-4 grid gap-2 text-sm text-white/70">
              <Link href="/cars/copart">Copart</Link><Link href="/cars/iaai">IAAI</Link><Link href="/cars">Каталог</Link><Link href="/#calculator">Калькулятор</Link>
            </div>
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-[.14em] text-white/40">Компанія</h2>
            <div className="mt-4 grid gap-2 text-sm text-white/70">
              <Link href="/#delivery">Доставка</Link><Link href="/#request">Контакти</Link><Link href="/privacy">Політика конфіденційності</Link><Link href="/terms">Публічна оферта</Link><CookieSettingsButton />
            </div>
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-[.14em] text-white/40">Зв’язок</h2>
            <TrackedPhoneLink location="footer" className="mt-4 block text-lg font-bold no-underline" ariaLabel="Зателефонувати +38 073 261 09 65">+38 073 261 09 65</TrackedPhoneLink>
            <a className="mt-3 flex items-center gap-2 break-all text-sm text-white/65 no-underline transition hover:text-white" href="mailto:racenkodmitrij8@gmail.com"><Mail size={16} className="shrink-0 text-[#ff7b1a]" />racenkodmitrij8@gmail.com</a>
            <div className="mt-4 flex gap-2">
              <a href="https://t.me/" target="_blank" rel="noreferrer" className="grid size-11 place-items-center rounded-xl border border-white/10 text-white/60 hover:text-white" aria-label="Telegram"><MessageCircle size={18} /></a>
              <a href="https://instagram.com/" target="_blank" rel="noreferrer" className="grid size-11 place-items-center rounded-xl border border-white/10 text-white/60 hover:text-white" aria-label="Instagram"><Instagram size={18} /></a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-xs leading-6 text-white/35">
          <p>Дані лотів отримані з публічних джерел і стороннього агрегатора даних. Copart та IAAI є товарними знаками відповідних власників. Наша компанія не є Copart або IAAI.</p>
          <p className="mt-2">© {new Date().getFullYear()} BRILLIANTCARS. Усі права захищені.</p>
        </div>
      </div>
    </footer>
  );
}
