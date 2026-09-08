import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { getSocialCredentials, saveSocialCredentials, saveSocialIntegrationCheck } from "@/lib/social-credentials";
import { getPrisma } from "@/lib/prisma";
import { DEFAULT_TEMPLATES } from "@/lib/social-config";
import { renderSocialTemplate } from "@/lib/social-template";
import { publishToSocialChannel } from "@/lib/social-publishers";
import type { VehicleData } from "@/lib/types";

const saveSchema = z.object({
  action: z.literal("save"),
  telegramBotToken: z.string().max(300).optional(), telegramChannelId: z.string().max(200).optional(), telegramLeadChatId: z.string().max(200).optional(),
  facebookPageId: z.string().max(200).optional(), facebookPageAccessToken: z.string().max(1000).optional(),
  instagramBusinessAccountId: z.string().max(200).optional(), viberBotToken: z.string().max(1000).optional(),
  viberBroadcastList: z.string().max(5000).optional(), viberSenderName: z.string().max(100).optional(),
});
const testSchema = z.object({ action: z.literal("test"), channel: z.enum(["TELEGRAM", "FACEBOOK", "INSTAGRAM", "VIBER"]) });
const testPublicationSchema = z.object({ action: z.literal("test_publication"), channel: z.enum(["TELEGRAM", "FACEBOOK", "INSTAGRAM", "VIBER"]) });
const schema = z.discriminatedUnion("action", [saveSchema, testSchema, testPublicationSchema]);

async function readJson(response: Response) {
  return response.json().catch(() => null) as Promise<Record<string, unknown> | null>;
}

async function testConnection(channel: "TELEGRAM" | "FACEBOOK" | "INSTAGRAM" | "VIBER") {
  const credentials = await getSocialCredentials();
  if (channel === "TELEGRAM") {
    if (!credentials.telegramBotToken) throw new Error("Заповніть токен Telegram-бота");
    if (!credentials.telegramChannelId) throw new Error("Заповніть Channel ID для автопостів");
    if (!credentials.telegramLeadChatId) throw new Error("Заповніть Chat ID менеджера для заявок — без нього заявки залишаються лише в адмінці");
    const bot = await fetch(`https://api.telegram.org/bot${credentials.telegramBotToken}/getMe`, { signal: AbortSignal.timeout(15_000) });
    const payload = await readJson(bot);
    if (!bot.ok || payload?.ok !== true) throw new Error(String(payload?.description ?? "Telegram не підтвердив токен"));
    const destinations = [
      { label: "Автопости", chatId: credentials.telegramChannelId },
      { label: "Заявки", chatId: credentials.telegramLeadChatId },
    ];
    const names: string[] = [];
    for (const { label, chatId } of destinations) {
      const chat = await fetch(`https://api.telegram.org/bot${credentials.telegramBotToken}/getChat?chat_id=${encodeURIComponent(chatId)}`, { signal: AbortSignal.timeout(15_000) });
      const chatPayload = await readJson(chat);
      if (!chat.ok || chatPayload?.ok !== true) throw new Error(String(chatPayload?.description ?? `Telegram не знайшов ${chatId}`));
      const result = (chatPayload?.result ?? {}) as Record<string, unknown>;
      names.push(`${label}: ${String(result.title ?? result.username ?? chatId)}`);
    }
    return `Telegram підключено: ${names.join("; ")}`;
  }
  if (channel === "FACEBOOK" || channel === "INSTAGRAM") {
    const id = channel === "FACEBOOK" ? credentials.facebookPageId : credentials.instagramBusinessAccountId;
    if (!id || !credentials.facebookPageAccessToken) throw new Error(`Заповніть ID ${channel} та Meta access token`);
    const response = await fetch(`https://graph.facebook.com/${encodeURIComponent(id)}?fields=id,name,username&access_token=${encodeURIComponent(credentials.facebookPageAccessToken)}`, { signal: AbortSignal.timeout(15_000) });
    const payload = await readJson(response);
    const error = payload?.error as Record<string, unknown> | undefined;
    if (!response.ok || error) throw new Error(String(error?.message ?? `${channel} не підтвердив credentials`));
    return `${channel} підключено: ${String(payload?.name ?? payload?.username ?? payload?.id ?? id)}`;
  }
  if (!credentials.viberBotToken || !credentials.viberBroadcastList) throw new Error("Заповніть Viber bot token та список одержувачів");
  const response = await fetch("https://chatapi.viber.com/pa/get_account_info", { method: "POST", headers: { "Content-Type": "application/json", "X-Viber-Auth-Token": credentials.viberBotToken }, body: "{}", signal: AbortSignal.timeout(15_000) });
  const payload = await readJson(response);
  if (!response.ok || Number(payload?.status) !== 0) throw new Error(String(payload?.status_message ?? "Viber не підтвердив токен"));
  return `Viber підключено: ${String(payload?.name ?? "бот активний")}`;
}

async function testPublication(channel: "TELEGRAM" | "FACEBOOK" | "INSTAGRAM" | "VIBER") {
  const prisma = getPrisma();
  if (!prisma) throw new Error("PostgreSQL не підключено");
  const vehicle = await prisma.vehicle.findFirst({
    where: { isActive: true, isDemo: false, photos: { some: {} } },
    include: { photos: { orderBy: { position: "asc" }, take: 1 } },
    orderBy: { lastSyncedAt: "desc" },
  });
  if (!vehicle) throw new Error("Немає реального автомобіля з фото для тесту");
  const template = await prisma.socialTemplate.findUnique({ where: { channel } });
  const rendered = renderSocialTemplate(template?.body ?? DEFAULT_TEMPLATES[channel], vehicle as unknown as VehicleData, channel);
  const marker = "🧪 ТЕСТОВА ПУБЛІКАЦІЯ BRILLIANTCARS\nЦе перевірка інтеграції. Повідомлення можна видалити.\n\n";
  const receipt = await publishToSocialChannel(channel, vehicle as unknown as VehicleData, `${marker}${rendered}`);
  return { message: `Тестовий пост із ${vehicle.title} успішно надіслано`, receipt };
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ ok: false, message: "Потрібна авторизація" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Некоректні дані" }, { status: 422 });
  try {
    if (parsed.data.action === "save") {
      const { action: _action, ...values } = parsed.data;
      void _action;
      await saveSocialCredentials(values);
      return NextResponse.json({ ok: true, message: "Credentials зашифровано та збережено" });
    }
    if (parsed.data.action === "test") {
      const message = await testConnection(parsed.data.channel);
      await saveSocialIntegrationCheck(parsed.data.channel, { ok: true, kind: "connection", message, checkedAt: new Date().toISOString() });
      return NextResponse.json({ ok: true, message });
    }
    const result = await testPublication(parsed.data.channel);
    await saveSocialIntegrationCheck(parsed.data.channel, { ok: true, kind: "publication", message: result.message, checkedAt: new Date().toISOString(), externalPostUrl: result.receipt.externalPostUrl });
    return NextResponse.json({ ok: true, message: result.message, externalPostUrl: result.receipt.externalPostUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Помилка інтеграції";
    if (parsed.data.action !== "save") {
      await saveSocialIntegrationCheck(parsed.data.channel, { ok: false, kind: parsed.data.action === "test" ? "connection" : "publication", message, checkedAt: new Date().toISOString() }).catch(() => undefined);
    }
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
