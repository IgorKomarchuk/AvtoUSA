import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CatalogPage, catalogMetadata, type CatalogSearchParams } from "@/components/catalog-page";
import { VehicleDetail } from "@/components/vehicle-detail";
import { getVehicleBySlug, resolveCatalogTaxonomy } from "@/lib/vehicle-repository";
import { absoluteUrl } from "@/lib/utils";
import { formatUsd } from "@/lib/format";
import { catalogRobotsAndCanonical, jsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<CatalogSearchParams> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) {
    const taxonomy = await resolveCatalogTaxonomy(slug);
    return taxonomy ? catalogMetadata(taxonomy.make, `/cars/${slug.toLowerCase()}`, await searchParams) : {};
  }
  const title = `${vehicle.title} з аукціону ${vehicle.platform} | VIN ${vehicle.vin ?? vehicle.lotNumber}`;
  const description = `Купити ${vehicle.title} з аукціону ${vehicle.platform} у США. ${formatUsd(vehicle.buyNowPrice ?? vehicle.currentBid)}, VIN, фото, ${vehicle.primaryDamage ?? "пошкодження"}, пробіг і розрахунок доставки в Україну.`;
  return {
    title,
    description,
    alternates: { canonical: `/cars/${vehicle.slug}` },
    robots: vehicle.isDemo ? { index: false, follow: true } : catalogRobotsAndCanonical(`/cars/${vehicle.slug}`, await searchParams).robots,
    openGraph: { title, description, type: "website", url: absoluteUrl(`/cars/${vehicle.slug}`), images: vehicle.photos[0] ? [{ url: vehicle.photos[0].url, alt: vehicle.title }] : undefined },
    twitter: { card: "summary_large_image", title, description, images: vehicle.photos[0] ? [vehicle.photos[0].url] : undefined },
  };
}

export default async function VehicleOrCategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  if (query.request === "1") {
    const forwarded = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === "string") forwarded.set(key, value);
      else if (Array.isArray(value)) value.forEach((item) => forwarded.append(key, item));
    }
    redirect(`/order/${encodeURIComponent(slug)}?${forwarded}`);
  }
  const vehicle = await getVehicleBySlug(slug);
  if (vehicle) {
    const structured = vehicle.isDemo ? null : {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Головна", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "Автомобілі", item: absoluteUrl("/cars") }, { "@type": "ListItem", position: 3, name: vehicle.title, item: absoluteUrl(`/cars/${vehicle.slug}`) }] },
        {
          "@type": vehicle.buyNowPrice ? ["Product", "Vehicle"] : "Vehicle",
          "@id": absoluteUrl(`/cars/${vehicle.slug}#vehicle`),
          name: vehicle.title,
          description: `${vehicle.title}, лот ${vehicle.lotNumber} на ${vehicle.platform}. ${vehicle.primaryDamage ? `Основне пошкодження: ${vehicle.primaryDamage}.` : ""}`.trim(),
          sku: `${vehicle.platform}-${vehicle.lotNumber}`,
          vehicleIdentificationNumber: vehicle.vin,
          vehicleModelDate: vehicle.year?.toString(),
          manufacturer: vehicle.make ? { "@type": "Organization", name: vehicle.make } : undefined,
          model: vehicle.model,
          mileageFromOdometer: vehicle.odometerKm ? { "@type": "QuantitativeValue", value: vehicle.odometerKm, unitCode: "KMT" } : undefined,
          color: vehicle.color,
          image: vehicle.photos.map((photo) => photo.url),
          url: absoluteUrl(`/cars/${vehicle.slug}`),
          additionalProperty: [
            { "@type": "PropertyValue", name: "Auction platform", value: vehicle.platform },
            { "@type": "PropertyValue", name: "Lot number", value: vehicle.lotNumber },
            vehicle.currentBid != null ? { "@type": "PropertyValue", name: "Current bid (USD)", value: vehicle.currentBid } : null,
            vehicle.primaryDamage ? { "@type": "PropertyValue", name: "Primary damage", value: vehicle.primaryDamage } : null,
            vehicle.auctionDate ? { "@type": "PropertyValue", name: "Auction date", value: vehicle.auctionDate.toISOString() } : null,
          ].filter(Boolean),
          offers: vehicle.buyNowPrice ? { "@type": "Offer", priceCurrency: "USD", price: vehicle.buyNowPrice, availability: "https://schema.org/InStock", url: absoluteUrl(`/cars/${vehicle.slug}`) } : undefined,
        },
      ],
    };
    return <>{structured && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />}<VehicleDetail vehicle={vehicle} /></>;
  }

  const normalized = slug.toLowerCase();
  if (normalized === "copart" || normalized === "iaai") {
    const platform = normalized.toUpperCase() as "COPART" | "IAAI";
    return <CatalogPage searchParams={await searchParams} preset={{ platform }} heading={`Автомобілі з аукціону ${platform}`} intro={`Лоти ${platform} з VIN, фото, пробігом, пошкодженнями та актуальними ставками.`} />;
  }
  const taxonomy = await resolveCatalogTaxonomy(slug);
  if (taxonomy) return <CatalogPage searchParams={await searchParams} preset={{ make: taxonomy.make }} heading={`${taxonomy.make} з аукціонів США`} />;
  notFound();
}
