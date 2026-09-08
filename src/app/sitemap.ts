import type { MetadataRoute } from "next";
import { getSeoInventory } from "@/lib/vehicle-repository";
import { absoluteUrl } from "@/lib/utils";
import { catalogSegment } from "@/lib/seo";

export const revalidate = 1800;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const inventory = await getSeoInventory();
  const core: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/cars"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/cars/copart"), changeFrequency: "daily", priority: 0.75 },
    { url: absoluteUrl("/cars/iaai"), changeFrequency: "daily", priority: 0.75 },
    { url: absoluteUrl("/instagram"), changeFrequency: "daily", priority: 0.6 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
  ];
  const makes = [...new Set(inventory.map((vehicle) => vehicle.make).filter((value): value is string => Boolean(value)))];
  const makeModels = [...new Map(inventory.filter((vehicle) => vehicle.make && vehicle.model).map((vehicle) => [`${vehicle.make}\u0000${vehicle.model}`, { make: vehicle.make!, model: vehicle.model! }])).values()];
  const categories: MetadataRoute.Sitemap = [
    ...makes.map((make) => ({ url: absoluteUrl(`/cars/${catalogSegment(make)}`), changeFrequency: "daily" as const, priority: 0.7 })),
    ...makeModels.map(({ make, model }) => ({ url: absoluteUrl(`/cars/${catalogSegment(make)}/${catalogSegment(model)}`), changeFrequency: "daily" as const, priority: 0.65 })),
  ];
  const realVehicles = inventory.map((vehicle) => ({ url: absoluteUrl(`/cars/${vehicle.slug}`), lastModified: vehicle.updatedAt ?? vehicle.lastSyncedAt, changeFrequency: "daily" as const, priority: 0.8 }));
  return [...core, ...categories, ...realVehicles];
}
