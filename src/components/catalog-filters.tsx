import Link from "next/link";
import { Filter, Search } from "lucide-react";

interface Facets {
  makes: string[];
  models: string[];
  bodyStyles: string[];
  fuels: string[];
  drives: string[];
  damages: string[];
  states: string[];
}

export function CatalogFilters({ facets, defaults }: { facets: Facets; defaults: Record<string, string> }) {
  const select = (name: string, label: string, options: string[]) => (
    <label className="grid gap-2 text-xs font-semibold text-white/50">
      {label}
      <select className="input" name={name} defaultValue={defaults[name] ?? ""}>
        <option value="">Усі</option>
        {options.map((value) => <option key={value} value={value}>{value}</option>)}
      </select>
    </label>
  );
  return (
    <form action="/cars" className="rounded-[26px] border border-white/10 bg-[#0e100e] p-4 sm:p-5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={18} />
        <input className="input pl-11" name="search" defaultValue={defaults.search ?? ""} placeholder="Пошук за VIN, маркою, моделлю або номером лота" />
      </div>
      <details className="group mt-4" open>
        <summary className="premium-focus flex cursor-pointer list-none items-center justify-between rounded-xl py-2 text-sm font-bold"><span className="flex items-center gap-2"><Filter size={17} className="text-[#ff6b00]" />Фільтри</span><span className="text-white/35 group-open:rotate-45">+</span></summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {select("make", "Марка", facets.makes)}
          {select("model", "Модель", facets.models)}
          <label className="grid gap-2 text-xs font-semibold text-white/50">Рік від<input className="input" type="number" name="year_from" min="1990" max="2030" defaultValue={defaults.year_from} /></label>
          <label className="grid gap-2 text-xs font-semibold text-white/50">Рік до<input className="input" type="number" name="year_to" min="1990" max="2030" defaultValue={defaults.year_to} /></label>
          <label className="grid gap-2 text-xs font-semibold text-white/50">Ціна від, $<input className="input" type="number" name="price_from" min="0" defaultValue={defaults.price_from} /></label>
          <label className="grid gap-2 text-xs font-semibold text-white/50">Ціна до, $<input className="input" type="number" name="price_to" min="0" defaultValue={defaults.price_to} /></label>
          <label className="grid gap-2 text-xs font-semibold text-white/50">Пробіг до, mi<input className="input" type="number" name="odometer_to" min="0" defaultValue={defaults.odometer_to} /></label>
          {select("body_style", "Тип кузова", facets.bodyStyles)}
          {select("fuel", "Тип пального", facets.fuels)}
          {select("drive", "Привід", facets.drives)}
          {select("damage", "Пошкодження", facets.damages)}
          <label className="grid gap-2 text-xs font-semibold text-white/50">Аукціон<select className="input" name="platform" defaultValue={defaults.platform ?? ""}><option value="">Усі аукціони</option><option value="COPART">Copart</option><option value="IAAI">IAAI</option></select></label>
          {select("state", "Штат", facets.states)}
          <label className="flex min-h-12 items-center gap-3 rounded-xl border border-white/10 px-4 text-sm text-white/70"><input type="checkbox" name="buy_now" value="1" defaultChecked={defaults.buy_now === "1"} className="size-4 accent-[#ff6b00]" />Лише Buy Now</label>
          <label className="flex min-h-12 items-center gap-3 rounded-xl border border-white/10 px-4 text-sm text-white/70"><input type="checkbox" name="run_drive" value="1" defaultChecked={defaults.run_drive === "1"} className="size-4 accent-[#ff6b00]" />Run & Drive</label>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="premium-focus min-h-12 rounded-[14px] bg-[#ff6b00] px-6 text-sm font-bold shadow-[0_15px_40px_rgba(255,107,0,.2)] hover:bg-[#ff7b1a]" type="submit">Застосувати</button>
          <Link href="/cars" className="premium-focus inline-flex min-h-12 items-center rounded-[14px] border border-white/15 px-6 text-sm font-bold no-underline hover:bg-white/[.06]">Скинути</Link>
        </div>
      </details>
    </form>
  );
}
