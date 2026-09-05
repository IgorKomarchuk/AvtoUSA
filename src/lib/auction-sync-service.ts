import "server-only";

import { ApibaraClient, ApibaraError } from "./apibara";
import { getPrisma } from "./prisma";
import type { AuctionPlatform, SyncResult, VehicleData } from "./types";

function serializable(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as object;
}

export class AuctionSyncService {
  private readonly client = new ApibaraClient();

  async syncVehicles(): Promise<SyncResult> {
    return this.syncProvider("all");
  }

  async syncCopart(): Promise<SyncResult> {
    return this.syncProvider("copart");
  }

  async syncIAAI(): Promise<SyncResult> {
    return this.syncProvider("iaai");
  }

  async syncSingleVehicle(identifier: string): Promise<SyncResult> {
    const prisma = getPrisma();
    if (!this.client.configured) return this.skipped("single", "APIBARA_API_KEY не налаштовано; використовується DEMO-режим");
    if (!prisma) return this.skipped("single", "DATABASE_URL не налаштовано; синхронізація не може бути збережена");
    const log = await prisma.auctionSyncLog.create({ data: { provider: "single", endpoint: `/vehicles/${identifier}` } });
    try {
      const vehicle = await this.client.singleVehicle(identifier);
      const existed = await prisma.vehicle.findUnique({
        where: { identityKey: `${vehicle.platform}:${vehicle.lotNumber}` },
        select: { id: true },
      });
      await this.upsertVehicle(vehicle);
      await prisma.auctionSyncLog.update({
        where: { id: log.id },
        data: { status: "SUCCESS", finishedAt: new Date(), apiRequests: 1, receivedRecords: 1, createdRecords: existed ? 0 : 1, updatedRecords: existed ? 1 : 0 },
      });
      return { status: "SUCCESS", provider: "single", apiRequests: 1, receivedRecords: 1, createdRecords: existed ? 0 : 1, updatedRecords: existed ? 1 : 0 };
    } catch (error) {
      return this.failLog(log.id, "single", 1, error);
    }
  }

  async cleanupExpiredLots() {
    const prisma = getPrisma();
    if (!prisma) return 0;
    const threshold = new Date(Date.now() - 7 * 86_400_000);
    const result = await prisma.vehicle.updateMany({
      where: { isDemo: false, isActive: true, auctionDate: { lt: threshold }, auctionStatus: { in: ["Ended", "Sold", "Removed"] } },
      data: { isActive: false },
    });
    return result.count;
  }

  async refreshUsage() {
    const prisma = getPrisma();
    if (!this.client.configured) throw new Error("APIBARA_API_KEY не налаштовано");
    const usage = await this.client.usage();
    if (prisma) {
      await prisma.siteSetting.upsert({
        where: { key: "apibara_usage" },
        create: { key: "apibara_usage", value: serializable(usage) },
        update: { value: serializable(usage) },
      });
    }
    return usage;
  }

  private async syncProvider(provider: "all" | "copart" | "iaai"): Promise<SyncResult> {
    const prisma = getPrisma();
    if (!this.client.configured) return this.skipped(provider, "APIBARA_API_KEY не налаштовано; використовується DEMO-режим");
    if (!prisma) return this.skipped(provider, "DATABASE_URL не налаштовано; синхронізація не може бути збережена");
    const log = await prisma.auctionSyncLog.create({ data: { provider, endpoint: "/vehicles" } });
    try {
      const response = await this.client.vehicles({ platform: provider === "all" ? undefined : provider });
      let createdRecords = 0;
      let updatedRecords = 0;
      for (const vehicle of response.vehicles) {
        const existing = await prisma.vehicle.findUnique({
          where: { identityKey: `${vehicle.platform}:${vehicle.lotNumber}` },
          select: { id: true },
        });
        await this.upsertVehicle(vehicle);
        if (existing) updatedRecords += 1;
        else createdRecords += 1;
      }
      await prisma.auctionSyncLog.update({
        where: { id: log.id },
        data: {
          status: "SUCCESS",
          finishedAt: new Date(),
          apiRequests: 1,
          receivedRecords: response.vehicles.length,
          createdRecords,
          updatedRecords,
        },
      });
      return { status: "SUCCESS", provider, apiRequests: 1, receivedRecords: response.vehicles.length, createdRecords, updatedRecords };
    } catch (error) {
      return this.failLog(log.id, provider, 1, error);
    }
  }

