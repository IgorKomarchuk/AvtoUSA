import "server-only";

import { createCipheriv, createDecipheriv, randomBytes, randomUUID } from "node:crypto";
import { getPrisma } from "./prisma";

const SETTING_KEY = "apibara_credentials_v1";

type StoredKey = {
  id: string;
  name: string;
  encryptedKey: string;
  createdAt: string;
};

type StoredCredentials = {
  activeId: string | null;
  keys: StoredKey[];
};

export type ApibaraKeySummary = {
  id: string;
  name: string;
  mask: string;
  active: boolean;
  createdAt: string;
  source: "database" | "environment";
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
  if (version !== "v1" || !iv || !tag || !encrypted) throw new Error("Невідомий формат зашифрованого API-ключа");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64")), decipher.final()]).toString("utf8");
}

export function maskApibaraKey(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Не налаштовано";
  const prefix = trimmed.slice(0, Math.min(7, trimmed.length));
  const suffix = trimmed.length > 11 ? trimmed.slice(-4) : "";
  return `${prefix}${"•".repeat(10)}${suffix}`;
}

async function readStored(): Promise<StoredCredentials> {
  const prisma = getPrisma();
  if (!prisma) return { activeId: null, keys: [] };
  const setting = await prisma.siteSetting.findUnique({ where: { key: SETTING_KEY } });
  if (!setting?.value || typeof setting.value !== "object" || Array.isArray(setting.value)) return { activeId: null, keys: [] };
  const value = setting.value as Partial<StoredCredentials>;
  return {
    activeId: typeof value.activeId === "string" ? value.activeId : null,
    keys: Array.isArray(value.keys)
      ? value.keys.filter((item): item is StoredKey => Boolean(item && typeof item.id === "string" && typeof item.name === "string" && typeof item.encryptedKey === "string" && typeof item.createdAt === "string"))
      : [],
  };
}

async function writeStored(value: StoredCredentials) {
  const prisma = getPrisma();
  if (!prisma) throw new Error("PostgreSQL не підключено");
  await prisma.siteSetting.upsert({
    where: { key: SETTING_KEY },
    create: { key: SETTING_KEY, value },
    update: { value },
  });
}

export async function getActiveApibaraKey() {
  const stored = await readStored();
  const active = stored.keys.find((item) => item.id === stored.activeId);
  if (active) return decrypt(active.encryptedKey);
  return process.env.APIBARA_API_KEY?.trim() ?? "";
}

export async function getApibaraKeyById(id: string) {
  if (id === "environment") return process.env.APIBARA_API_KEY?.trim() ?? "";
  const stored = await readStored();
  const item = stored.keys.find((entry) => entry.id === id);
  if (!item) throw new Error("API-ключ не знайдено");
  return decrypt(item.encryptedKey);
}

export async function getApibaraKeySummary(): Promise<ApibaraKeySummary[]> {
  const stored = await readStored();
  const summaries: ApibaraKeySummary[] = stored.keys.map((item) => ({
    id: item.id,
    name: item.name,
    mask: maskApibaraKey(decrypt(item.encryptedKey)),
    active: item.id === stored.activeId,
    createdAt: item.createdAt,
    source: "database",
  }));
  const environmentKey = process.env.APIBARA_API_KEY?.trim();
  if (environmentKey) summaries.unshift({
    id: "environment",
    name: "Ключ із сервера (.env)",
    mask: maskApibaraKey(environmentKey),
    active: !stored.activeId,
    createdAt: "",
    source: "environment",
  });
  return summaries;
}

export async function addApibaraKey(name: string, key: string) {
  const cleanName = name.trim();
  const cleanKey = key.trim();
  if (cleanName.length < 2 || cleanName.length > 60) throw new Error("Назва ключа має містити від 2 до 60 символів");
  if (cleanKey.length < 20 || cleanKey.length > 300) throw new Error("API-ключ має некоректну довжину");
  const stored = await readStored();
  if (stored.keys.length >= 10) throw new Error("Можна зберегти не більше 10 резервних ключів");
  const id = randomUUID();
  stored.keys.push({ id, name: cleanName, encryptedKey: encrypt(cleanKey), createdAt: new Date().toISOString() });
  if (!stored.activeId && !process.env.APIBARA_API_KEY?.trim()) stored.activeId = id;
  await writeStored(stored);
  return id;
}

export async function activateApibaraKey(id: string) {
  const stored = await readStored();
  if (id === "environment") {
    if (!process.env.APIBARA_API_KEY?.trim()) throw new Error("Ключ у .env відсутній");
    stored.activeId = null;
  } else {
    if (!stored.keys.some((item) => item.id === id)) throw new Error("API-ключ не знайдено");
    stored.activeId = id;
  }
  await writeStored(stored);
}

export async function removeApibaraKey(id: string) {
  if (id === "environment") throw new Error("Ключ із .env видаляється лише на сервері");
  const stored = await readStored();
  if (!stored.keys.some((item) => item.id === id)) throw new Error("API-ключ не знайдено");
  stored.keys = stored.keys.filter((item) => item.id !== id);
  if (stored.activeId === id) stored.activeId = process.env.APIBARA_API_KEY?.trim() ? null : stored.keys[0]?.id ?? null;
  await writeStored(stored);
}
