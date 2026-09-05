import type { Metadata } from "next";
import Link from "next/link";
import { DemoNotice } from "./demo-notice";
import { VehicleGrid } from "./vehicle-grid";
import { CatalogFilters } from "./catalog-filters";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { getCatalogFacets, getVehicles } from "@/lib/vehicle-repository";
import type { AuctionPlatform, VehicleFilters } from "@/lib/types";

export type CatalogSearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
const number = (value: string | undefined) => value && Number.isFinite(Number(value)) ? Number(value) : undefined;

export function catalogMetadata(label?: string): Metadata {
  const name = label ? `${label} — авто з аукціонів США` : "Автомобілі з аукціонів США";
  return {
    title: name,
    description: `Каталог ${label ? `${label} ` : ""}автомобілів з аукціонів Copart та IAAI: VIN, фото, пробіг, пошкодження, ставки й розрахунок доставки в Україну.`,
    alternates: { canonical: label ? `/cars/${label.toLowerCase().replaceAll(" ", "-")}` : "/cars" },
  };
}

export async function CatalogPage({ searchParams, preset = {}, heading = "Автомобілі з аукціонів США", intro }: { searchParams: CatalogSearchParams; preset?: VehicleFilters; heading?: string; intro?: string }) {
  const defaults = Object.fromEntries(Object.entries(searchParams).map(([key, value]) => [key, first(value) ?? ""]));
  const platformRaw = first(searchParams.platform);
  const filters: VehicleFilters = {
    ...preset,
    search: first(searchParams.search),
    make: preset.make ?? first(searchParams.make),
    model: preset.model ?? first(searchParams.model),
    yearFrom: number(first(searchParams.year_from)),
    yearTo: number(first(searchParams.year_to)),
    priceFrom: number(first(searchParams.price_from)),
    priceTo: number(first(searchParams.price_to)),
    odometerTo: number(first(searchParams.odometer_to)),
    bodyStyle: first(searchParams.body_style),
    fuel: first(searchParams.fuel),
    drive: first(searchParams.drive),
    damage: first(searchParams.damage),
    platform: preset.platform ?? (platformRaw === "COPART" || platformRaw === "IAAI" ? platformRaw as AuctionPlatform : undefined),
    state: first(searchParams.state),
    buyNow: first(searchParams.buy_now) === "1",
    runAndDrive: first(searchParams.run_drive) === "1",
    page: number(first(searchParams.page)) ?? 1,
    limit: 12,
  };
  const [result, facets] = await Promise.all([getVehicles(filters), getCatalogFacets()]);
  const pages = Math.max(1, Math.ceil(result.total / result.pageSize));
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen pb-24">
        <section className="border-b border-white/[.07] bg-[radial-gradient(circle_at_85%_10%,rgba(255,107,0,.12),transparent_26rem)] py-16 sm:py-24">
          <div className="shell"><div className="eyebrow">Copart · IAAI · США</div><h1 className="section-title max-w-5xl">{heading}</h1><p className="mt-6 max-w-2xl text-base leading-7 text-white/50">{intro ?? "Порівнюйте актуальні лоти, переглядайте VIN, фото, пошкодження, ставки та отримуйте персональний розрахунок доставки в Україну."}</p></div>
        </section>
        <section className="shell py-8 sm:py-12">
          <CatalogFilters facets={facets} defaults={{ ...defaults, ...(preset.make ? { make: preset.make } : {}), ...(preset.model ? { model: preset.model } : {}), ...(preset.platform ? { platform: preset.platform } : {}) }} />
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-white/50">Знайдено: <strong className="text-white">{result.total}</strong></p>{result.isDemo && <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">DEMO MODE</span>}</div>
          {result.isDemo && <div className="mt-5"><DemoNotice /></div>}
          <div className="mt-7"><VehicleGrid vehicles={result.vehicles} /></div>
          {pages > 1 && <nav className="mt-10 flex justify-center gap-2" aria-label="Пагінація">{Array.from({ length: pages }, (_, index) => index + 1).map((page) => { const query = new URLSearchParams(defaults); query.set("page", String(page)); return <Link key={page} href={`/cars?${query}`} className={`premium-focus grid size-11 place-items-center rounded-xl border text-sm font-bold no-underline ${page === result.page ? "border-[#ff6b00] bg-[#ff6b00]" : "border-white/10 hover:bg-white/[.06]"}`}>{page}</Link>; })}</nav>}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
