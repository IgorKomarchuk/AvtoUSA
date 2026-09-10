import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "@/components/lead-form";
import { getVehicleBySlug } from "@/lib/vehicle-repository";
import { formatUsd } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Залишити заявку на автомобіль",
  robots: { index: false, follow: true },
};

export default async function OrderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  const context = vehicle ? {
    vehicleId: vehicle.id, vin: vehicle.vin, lotNumber: vehicle.lotNumber,
    vehicleTitle: vehicle.title, price: formatUsd(vehicle.buyNowPrice ?? vehicle.currentBid),
    vehicleUrl: `/cars/${vehicle.slug}`, source: "vehicle_social",
  } : { vehicleTitle: slug.replaceAll("-", " "), source: "vehicle_social" };
  return <main className="flex min-h-dvh items-center justify-center bg-black/80 px-3 py-6 sm:p-8">
    <section aria-labelledby="order-title" className="relative w-full min-w-0 max-w-lg rounded-3xl border border-white/15 bg-[#101210] p-5 shadow-2xl sm:p-8">
      <Link href="/" aria-label="На головну" className="absolute right-4 top-3 p-2 text-2xl text-white/60">×</Link>
      <p className="pr-8 text-xs font-black uppercase tracking-widest text-[#ff7b1a]">BRILLIANTCARS · Заявка на авто</p>
      <h1 id="order-title" className="mt-4 break-words text-2xl font-bold">{vehicle?.title ?? "Замовити автомобіль"}</h1>
      <p className="mb-6 mt-3 text-sm leading-6 text-white/60">Залиште ім’я та телефон — менеджер зв’яжеться з вами найближчим часом.</p>
      <LeadForm compact vehicle={context} />
    </section>
  </main>;
}
