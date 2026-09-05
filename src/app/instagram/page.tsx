import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VehicleGrid } from "@/components/vehicle-grid";
import { getInstagramPublishedVehicles } from "@/lib/vehicle-repository";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Авто з нашого Instagram",
  description: "Актуальні автомобілі DRIVE STATE, опубліковані в Instagram, з фото, VIN, ціною та розрахунком доставки.",
  alternates: { canonical: "/instagram" },
  openGraph: { title: "Авто з Instagram | DRIVE STATE", description: "Оберіть автомобіль із наших останніх Instagram-публікацій.", url: "/instagram" },
};

export default async function InstagramLandingPage() {
  const vehicles = await getInstagramPublishedVehicles();
  return <><SiteHeader/><main className="shell min-h-[70vh] pb-24 pt-36"><p className="text-xs font-black uppercase tracking-[.14em] text-[#ff7b1a]">DRIVE STATE × Instagram</p><h1 className="mt-3 max-w-4xl text-4xl font-black tracking-[-.055em] sm:text-6xl">Авто з нашого Instagram</h1><p className="mt-5 max-w-2xl text-white/55">Тут зібрані реальні лоти з наших Instagram-публікацій. Відкрийте потрібне авто, перегляньте VIN, фото й отримайте точний розрахунок.</p><div className="mt-10"><VehicleGrid vehicles={vehicles} sourceChannel="INSTAGRAM"/></div></main><SiteFooter/></>;
}
