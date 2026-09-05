import "server-only";

import { mockVehicles } from "./mock-data";
import { getPrisma } from "./prisma";
import type { VehicleData, VehicleFilters, VehiclePageResult } from "./types";

function filterMockVehicles(filters: VehicleFilters) {
  const search = filters.search?.toLowerCase().trim();
  return mockVehicles.filter((vehicle) => {
    const haystack = `${vehicle.vin} ${vehicle.lotNumber} ${vehicle.make} ${vehicle.model} ${vehicle.title}`.toLowerCase();
    const price = vehicle.buyNowPrice ?? vehicle.currentBid ?? 0;
    return (
      (!search || haystack.includes(search)) &&
      (!filters.make || vehicle.make?.toLowerCase() === filters.make.toLowerCase()) &&
      (!filters.model || vehicle.model?.toLowerCase() === filters.model.toLowerCase()) &&
      (!filters.platform || vehicle.platform === filters.platform) &&
      (!filters.yearFrom || (vehicle.year ?? 0) >= filters.yearFrom) &&
      (!filters.yearTo || (vehicle.year ?? 9999) <= filters.yearTo) &&
      (!filters.priceFrom || price >= filters.priceFrom) &&
      (!filters.priceTo || price <= filters.priceTo) &&
      (!filters.odometerTo || (vehicle.odometerMiles ?? 0) <= filters.odometerTo) &&
      (!filters.bodyStyle || vehicle.bodyStyle?.toLowerCase() === filters.bodyStyle.toLowerCase()) &&
      (!filters.fuel || vehicle.fuel?.toLowerCase() === filters.fuel.toLowerCase()) &&
      (!filters.drive || vehicle.drive?.toLowerCase() === filters.drive.toLowerCase()) &&
      (!filters.damage || vehicle.primaryDamage?.toLowerCase().includes(filters.damage.toLowerCase())) &&
      (!filters.state || vehicle.state?.toLowerCase() === filters.state.toLowerCase()) &&
      (!filters.buyNow || Boolean(vehicle.buyNowPrice)) &&
      (!filters.runAndDrive || vehicle.runCondition === "RUNS AND DRIVES")
    );
  });
}

export async function getVehicles(filters: VehicleFilters = {}): Promise<VehiclePageResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(24, Math.max(1, filters.limit ?? 12));
  const prisma = getPrisma();
  if (!prisma) {
    const filtered = filterMockVehicles(filters);
    return {
      vehicles: filtered.slice((page - 1) * pageSize, page * pageSize),
      total: filtered.length,
      page,
      pageSize,
      isDemo: true,
      lastSyncedAt: filtered[0]?.lastSyncedAt ?? null,
    };
  }

  try {
    const search = filters.search?.trim();
    const where = {
      isActive: true,
      ...(search
        ? {
            OR: [
              { vin: { contains: search, mode: "insensitive" as const } },
              { lotNumber: { contains: search, mode: "insensitive" as const } },
              { title: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(filters.make ? { make: { equals: filters.make, mode: "insensitive" as const } } : {}),
      ...(filters.model ? { model: { equals: filters.model, mode: "insensitive" as const } } : {}),
      ...(filters.platform ? { platform: filters.platform } : {}),
      ...((filters.yearFrom || filters.yearTo) && { year: { gte: filters.yearFrom, lte: filters.yearTo } }),
      ...((filters.priceFrom || filters.priceTo) && { currentBid: { gte: filters.priceFrom, lte: filters.priceTo } }),
      ...(filters.odometerTo ? { odometerMiles: { lte: filters.odometerTo } } : {}),
      ...(filters.bodyStyle ? { bodyStyle: { equals: filters.bodyStyle, mode: "insensitive" as const } } : {}),
      ...(filters.fuel ? { fuel: { equals: filters.fuel, mode: "insensitive" as const } } : {}),
      ...(filters.drive ? { drive: { equals: filters.drive, mode: "insensitive" as const } } : {}),
      ...(filters.damage ? { primaryDamage: { contains: filters.damage, mode: "insensitive" as const } } : {}),
      ...(filters.state ? { state: { equals: filters.state, mode: "insensitive" as const } } : {}),
      ...(filters.buyNow ? { buyNowPrice: { not: null } } : {}),
      ...(filters.runAndDrive ? { runCondition: "RUNS AND DRIVES" } : {}),
    };
    const [vehicles, total, latest] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        include: { photos: { orderBy: { position: "asc" } } },
        orderBy: [{ auctionDate: "asc" }, { updatedAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.vehicle.count({ where }),
      prisma.vehicle.findFirst({ where: { isActive: true }, orderBy: { lastSyncedAt: "desc" }, select: { lastSyncedAt: true } }),
    ]);
    if (!vehicles.length && process.env.MOCK_AUCTION_MODE !== "false") return getVehiclesWithoutDatabase(filters);
    return { vehicles: vehicles as VehicleData[], total, page, pageSize, isDemo: vehicles.every((item) => item.isDemo), lastSyncedAt: latest?.lastSyncedAt ?? null };
  } catch {
    return getVehiclesWithoutDatabase(filters);
  }
}

function getVehiclesWithoutDatabase(filters: VehicleFilters): VehiclePageResult {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(24, Math.max(1, filters.limit ?? 12));
  const filtered = filterMockVehicles(filters);
  return { vehicles: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length, page, pageSize, isDemo: true, lastSyncedAt: filtered[0]?.lastSyncedAt ?? null };
}

export async function getVehicleBySlug(slug: string) {
  const prisma = getPrisma();
  if (prisma) {
    try {
      const vehicle = await prisma.vehicle.findFirst({ where: { slug, isActive: true }, include: { photos: { orderBy: { position: "asc" } } } });
      if (vehicle) return vehicle as VehicleData;
    } catch {
      // Database fallback is intentional for local/mock mode.
    }
  }
  return mockVehicles.find((vehicle) => vehicle.slug === slug) ?? null;
}

export async function getCatalogFacets() {
  const result = await getVehicles({ limit: 24 });
  const values = <T,>(items: Array<T | null | undefined>) => [...new Set(items.filter(Boolean) as T[])].sort();
  return {
    makes: values(result.vehicles.map((item) => item.make)),
    models: values(result.vehicles.map((item) => item.model)),
    bodyStyles: values(result.vehicles.map((item) => item.bodyStyle)),
    fuels: values(result.vehicles.map((item) => item.fuel)),
    drives: values(result.vehicles.map((item) => item.drive)),
    damages: values(result.vehicles.map((item) => item.primaryDamage)),
    states: values(result.vehicles.map((item) => item.state)),
  };
}

export async function getInstagramPublishedVehicles(limit = 24) {
  const prisma = getPrisma();
  if (!prisma) return [] as VehicleData[];
  try {
    const publications = await prisma.socialPublication.findMany({
      where: { channel: "INSTAGRAM", status: "PUBLISHED", vehicle: { isActive: true, isDemo: false } },
      include: { vehicle: { include: { photos: { orderBy: { position: "asc" } } } } },
      orderBy: { publishedAt: "desc" },
      take: Math.min(48, Math.max(1, limit)),
    });
    return publications.map((item) => item.vehicle as VehicleData);
  } catch {
    return [] as VehicleData[];
  }
}
