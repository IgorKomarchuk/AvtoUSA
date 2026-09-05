import type { MetadataRoute } from "next";
import { getVehicles } from "@/lib/vehicle-repository";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const catalog = await getVehicles({ limit: 24 });
  const core: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/cars"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/cars/copart"), lastModified: now, changeFrequency: "daily", priority: 0.75 },
    { url: absoluteUrl("/cars/iaai"), lastModified: now, changeFrequency: "daily", priority: 0.75 },
    { url: absoluteUrl("/instagram"), lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: absoluteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
  const realVehicles = catalog.vehicles.filter((vehicle) => !vehicle.isDemo).map((vehicle) => ({ url: absoluteUrl(`/cars/${vehicle.slug}`), lastModified: vehicle.updatedAt ?? vehicle.lastSyncedAt, changeFrequency: "daily" as const, priority: 0.8 }));
  return [...core, ...realVehicles];
}