  private async upsertVehicle(vehicle: VehicleData) {
    const prisma = getPrisma();
    if (!prisma) return;
    const data = {
      identityKey: `${vehicle.platform}:${vehicle.lotNumber}`,
      externalId: vehicle.externalId,
      vin: vehicle.vin,
      lotNumber: vehicle.lotNumber,
      platform: vehicle.platform as AuctionPlatform,
      title: vehicle.title,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      trim: vehicle.trim,
      vehicleType: vehicle.vehicleType,
      bodyStyle: vehicle.bodyStyle,
      engine: vehicle.engine,
      fuel: vehicle.fuel,
      transmission: vehicle.transmission,
      drive: vehicle.drive,
      color: vehicle.color,
      odometerMiles: vehicle.odometerMiles,
      odometerKm: vehicle.odometerKm,
      primaryDamage: vehicle.primaryDamage,
      secondaryDamage: vehicle.secondaryDamage,
      lossType: vehicle.lossType,
      keysAvailable: vehicle.keysAvailable,
      runCondition: vehicle.runCondition,
      currentBid: vehicle.currentBid,
      buyNowPrice: vehicle.buyNowPrice,
      estimatedValue: vehicle.estimatedValue,
      lastSoldPrice: vehicle.lastSoldPrice,
      auctionDate: vehicle.auctionDate,
      auctionStatus: vehicle.auctionStatus,
      seller: vehicle.seller,
      sellerType: vehicle.sellerType,
      facility: vehicle.facility,
      city: vehicle.city,
      state: vehicle.state,
      zip: vehicle.zip,
      latitude: vehicle.latitude,
      longitude: vehicle.longitude,
      saleDocument: vehicle.saleDocument,
      titleType: vehicle.titleType,
      sourceUrl: vehicle.sourceUrl,
      videoUrl: vehicle.videoUrl,
      media360Url: vehicle.media360Url,
      isDemo: false,
      isActive: true,
      rawData: serializable(vehicle.rawData),
      lastSyncedAt: vehicle.lastSyncedAt,
    };
    await prisma.$transaction(async (tx) => {
      const identityKey = `${vehicle.platform}:${vehicle.lotNumber}`;
      const saved = await tx.vehicle.upsert({
        where: { identityKey },
        create: { slug: vehicle.slug, ...data },
        // Deliberately preserve the original slug so published links stay permanent.
        update: data,
      });
      if (vehicle.photos.length) {
        await tx.vehiclePhoto.deleteMany({ where: { vehicleId: saved.id } });
        await tx.vehiclePhoto.createMany({ data: vehicle.photos.map((photo) => ({ vehicleId: saved.id, url: photo.url, alt: photo.alt, position: photo.position })) });
      }
    });
  }

  private skipped(provider: string, errorMessage: string): SyncResult {
    return { status: "SKIPPED", provider, apiRequests: 0, receivedRecords: 0, createdRecords: 0, updatedRecords: 0, errorMessage };
  }

  private async failLog(logId: string, provider: string, apiRequests: number, error: unknown): Promise<SyncResult> {
    const prisma = getPrisma();
    const message = error instanceof ApibaraError ? `${error.message} (HTTP ${error.status})` : error instanceof Error ? error.message : "Невідома помилка синхронізації";
    if (prisma) {
      await prisma.auctionSyncLog.update({ where: { id: logId }, data: { status: "FAILED", finishedAt: new Date(), apiRequests, errorMessage: message.slice(0, 1000) } });
    }
    return { status: "FAILED", provider, apiRequests, receivedRecords: 0, createdRecords: 0, updatedRecords: 0, errorMessage: message };
  }
}
