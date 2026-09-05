import "server-only";

import type { SocialChannel } from "@prisma/client";
import type { VehicleData } from "./types";
import { vehicleSocialUrl } from "./social-template";

export interface PublicationReceipt {
  externalPostId: string;
  externalPostUrl: string | null;
}

export class SocialPublishError extends Error {
  constructor(message: string, public readonly code: string, public readonly retryable = true) {
    super(message);
    this.name = "SocialPublishError";
  }
}

async function jsonResponse(response: Response) {
  return response.json().catch(() => null) as Promise<Record<string, unknown> | null>;
}

function graphEndpoint(path: string) {
  const version = process.env.META_GRAPH_VERSION?.replace(/^\/+|\/+$/g, "");
  return `https://graph.facebook.com/${version ? `${version}/` : ""}${path.replace(/^\/+/, "")}`;
}

async function waitForInstagramContainer(containerId: string, token: string) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch(graphEndpoint(`${containerId}?fields=status_code,status&access_token=${encodeURIComponent(token)}`), { signal: AbortSignal.timeout(15_000) });
    const payload = await jsonResponse(response);
    const status = String(payload?.status_code ?? "");
    if (response.ok && status === "FINISHED") return;
    if (status === "ERROR" || status === "EXPIRED") throw new SocialPublishError(String(payload?.status ?? `Instagram container ${status}`), status, false);
    if (attempt < 5) await new Promise((resolve) => setTimeout(resolve, 2_000));
  }
  throw new SocialPublishError("Instagram media container was not ready in time", "CONTAINER_TIMEOUT", true);
}

async function telegram(vehicle: VehicleData, text: string): Promise<PublicationReceipt> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_ID;
  if (!token || !chatId) throw new SocialPublishError("Telegram channel credentials are not configured", "NOT_CONFIGURED", false);
  const url = vehicleSocialUrl(vehicle, "TELEGRAM");
  const photo = vehicle.photos[0]?.url;
  if (!photo) throw new SocialPublishError("Vehicle has no publishable photo", "PHOTO_MISSING", false);
  const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, photo, caption: text.slice(0, 1024), reply_markup: { inline_keyboard: [[{ text: "Подивитися авто", url }]] } }),
    signal: AbortSignal.timeout(20_000),
  });
  const payload = await jsonResponse(response);
  if (!response.ok || payload?.ok !== true) throw new SocialPublishError(String(payload?.description ?? `Telegram HTTP ${response.status}`), String(payload?.error_code ?? response.status), response.status >= 500 || response.status === 429);
  const result = (payload?.result ?? {}) as Record<string, unknown>;
  const chat = (result.chat ?? {}) as Record<string, unknown>;
  const messageId = String(result.message_id ?? "");
  const username = typeof chat.username === "string" ? chat.username : null;
  return { externalPostId: messageId, externalPostUrl: username && messageId ? `https://t.me/${username}/${messageId}` : null };
}

async function facebook(vehicle: VehicleData, text: string): Promise<PublicationReceipt> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) throw new SocialPublishError("Facebook Page credentials are not configured", "NOT_CONFIGURED", false);
  const body = new URLSearchParams({ url: vehicle.photos[0]?.url ?? "", caption: text, access_token: token });
  const response = await fetch(graphEndpoint(`${pageId}/photos`), { method: "POST", body, signal: AbortSignal.timeout(25_000) });
  const payload = await jsonResponse(response);
  const error = payload?.error as Record<string, unknown> | undefined;
  if (!response.ok || error) throw new SocialPublishError(String(error?.message ?? `Facebook HTTP ${response.status}`), String(error?.code ?? response.status), response.status >= 500 || response.status === 429);
  const id = String(payload?.post_id ?? payload?.id ?? "");
  return { externalPostId: id, externalPostUrl: id ? `https://www.facebook.com/${id.replace("_", "/posts/")}` : null };
}

