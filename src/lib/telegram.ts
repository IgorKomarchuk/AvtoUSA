import "server-only";

import type { LeadInput } from "./validation";
import { getSocialCredentials } from "./social-credentials";

function escapeHtml(value?: string | null) {
  return (value ?? "—").replace(/[&<>]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[character] ?? character);
}

export async function sendLeadToTelegram(lead: LeadInput) {
  const credentials = await getSocialCredentials();
  const token = credentials.telegramBotToken;
  const chatId = credentials.telegramLeadChatId;
  if (!token || !chatId) return { delivered: false, reason: "not_configured" as const };

  const text = [
    "<b>Нова заявка із сайту BRILLIANTCARS</b>",
    `Ім’я: ${escapeHtml(lead.name)}`,
    `Телефон: ${escapeHtml(lead.phone)}`,
    `Месенджер: ${escapeHtml(lead.messenger)}`,
    `Автомобіль: ${escapeHtml(lead.vehicleTitle ?? lead.interest)}`,
    `VIN: ${escapeHtml(lead.vin)}`,
    `Lot: ${escapeHtml(lead.lotNumber)}`,
    `Ціна: ${escapeHtml(lead.price)}`,
    `Сторінка: ${escapeHtml(lead.vehicleUrl)}`,
    `Канал: ${escapeHtml(lead.sourceChannel)}`,
    `UTM: ${escapeHtml([lead.utmSource, lead.utmMedium, lead.utmCampaign, lead.utmTerm].filter(Boolean).join(" / "))}`,
    `Google Click ID: ${escapeHtml(lead.gclid ?? lead.gbraid ?? lead.wbraid)}`,
  ].join("\n");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Telegram delivery failed with HTTP ${response.status}`);
  return { delivered: true as const };
}
