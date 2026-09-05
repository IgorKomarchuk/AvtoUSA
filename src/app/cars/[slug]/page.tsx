import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogPage, catalogMetadata, type CatalogSearchParams } from "@/components/catalog-page";
import { VehicleDetail } from "@/components/vehicle-detail";
import { getVehicleBySlug, getVehicles } from "@/lib/vehicle-repository";
import { absoluteUrl } from "@/lib/utils";
import { formatUsd } from "@/lib/format";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<CatalogSearchParams> };

export const dynamic = "force-dynamic";

function titleCase(value: string) {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

const makeAliases: Record<string, string> = {
  bmw: "BMW",
  iaai: "IAAI",
  mercedes: "Mercedes-Benz",
  "mercedes-benz": "Mercedes-Benz",
};

function makeFromSlug(slug: string) {
  return makeAliases[slug.toLowerCase()] ?? titleCase(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) return catalogMetadata(makeFromSlug(slug));
  const title = `${vehicle.title} з аукціону ${vehicle.platform} | VIN ${vehicle.vin ?? vehicle.lotNumber}`;
  const description = `Купити ${vehicle.title} з аукціону ${vehicle.platform} у США. ${formatUsd(vehicle.buyNowPrice ?? vehicle.currentBid)}, VIN, фото, ${vehicle.primaryDamage ?? "пошкодження"}, пробіг і розрахунок доставки в Україну.`;
  return {
    title,
    description,
    alternates: { canonical: `/cars/${vehicle.slug}` },
    robots: vehicle.isDemo ? { index: false, follow: true } : undefined,
    openGraph: { title, description, type: "website", url: absoluteUrl(`/cars/${vehicle.slug}`), images: vehicle.photos[0] ? [{ url: vehicle.photos[0].url, alt: vehicle.title }] : undefined },
    twitter: { card: "summary_large_image", title, description, images: vehicle.photos[0] ? [vehicle.photos[0].url] : undefined },
  };
}

export default async function VehicleOrCategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (vehicle) {
    const structured = vehicle.isDemo ? null : {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Головна", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "Автомобілі", item: absoluteUrl("/cars") }, { "@type": "ListItem", position: 3, name: vehicle.title, item: absoluteUrl(`/cars/${vehicle.slug}`) }] },
        { "@type": "Vehicle", name: vehicle.title, vehicleIdentificationNumber: vehicle.vin, vehicleModelDate: vehicle.year?.toString(), manufacturer: vehicle.make ? { "@type": "Organization", name: vehicle.make } : undefined, model: vehicle.model, mileageFromOdometer: vehicle.odometerKm ? { "@type": "QuantitativeValue", value: vehicle.odometerKm, unitCode: "KMT" } : undefined, color: vehicle.color, image: vehicle.photos.map((photo) => photo.url), url: absoluteUrl(`/cars/${vehicle.slug}`), offers: (vehicle.buyNowPrice ?? vehicle.currentBid) ? { "@type": "Offer", priceCurrency: "USD", price: vehicle.buyNowPrice ?? vehicle.currentBid, availability: "https://schema.org/InStock", url: absoluteUrl(`/cars/${vehicle.slug}`) } : undefined },
      ],
    };
    return <>{structured && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} />}<VehicleDetail vehicle={vehicle} /></>;
  }

  const normalized = slug.toLowerCase();
  if (normalized === "copart" || normalized === "iaai") {
    const platform = normalized.toUpperCase() as "COPART" | "IAAI";
    return <CatalogPage searchParams={await searchParams} preset={{ platform }} heading={`Автомобілі з аукціону ${platform}`} intro={`Лоти ${platform} з VIN, фото, пробігом, пошкодженнями та актуальними ставками.`} />;
  }
  const candidate = makeFromSlug(slug);
  const result = await getVehicles({ make: candidate, limit: 1 });
  if (result.total) return <CatalogPage searchParams={await searchParams} preset={{ make: result.vehicles[0]?.make ?? candidate }} heading={`${result.vehicles[0]?.make ?? candidate} з аукціонів США`} />;
  notFound();
}
