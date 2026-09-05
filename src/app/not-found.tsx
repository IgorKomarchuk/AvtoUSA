import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return <><SiteHeader /><main className="shell flex min-h-[65vh] flex-col items-start justify-center py-20"><div className="eyebrow">404</div><h1 className="section-title">Сторінку не знайдено</h1><p className="mt-5 text-white/50">Можливо, автомобіль уже знято з аукціону або адресу змінено.</p><Link href="/cars" className={`${buttonStyles()} mt-7`}>Перейти до каталогу</Link></main><SiteFooter /></>;
}
