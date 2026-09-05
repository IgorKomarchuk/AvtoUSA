import Link from "next/link";
import { Activity, CarFront, ExternalLink, Gauge, LogOut, Megaphone, Users } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", Icon: Gauge },
  { href: "/admin/sync", label: "Синхронізація", Icon: Activity },
  { href: "/admin/autoposting", label: "Автопублікації", Icon: Megaphone },
  { href: "/admin/leads", label: "Заявки", Icon: Users },
] as const;

export function AdminShell({ children, title, description }: { children: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="min-h-screen bg-[#090a09]">
      <header className="border-b border-white/10 bg-[#0c0e0c]">
        <div className="shell flex min-h-20 flex-wrap items-center justify-between gap-4 py-3">
          <Link href="/admin" className="text-xl font-black tracking-[-.04em] no-underline">DRIVE<span className="text-[#ff6b00]">STATE</span> <span className="ml-2 text-xs text-white/35">ADMIN</span></Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            {navItems.map(({ href, label, Icon }) => <Link key={href} href={href} className="premium-focus flex items-center gap-2 rounded-xl px-3 py-2 text-white/60 no-underline hover:bg-white/[.06] hover:text-white"><Icon size={15} />{label}</Link>)}
            <Link href="/cars" className="premium-focus flex items-center gap-2 rounded-xl px-3 py-2 text-white/60 no-underline hover:bg-white/[.06] hover:text-white"><CarFront size={15} />Каталог <ExternalLink size={13} /></Link>
            <form action="/api/admin/logout" method="post"><button className="premium-focus flex items-center gap-2 rounded-xl px-3 py-2 text-white/60 hover:bg-white/[.06] hover:text-white"><LogOut size={15} />Вийти</button></form>
          </nav>
        </div>
      </header>
      <main className="shell py-10">
        <div><p className="text-xs font-black uppercase tracking-[.14em] text-[#ff7b1a]">Панель керування</p><h1 className="mt-2 text-4xl font-bold tracking-[-.05em] sm:text-5xl">{title}</h1>{description && <p className="mt-3 text-sm text-white/45">{description}</p>}</div>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
