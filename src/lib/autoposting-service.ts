import "server-only";

import type { Prisma, SocialChannel } from "@prisma/client";
import { getPrisma } from "./prisma";
import type { VehicleData } from "./types";
import { DEFAULT_PUBLICATION_FILTERS, publicationQuality, type PublicationFilterConfig } from "./publication-quality";
import { DEFAULT_CHANNEL_CONFIG, DEFAULT_TEMPLATES, SOCIAL_CHANNELS, canQueuePublication, isChannelConfigured } from "./social-config";
import { renderSocialTemplate } from "./social-template";
import { publishToSocialChannel, SocialPublishError } from "./social-publishers";

type VehicleWithPhotos = Prisma.VehicleGetPayload<{ include: { photos: true } }>;

function jsonValue<T>(value: unknown, fallback: T): T {
  return value && typeof value === "object" ? value as T : fallback;
}

function asVehicle(vehicle: VehicleWithPhotos): VehicleData {
  return vehicle as unknown as VehicleData;
}

function timezoneOffset(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const represented = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute), Number(values.second));
  return represented - date.getTime();
}

function zonedDate(date: string, time: string, timeZone: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  return new Date(guess.getTime() - timezoneOffset(guess, timeZone));
}

function localDateString(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function nextSchedule(timeWindows: string[], index: number, now = new Date(), timeZone = process.env.TIMEZONE ?? "Europe/Kyiv") {
  const sorted = [...timeWindows].filter((time) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time)).sort();
  if (!sorted.length) return new Date(now.getTime() + (index + 1) * 15 * 60_000);
  const candidates: Date[] = [];
  for (let dayOffset = 0; dayOffset < 14; dayOffset += 1) {
    const day = new Date(now.getTime() + dayOffset * 86_400_000);
    const date = localDateString(day, timeZone);
    for (const time of sorted) {
      const candidate = zonedDate(date, time, timeZone);
      if (candidate.getTime() > now.getTime()) candidates.push(candidate);
    }
  }
  return candidates[index] ?? new Date(now.getTime() + (index + 1) * 15 * 60_000);
}

export function localDayRange(now = new Date(), timeZone = process.env.TIMEZONE ?? "Europe/Kyiv") {
  const date = localDateString(now, timeZone);
  const [year, month, day] = date.split("-").map(Number);
  const tomorrow = new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
  return { start: zonedDate(date, "00:00", timeZone), end: zonedDate(tomorrow, "00:00", timeZone) };
}

export class AutopostingService {
  async ensureDefaults() {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.$transaction([
      prisma.siteSetting.upsert({ where: { key: "autopost_mode" }, create: { key: "autopost_mode", value: process.env.AUTOPOST_MODE === "auto" ? "auto" : "manual" }, update: {} }),
      prisma.siteSetting.upsert({ where: { key: "autopost_filters" }, create: { key: "autopost_filters", value: DEFAULT_PUBLICATION_FILTERS as unknown as Prisma.InputJsonValue }, update: {} }),
      ...SOCIAL_CHANNELS.map((channel) => prisma.socialTemplate.upsert({ where: { channel }, create: { channel, body: DEFAULT_TEMPLATES[channel] }, update: {} })),
      ...SOCIAL_CHANNELS.map((channel) => prisma.socialChannelSetting.upsert({ where: { channel }, create: { channel, enabled: false, dailyLimit: DEFAULT_CHANNEL_CONFIG[channel].dailyLimit, timeWindows: DEFAULT_CHANNEL_CONFIG[channel].timeWindows }, update: {} })),
    ]);
  }

  async getMode() {
    const prisma = getPrisma();
    if (!prisma) return "manual" as const;
    const setting = await prisma.siteSetting.findUnique({ where: { key: "autopost_mode" } });
    return setting?.value === "auto" ? "auto" as const : "manual" as const;
  }

  async getFilters() {
    const prisma = getPrisma();
    if (!prisma) return DEFAULT_PUBLICATION_FILTERS;
    const setting = await prisma.siteSetting.findUnique({ where: { key: "autopost_filters" } });
    return { ...DEFAULT_PUBLICATION_FILTERS, ...jsonValue<Partial<PublicationFilterConfig>>(setting?.value, {}) };
  }

