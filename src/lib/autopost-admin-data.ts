import "server-only";

import { getPrisma } from "./prisma";
import { AutopostingService, localDayRange } from "./autoposting-service";
import { DEFAULT_CHANNEL_CONFIG, DEFAULT_TEMPLATES, SOCIAL_CHANNELS, isChannelConfigured } from "./social-config";

export async function getAutopostDashboard() {
  const prisma = getPrisma();
  const service = new AutopostingService();
  if (!prisma) return { databaseReady: false, mode: "manual", filters: await service.getFilters(), ready: 0, publishedToday: 0, errors: 0, lastPublishedAt: null as Date | null, channels: SOCIAL_CHANNELS.map((channel) => ({ channel, configured: isChannelConfigured(channel), enabled: false, dailyLimit: DEFAULT_CHANNEL_CONFIG[channel].dailyLimit, timeWindows: DEFAULT_CHANNEL_CONFIG[channel].timeWindows })) };
  await service.ensureDefaults();
  const today = localDayRange();
  const [mode, filters, candidates, publishedToday, errors, lastPublication, settings] = await Promise.all([
    service.getMode(), service.getFilters(), service.findCandidates(), prisma.socialPublication.count({ where: { status: "PUBLISHED", publishedAt: { gte: today.start, lt: today.end } } }), prisma.socialPublication.count({ where: { status: "FAILED" } }), prisma.socialPublication.findFirst({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" } }), prisma.socialChannelSetting.findMany({ orderBy: { channel: "asc" } }),
  ]);
  return { databaseReady: true, mode, filters, ready: candidates.length, publishedToday, errors, lastPublishedAt: lastPublication?.publishedAt ?? null, channels: settings.map((setting) => ({ ...setting, configured: isChannelConfigured(setting.channel), timeWindows: Array.isArray(setting.timeWindows) ? setting.timeWindows as string[] : [] })) };
}

export async function getAutopostCandidates() {
  const service = new AutopostingService();
  return service.findCandidates(200);
}

export async function getAutopostQueue() {
  const prisma = getPrisma();
  if (!prisma) return [];
  return prisma.socialPublication.findMany({ where: { status: { in: ["QUEUED", "SCHEDULED", "PUBLISHING", "FAILED"] } }, include: { vehicle: { include: { photos: { orderBy: { position: "asc" }, take: 1 } } } }, orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }], take: 200 });
}

export async function getAutopostHistory() {
  const prisma = getPrisma();
  if (!prisma) return [];
  return prisma.socialPublication.findMany({ where: { status: { in: ["PUBLISHED", "FAILED", "CANCELLED"] } }, include: { vehicle: true }, orderBy: { updatedAt: "desc" }, take: 200 });
}

export async function getAutopostErrors() {
  const prisma = getPrisma();
  if (!prisma) return [];
  return prisma.socialPublicationError.findMany({
    include: { vehicle: true, publication: true },
    orderBy: { timestamp: "desc" },
    take: 300,
  });
}

export async function getAutopostTemplates() {
  const prisma = getPrisma();
  if (!prisma) return SOCIAL_CHANNELS.map((channel) => ({ channel, body: DEFAULT_TEMPLATES[channel] }));
  await new AutopostingService().ensureDefaults();
  return prisma.socialTemplate.findMany({ orderBy: { channel: "asc" } });
}