async function instagram(vehicle: VehicleData, text: string): Promise<PublicationReceipt> {
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!accountId || !token) throw new SocialPublishError("Instagram Business credentials are not configured", "NOT_CONFIGURED", false);
  const createBody = new URLSearchParams({ image_url: vehicle.photos[0]?.url ?? "", caption: text, access_token: token });
  const create = await fetch(graphEndpoint(`${accountId}/media`), { method: "POST", body: createBody, signal: AbortSignal.timeout(25_000) });
  const created = await jsonResponse(create);
  const createError = created?.error as Record<string, unknown> | undefined;
  if (!create.ok || createError || !created?.id) throw new SocialPublishError(String(createError?.message ?? `Instagram container HTTP ${create.status}`), String(createError?.code ?? create.status), create.status >= 500 || create.status === 429);
  await waitForInstagramContainer(String(created.id), token);
  const publishBody = new URLSearchParams({ creation_id: String(created.id), access_token: token });
  const publish = await fetch(graphEndpoint(`${accountId}/media_publish`), { method: "POST", body: publishBody, signal: AbortSignal.timeout(25_000) });
  const published = await jsonResponse(publish);
  const publishError = published?.error as Record<string, unknown> | undefined;
  if (!publish.ok || publishError || !published?.id) throw new SocialPublishError(String(publishError?.message ?? `Instagram publish HTTP ${publish.status}`), String(publishError?.code ?? publish.status), publish.status >= 500 || publish.status === 429);
  const mediaId = String(published.id);
  const details = await fetch(graphEndpoint(`${mediaId}?fields=permalink&access_token=${encodeURIComponent(token)}`), { signal: AbortSignal.timeout(15_000) });
  const detailPayload = await jsonResponse(details);
  return { externalPostId: mediaId, externalPostUrl: typeof detailPayload?.permalink === "string" ? detailPayload.permalink : null };
}

async function viber(vehicle: VehicleData, text: string): Promise<PublicationReceipt> {
  const token = process.env.VIBER_BOT_TOKEN;
  const recipients = process.env.VIBER_BROADCAST_LIST?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
  if (!token || !recipients.length) throw new SocialPublishError("Viber token or broadcast recipients are not configured", "NOT_CONFIGURED", false);
  const url = vehicleSocialUrl(vehicle, "VIBER");
  const response = await fetch("https://chatapi.viber.com/pa/broadcast_message", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Viber-Auth-Token": token },
    body: JSON.stringify({ broadcast_list: recipients, min_api_version: 7, sender: { name: process.env.VIBER_SENDER_NAME ?? "DRIVE STATE" }, type: "rich_media", alt_text: text, rich_media: { Type: "rich_media", ButtonsGroupColumns: 6, ButtonsGroupRows: 7, BgColor: "#0b0c0b", Buttons: [{ Columns: 6, Rows: 4, ActionType: "open-url", ActionBody: url, Image: vehicle.photos[0]?.url }, { Columns: 6, Rows: 2, ActionType: "open-url", ActionBody: url, Text: `<font color=#ffffff>${text.replace(/\n/g, "<br>").slice(0, 700)}</font>`, TextSize: "small", TextVAlign: "middle", TextHAlign: "left" }, { Columns: 6, Rows: 1, ActionType: "open-url", ActionBody: url, BgColor: "#ff6b00", Text: "<font color=#ffffff><b>Подивитися авто</b></font>" }] } }),
    signal: AbortSignal.timeout(25_000),
  });
  const payload = await jsonResponse(response);
  if (!response.ok || Number(payload?.status) !== 0) throw new SocialPublishError(String(payload?.status_message ?? `Viber HTTP ${response.status}`), String(payload?.status ?? response.status), response.status >= 500 || response.status === 429);
  return { externalPostId: String(payload?.message_token ?? Date.now()), externalPostUrl: null };
}

export async function publishToSocialChannel(channel: SocialChannel, vehicle: VehicleData, text: string) {
  if (channel === "TELEGRAM") return telegram(vehicle, text);
  if (channel === "FACEBOOK") return facebook(vehicle, text);
  if (channel === "INSTAGRAM") return instagram(vehicle, text);
  return viber(vehicle, text);
}
