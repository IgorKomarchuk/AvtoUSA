import "server-only";

import { getPrisma } from "./prisma";
import { mockVehicles } from "./mock-data";
import type { ApiUsageData } from "./types";

const emptyUsage: ApiUsageData = { plan: null, used: null, remaining: null, limit: null, updatedAt: null };

export async function getAdminDashboard() {
  const prisma = getPrisma();
  if (!prisma) {
    return {
      demo: true,
      vehicles: mockVehicles.length,
      copart: mockVehicles.filter((vehicle) => vehicle.platform === "COPART").length,
      iaai: mockVehicles.filter((vehicle) => vehicle.platform === "IAAI").length,
      active: mockVehicles.length,
      sold: 0,
      leads: 0,
      lastSync: null as Date | null,
      usage: emptyUsage,
    };
  }
  try {
    const [vehicles, copart, iaai, active, sold, leads, lastSync, usageSetting] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { platform: "COPART" } }),
      prisma.vehicle.count({ where: { platform: "IAAI" } }),
      prisma.vehicle.count({ where: { isActive: true } }),
      prisma.vehicle.count({ where: { auctionStatus: { in: ["Sold", "Ended"] } } }),
      prisma.lead.count(),
      prisma.auctionSyncLog.findFirst({ where: { status: "SUCCESS" }, orderBy: { finishedAt: "desc" }, select: { finishedAt: true } }),
      prisma.siteSetting.findUnique({ where: { key: "apibara_usage" } }),
    ]);
    const parsedUsage = usageSetting?.value && typeof usageSetting.value === "object" ? (usageSetting.value as unknown as ApiUsageData) : emptyUsage;
    return { demo: false, vehicles, copart, iaai, active, sold, leads, lastSync: lastSync?.finishedAt ?? null, usage: parsedUsage };
  } catch {
    return { demo: true, vehicles: mockVehicles.length, copart: 6, iaai: 6, active: mockVehicles.length, sold: 0, leads: 0, lastSync: null, usage: emptyUsage };
  }
}

export async function getSyncLogs() {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.auctionSyncLog.findMany({ orderBy: { startedAt: "desc" }, take: 50 });
  } catch {
    return [];
  }
}

export async function getAdminLeads() {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 300 });
  } catch {
    return [];
  }
}
