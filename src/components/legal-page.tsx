import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function LegalPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <><SiteHeader /><main className="shell min-h-[70vh] py-16 sm:py-24"><div className="eyebrow">{eyebrow}</div><h1 className="section-title">{title}</h1><article className="mt-10 max-w-3xl space-y-6 text-sm leading-7 text-white/60">{children}</article></main><SiteFooter /></>;
}