  async findCandidates(limit = 100) {
    const prisma = getPrisma();
    if (!prisma) return [];
    const filters = await this.getFilters();
    const vehicles = await prisma.vehicle.findMany({
      where: { isActive: true, isDemo: false, publicationDecision: { not: "EXCLUDED" } },
      include: { photos: { orderBy: { position: "asc" } }, socialPublications: { select: { channel: true, status: true } } },
      orderBy: [{ createdAt: "desc" }],
      take: limit,
    });
    return vehicles.map((vehicle) => ({ vehicle, quality: publicationQuality(asVehicle(vehicle), filters), publishedChannels: vehicle.socialPublications.filter((item) => !["FAILED", "CANCELLED"].includes(item.status)).map((item) => item.channel) })).filter((item) => item.quality.eligible);
  }

  async enqueueCandidates() {
    const prisma = getPrisma();
    if (!prisma) return { queued: 0, skipped: "DATABASE_URL is not configured" };
    await this.ensureDefaults();
    const [mode, candidates, settings] = await Promise.all([this.getMode(), this.findCandidates(), prisma.socialChannelSetting.findMany({ where: { enabled: true } })]);
    let queued = 0;
    for (const setting of settings) {
      const today = localDayRange();
      const used = await prisma.socialPublication.count({ where: { channel: setting.channel, createdAt: { gte: today.start, lt: today.end }, status: { not: "CANCELLED" } } });
      const available = Math.max(0, setting.dailyLimit - used);
      const eligible = candidates.filter((item) => mode === "auto" || item.vehicle.publicationDecision === "APPROVED").filter((item) => !item.publishedChannels.includes(setting.channel)).slice(0, available);
      const windows = jsonValue<string[]>(setting.timeWindows, DEFAULT_CHANNEL_CONFIG[setting.channel].timeWindows);
      for (const [index, item] of eligible.entries()) {
        const scheduledAt = nextSchedule(windows, used + index);
        const created = await prisma.socialPublication.upsert({ where: { vehicleId_channel: { vehicleId: item.vehicle.id, channel: setting.channel } }, create: { vehicleId: item.vehicle.id, channel: setting.channel, status: "SCHEDULED", scheduledAt }, update: { status: "SCHEDULED", scheduledAt, errorCode: null, errorMessage: null } }).catch(() => null);
        if (created) queued += 1;
      }
    }
    return { queued, mode };
  }

