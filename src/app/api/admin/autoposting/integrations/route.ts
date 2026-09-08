import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { getSocialCredentials, saveSocialCredentials } from "@/lib/social-credentials";

const saveSchema = z.object({
  action: z.literal("save"),
  telegramBotToken: z.string().max(300).optional(), telegramChannelId: z.string().max(200).optional(),
  facebookPageId: z.string().max(200).optional(), facebookPageAccessToken: z.string().max(1000).optional(),
  instagramBusinessAccountId: z.string().max(200).optional(), viberBotToken: z.string().max(1000).optional(),
  viberBroadcastList: z.string().max(5000).optional(), viberSenderName: z.string().max(100).optional(),
});
const testSchema = z.object({ action: z.literal("test"), channel: z.enum(["TELEGRAM", "FACEBOOK", "INSTAGRAM", "VIBER"]) });
const schema = z.discriminatedUnion("action", [saveSchema, testSchema]);

async function readJson(response: Response) {
  return response.json().catch(() => null) as Promise<Record<string, unknown> | null>;
}

async function testConnection(channel: "TELEGRAM" | "FACEBOOK" | "INSTAGRAM" | "VIBER") {
  const credentials = await getSocialCredentials();
  if (channel === "TELEGRAM") {
    if (!credentials.telegramBotToken || !credentials.telegramChannelId) throw new Error("Заповніть токен бота та ID каналу Telegram");
    const bot = await fetch(`https://api.telegram.org/bot${credentials.telegramBotToken}/getMe`, { signal: AbortSignal.timeout(15_000) });
    const payload = await readJson(bot);
    if (!bot.ok || payload?.ok !== true) throw new Error(String(payload?.description ?? "Telegram не підтвердив токен"));
    const chat = await fetch(`https://api.telegram.org/bot${credentials.telegramBotToken}/getChat?chat_id=${encodeURIComponent(credentials.telegramChannelId)}`, { signal: AbortSignal.timeout(15_000) });
    const chatPayload = await readJson(chat);
    if (!chat.ok || chatPayload?.ok !== true) throw new Error(String(chatPayload?.description ?? "Telegram не знайшов канал"));
    const result = (chatPayload?.result ?? {}) as Record<string, unknown>;
    return `Telegram підключено: ${String(result.title ?? result.username ?? credentials.telegramChannelId)}`;
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
    return NextResponse.json({ ok: true, message: await testConnection(parsed.data.channel) });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Помилка інтеграції" }, { status: 400 });
  }
}
