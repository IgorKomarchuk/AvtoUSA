import Link from "next/link";
import { Activity, ArrowLeft, BarChart3, CarFront, ContactRound, ExternalLink, Gauge, KeyRound, LogOut, Megaphone, MessageCircle, Users } from "lucide-react";
import { BrandLogo } from "./brand-logo";

const navItems = [
  { href: "/admin", label: "Dashboard", Icon: Gauge },
  { href: "/admin/sync", label: "Синхронізація", Icon: Activity },
  { href: "/admin/apibara", label: "API аукціонів", Icon: KeyRound },
  { href: "/admin/autoposting", label: "Автопублікації", Icon: Megaphone },
  { href: "/admin/autoposting/integrations", label: "Месенджери", Icon: MessageCircle },
  { href: "/admin/google", label: "Google", Icon: BarChart3 },
  { href: "/admin/leads", label: "Заявки", Icon: Users },
  { href: "/admin/contacts", label: "Контакти", Icon: ContactRound },
] as const;

export function AdminShell({ children, title, description }: { children: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="admin-theme min-h-screen bg-[#f4f6f8] text-[#172033]">
      <header className="border-b border-black/10 bg-white shadow-[0_1px_16px_rgba(15,23,42,.06)]">
        <div className="shell flex min-h-20 flex-wrap items-center justify-between gap-4 py-3">
          <Link href="/admin" className="no-underline"><BrandLogo admin compact /></Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            {navItems.map(({ href, label, Icon }) => <Link key={href} href={href} className="premium-focus flex items-center gap-2 rounded-xl px-3 py-2 text-slate-600 no-underline hover:bg-slate-100 hover:text-slate-950"><Icon size={15} />{label}</Link>)}
            <Link href="/cars" className="premium-focus flex items-center gap-2 rounded-xl px-3 py-2 text-slate-600 no-underline hover:bg-slate-100 hover:text-slate-950"><CarFront size={15} />Каталог <ExternalLink size={13} /></Link>
            <form action="/api/admin/logout" method="post"><button className="premium-focus flex items-center gap-2 rounded-xl px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-950"><LogOut size={15} />Вийти</button></form>
          </nav>
        </div>
      </header>
      <main className="shell py-10">
        <div>
          {title !== "Dashboard" && <Link href="/admin" className="premium-focus mb-5 inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-slate-600 no-underline shadow-sm transition hover:border-black/20 hover:bg-slate-50 hover:text-slate-950"><ArrowLeft size={16} />Назад до Dashboard</Link>}
          <p className="text-xs font-black uppercase tracking-[.14em] text-[#e85f00]">Панель керування</p><h1 className="mt-2 text-4xl font-bold tracking-[-.05em] sm:text-5xl">{title}</h1>{description && <p className="mt-3 text-sm text-slate-600">{description}</p>}
        </div>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