  async queueVehicle(vehicleId: string, channels: SocialChannel[], publishNow = false) {
    const prisma = getPrisma();
    if (!prisma) throw new Error("DATABASE_URL is not configured");
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId }, include: { photos: { orderBy: { position: "asc" } } } });
    if (!vehicle) throw new Error("Автомобіль не знайдено");
    const quality = publicationQuality(asVehicle(vehicle), await this.getFilters());
    if (!quality.eligible) throw new Error(`Авто не пройшло quality filter: ${quality.reasons.join(", ")}`);
    const results = [];
    const immediateIds: string[] = [];
    for (const channel of [...new Set(channels)]) {
      const setting = await prisma.socialChannelSetting.findUnique({ where: { channel } });
      const dailyLimit = setting?.dailyLimit ?? DEFAULT_CHANNEL_CONFIG[channel].dailyLimit;
      const today = localDayRange();
      const usedToday = await prisma.socialPublication.count({ where: { channel, createdAt: { gte: today.start, lt: today.end }, status: { not: "CANCELLED" } } });
      if (usedToday >= dailyLimit) { results.push({ channel, status: "daily_limit" }); continue; }
      const existing = await prisma.socialPublication.findUnique({ where: { vehicleId_channel: { vehicleId, channel } } });
      if (!canQueuePublication(existing?.status)) { results.push({ channel, status: "duplicate" }); continue; }
      const windows = jsonValue<string[]>(setting?.timeWindows, DEFAULT_CHANNEL_CONFIG[channel].timeWindows);
      const scheduledAt = publishNow ? new Date() : nextSchedule(windows, usedToday);
      const publication = await prisma.socialPublication.upsert({ where: { vehicleId_channel: { vehicleId, channel } }, create: { vehicleId, channel, status: "SCHEDULED", scheduledAt }, update: { status: "SCHEDULED", scheduledAt, errorCode: null, errorMessage: null } });
      results.push({ channel, status: publication.status });
      if (publishNow) immediateIds.push(publication.id);
    }
    if (publishNow) for (const id of immediateIds) await this.processPublication(id);
    return results;
  }

  async processQueue(limit = 10) {
    const prisma = getPrisma();
    if (!prisma) return { processed: 0, published: 0, failed: 0 };
    const rows = await prisma.socialPublication.findMany({ where: { status: { in: ["QUEUED", "SCHEDULED"] }, OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }] }, include: { vehicle: { include: { photos: { orderBy: { position: "asc" } } } } }, orderBy: { scheduledAt: "asc" }, take: limit });
    let published = 0;
    let failed = 0;
    for (const row of rows) {
      const result = await this.processPublication(row.id);
      if (result === "published") published += 1;
      if (result === "failed") failed += 1;
    }
    return { processed: rows.length, published, failed };
  }

  async processPublication(publicationId: string): Promise<"published" | "failed" | "skipped"> {
    const prisma = getPrisma();
    if (!prisma) return "skipped";
    const row = await prisma.socialPublication.findUnique({ where: { id: publicationId }, include: { vehicle: { include: { photos: { orderBy: { position: "asc" } } } } } });
    if (!row || !["QUEUED", "SCHEDULED"].includes(row.status)) return "skipped";
    const claimed = await prisma.socialPublication.updateMany({ where: { id: row.id, status: { in: ["QUEUED", "SCHEDULED"] } }, data: { status: "PUBLISHING" } });
    if (!claimed.count) return "skipped";
    try {
      if (!isChannelConfigured(row.channel)) throw new SocialPublishError(`${row.channel} credentials are not configured`, "NOT_CONFIGURED", false);
      const template = await prisma.socialTemplate.findUnique({ where: { channel: row.channel } });
      const postText = renderSocialTemplate(template?.body ?? DEFAULT_TEMPLATES[row.channel], asVehicle(row.vehicle), row.channel);
      const receipt = await publishToSocialChannel(row.channel, asVehicle(row.vehicle), postText);
      await prisma.socialPublication.update({ where: { id: row.id }, data: { status: "PUBLISHED", postText, externalPostId: receipt.externalPostId, externalPostUrl: receipt.externalPostUrl, publishedAt: new Date(), errorCode: null, errorMessage: null } });
      return "published";
    } catch (error) {
      const code = error instanceof SocialPublishError ? error.code : "UNEXPECTED";
      const message = error instanceof Error ? error.message : "Unknown social publishing error";
      const retryCount = row.retryCount + 1;
      await prisma.$transaction([
        prisma.socialPublication.update({ where: { id: row.id }, data: { status: "FAILED", errorCode: code, errorMessage: message.slice(0, 1000), retryCount } }),
        prisma.socialPublicationError.create({ data: { publicationId: row.id, vehicleId: row.vehicleId, channel: row.channel, errorCode: code, errorMessage: message.slice(0, 1000), retryCount } }),
      ]);
      return "failed";
    }
  }

  async retryFailed(maxRetries = 3) {
    const prisma = getPrisma();
    if (!prisma) return 0;
    const result = await prisma.socialPublication.updateMany({ where: { status: "FAILED", retryCount: { lt: maxRetries }, errorCode: { not: "NOT_CONFIGURED" } }, data: { status: "SCHEDULED", scheduledAt: new Date(Date.now() + 15 * 60_000) } });
    return result.count;
  }

  async cleanupOldQueueItems() {
    const prisma = getPrisma();
    if (!prisma) return 0;
    const threshold = new Date(Date.now() - 7 * 86_400_000);
    const result = await prisma.socialPublication.updateMany({ where: { status: { in: ["QUEUED", "SCHEDULED"] }, scheduledAt: { lt: threshold } }, data: { status: "CANCELLED", errorMessage: "Cancelled automatically: queue item expired" } });
    return result.count;
  }
}
