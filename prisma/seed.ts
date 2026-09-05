try { process.loadEnvFile(); } catch { /* CI may inject env directly. */ }
import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { DEFAULT_CHANNEL_CONFIG, DEFAULT_TEMPLATES, SOCIAL_CHANNELS } from "../src/lib/social-config";

async function main() {
  const email = process.env.ADMIN_INITIAL_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  const connectionString = process.env.DATABASE_URL;
  if (!email || !password || !connectionString) throw new Error("DATABASE_URL, ADMIN_INITIAL_EMAIL and ADMIN_INITIAL_PASSWORD are required");
  if (password.length < 12) throw new Error("ADMIN_INITIAL_PASSWORD must contain at least 12 characters");
  const prisma = new PrismaClient({ datasources: { db: { url: connectionString } } });
  await prisma.adminUser.upsert({
    where: { email },
    create: { email, passwordHash: await hash(password, 12), name: "Administrator" },
    update: { passwordHash: await hash(password, 12), isActive: true },
  });
  await prisma.$transaction([
    prisma.siteSetting.upsert({ where: { key: "autopost_mode" }, create: { key: "autopost_mode", value: "manual" }, update: {} }),
    ...SOCIAL_CHANNELS.map((channel) => prisma.socialTemplate.upsert({ where: { channel }, create: { channel, body: DEFAULT_TEMPLATES[channel] }, update: {} })),
    ...SOCIAL_CHANNELS.map((channel) => prisma.socialChannelSetting.upsert({ where: { channel }, create: { channel, enabled: false, dailyLimit: DEFAULT_CHANNEL_CONFIG[channel].dailyLimit, timeWindows: DEFAULT_CHANNEL_CONFIG[channel].timeWindows }, update: {} })),
  ]);
  await prisma.$disconnect();
  console.log(`Admin user prepared: ${email}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
