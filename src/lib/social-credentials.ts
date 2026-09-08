import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import type { SocialChannel } from "@prisma/client";
import { getPrisma } from "./prisma";

const SETTING_KEY = "social_credentials_v1";
const CHECKS_SETTING_KEY = "social_integration_checks_v1";

export const SOCIAL_CREDENTIAL_FIELDS = [
  "telegramBotToken", "telegramChannelId", "telegramLeadChatId", "facebookPageId", "facebookPageAccessToken",
  "instagramBusinessAccountId", "viberBotToken", "viberBroadcastList", "viberSenderName",
] as const;
export type SocialCredentialField = (typeof SOCIAL_CREDENTIAL_FIELDS)[number];
export type SocialCredentials = Record<SocialCredentialField, string>;
export type SocialIntegrationCheck = {
  ok: boolean;
  kind: "connection" | "publication";
  message: string;
  checkedAt: string;
  externalPostUrl?: string | null;
};

const ENV_BY_FIELD: Record<SocialCredentialField, string> = {
  telegramBotToken: "TELEGRAM_BOT_TOKEN", telegramChannelId: "TELEGRAM_CHANNEL_ID",
  telegramLeadChatId: "TELEGRAM_CHAT_ID",
  facebookPageId: "FACEBOOK_PAGE_ID", facebookPageAccessToken: "FACEBOOK_PAGE_ACCESS_TOKEN",
  instagramBusinessAccountId: "INSTAGRAM_BUSINESS_ACCOUNT_ID", viberBotToken: "VIBER_BOT_TOKEN",
  viberBroadcastList: "VIBER_BROADCAST_LIST", viberSenderName: "VIBER_SENDER_NAME",
};

function encryptionKey() {
  const raw = process.env.INTEGRATION_SECRETS_KEY?.trim();
  if (!raw) throw new Error("INTEGRATION_SECRETS_KEY не налаштовано на сервері");
  const key = /^[a-f\d]{64}$/i.test(raw) ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error("INTEGRATION_SECRETS_KEY має містити 32 байти");
  return key;
}

function encrypt(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `v1:${iv.toString("base64")}:${cipher.getAuthTag().toString("base64")}:${encrypted.toString("base64")}`;
}

function decrypt(value: string) {
  const [version, iv, tag, encrypted] = value.split(":");
  if (version !== "v1" || !iv || !tag || !encrypted) throw new Error("Невідомий формат зашифрованих credentials");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64")), decipher.final()]).toString("utf8");
}

async function storedCredentials() {
  const prisma = getPrisma();
  if (!prisma) return {} as Partial<Record<SocialCredentialField, string>>;
  const setting = await prisma.siteSetting.findUnique({ where: { key: SETTING_KEY } });
  if (!setting?.value || typeof setting.value !== "object" || Array.isArray(setting.value)) return {};
  return setting.value as Partial<Record<SocialCredentialField, string>>;
}

export async function getSocialCredentials(): Promise<SocialCredentials> {
  const stored = await storedCredentials();
  const result = {} as SocialCredentials;
  for (const field of SOCIAL_CREDENTIAL_FIELDS) {
    const encrypted = stored[field];
    result[field] = typeof encrypted === "string" && encrypted ? decrypt(encrypted) : process.env[ENV_BY_FIELD[field]]?.trim() ?? "";
  }
  return result;
}

export async function saveSocialCredentials(values: Partial<SocialCredentials>) {
  const prisma = getPrisma();
  if (!prisma) throw new Error("PostgreSQL не підключено");
  const current = await storedCredentials();
  const next: Partial<Record<SocialCredentialField, string>> = { ...current };
  for (const field of SOCIAL_CREDENTIAL_FIELDS) {
    const value = values[field]?.trim();
    if (value) next[field] = encrypt(value);
  }
  await prisma.siteSetting.upsert({ where: { key: SETTING_KEY }, create: { key: SETTING_KEY, value: next }, update: { value: next } });
}

export async function saveSocialIntegrationCheck(channel: SocialChannel, check: SocialIntegrationCheck) {
  const prisma = getPrisma();
  if (!prisma) throw new Error("PostgreSQL не підключено");
  const current = await prisma.siteSetting.findUnique({ where: { key: CHECKS_SETTING_KEY } });
  const value = current?.value && typeof current.value === "object" && !Array.isArray(current.value)
    ? current.value as Partial<Record<SocialChannel, SocialIntegrationCheck>>
    : {};
  await prisma.siteSetting.upsert({
    where: { key: CHECKS_SETTING_KEY },
    create: { key: CHECKS_SETTING_KEY, value: { ...value, [channel]: check } },
    update: { value: { ...value, [channel]: check } },
  });
}

export async function getSocialIntegrationChecks() {
  const prisma = getPrisma();
  if (!prisma) return {} as Partial<Record<SocialChannel, SocialIntegrationCheck>>;
  const setting = await prisma.siteSetting.findUnique({ where: { key: CHECKS_SETTING_KEY } });
  if (!setting?.value || typeof setting.value !== "object" || Array.isArray(setting.value)) return {};
  return setting.value as Partial<Record<SocialChannel, SocialIntegrationCheck>>;
}

export function channelConfigured(channel: SocialChannel, credentials: SocialCredentials) {
  if (channel === "TELEGRAM") return Boolean(credentials.telegramBotToken && credentials.telegramChannelId);
  if (channel === "FACEBOOK") return Boolean(credentials.facebookPageId && credentials.facebookPageAccessToken);
  if (channel === "INSTAGRAM") return Boolean(credentials.instagramBusinessAccountId && credentials.facebookPageAccessToken);
  return Boolean(credentials.viberBotToken && credentials.viberBroadcastList);
}

export async function isSocialChannelConfigured(channel: SocialChannel) {
  return channelConfigured(channel, await getSocialCredentials());
}

function mask(value: string) {
  if (!value) return null;
  return `${"•".repeat(Math.max(8, Math.min(12, value.length - 4)))}${value.slice(-4)}`;
}

export async function getSocialCredentialSummary() {
  const [values, checks] = await Promise.all([getSocialCredentials(), getSocialIntegrationChecks()]);
  return {
    configured: Object.fromEntries((["TELEGRAM", "FACEBOOK", "INSTAGRAM", "VIBER"] as SocialChannel[]).map((channel) => [channel, channelConfigured(channel, values)])) as Record<SocialChannel, boolean>,
    masks: Object.fromEntries(SOCIAL_CREDENTIAL_FIELDS.map((field) => [field, mask(values[field])])) as Record<SocialCredentialField, string | null>,
    checks,
  };
}
