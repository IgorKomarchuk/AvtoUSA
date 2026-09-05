import type { PublicationStatus, SocialChannel } from "@prisma/client";

export const SOCIAL_CHANNELS: SocialChannel[] = ["TELEGRAM", "FACEBOOK", "INSTAGRAM", "VIBER"];

export const DEFAULT_CHANNEL_CONFIG: Record<SocialChannel, { dailyLimit: number; timeWindows: string[] }> = {
  TELEGRAM: { dailyLimit: 5, timeWindows: ["09:00", "12:00", "15:00", "18:00", "21:00"] },
  FACEBOOK: { dailyLimit: 3, timeWindows: ["10:00", "14:00", "19:00"] },
  INSTAGRAM: { dailyLimit: 2, timeWindows: ["11:00", "17:00"] },
  VIBER: { dailyLimit: 3, timeWindows: ["10:00", "15:00", "19:00"] },
};

export const DEFAULT_TEMPLATES: Record<SocialChannel, string> = {
  TELEGRAM: "🚘 {{year}} {{make}} {{model}} {{trim}}\n\n🏷 Аукціон: {{auction}}\n💰 Ставка: {{currentBid}}\n🛣 Пробіг: {{odometer}}\n🔧 Пошкодження: {{primaryDamage}}\n📅 Дата торгів: {{auctionDate}}\n\n👉 Подивитися авто:\n{{vehicleUrl}}",
  FACEBOOK: "🚘 {{year}} {{make}} {{model}} {{trim}}\n\nАукціон: {{auction}}\nСтавка: {{currentBid}}\nПробіг: {{odometer}}\nПошкодження: {{primaryDamage}}\n\nДеталі, фото та розрахунок вартості: {{vehicleUrl}}",
  INSTAGRAM: "🚘 {{year}} {{make}} {{model}} {{trim}}\n\nАукціон: {{auction}}\nЦіна: {{currentBid}}\nПробіг: {{odometer}}\nПошкодження: {{primaryDamage}}\n\nПовна картка авто — за посиланням у профілі.\n{{vehicleUrl}}",
  VIBER: "🚘 {{year}} {{make}} {{model}} {{trim}}\nАукціон: {{auction}}\nЦіна: {{currentBid}}\nПробіг: {{odometer}}\nПошкодження: {{primaryDamage}}",
};

export const UTM_BY_CHANNEL: Record<SocialChannel, { source: string; medium: string; campaign: string }> = {
  TELEGRAM: { source: "telegram", medium: "social", campaign: "auto_lots" },
  FACEBOOK: { source: "facebook", medium: "social", campaign: "auto_lots" },
  INSTAGRAM: { source: "instagram", medium: "social", campaign: "auto_lots" },
  VIBER: { source: "viber", medium: "messenger", campaign: "auto_lots" },
};

export function isChannelConfigured(channel: SocialChannel) {
  if (channel === "TELEGRAM") return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHANNEL_ID);
  if (channel === "FACEBOOK") return Boolean(process.env.FACEBOOK_PAGE_ID && process.env.FACEBOOK_PAGE_ACCESS_TOKEN);
  if (channel === "INSTAGRAM") return Boolean(process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID && process.env.FACEBOOK_PAGE_ACCESS_TOKEN);
  return Boolean(process.env.VIBER_BOT_TOKEN && process.env.VIBER_BROADCAST_LIST);
}

export function canQueuePublication(status?: PublicationStatus | null) {
  return status !== "PUBLISHED";
}
