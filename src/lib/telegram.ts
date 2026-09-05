import "server-only";

import type { LeadInput } from "./validation";

function escapeHtml(value?: string | null) {
  return (value ?? "—").replace(/[&<>]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[character] ?? character);
}

export async function sendLeadToTelegram(lead: LeadInput) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { delivered: false, reason: "not_configured" as const };

  const text = [
    "<b>Нова заявка із сайту DRIVE STATE</b>",
    `Ім’я: ${escapeHtml(lead.name)}`,
    `Телефон: ${escapeHtml(lead.phone)}`,
    `Месенджер: ${escapeHtml(lead.messenger)}`,
    `Автомобіль: ${escapeHtml(lead.vehicleTitle ?? lead.interest)}`,
    `VIN: ${escapeHtml(lead.vin)}`,
    `Lot: ${escapeHtml(lead.lotNumber)}`,
    `Ціна: ${escapeHtml(lead.price)}`,
    `Сторінка: ${escapeHtml(lead.vehicleUrl)}`,
    `Канал: ${escapeHtml(lead.sourceChannel)}`,
    `UTM: ${escapeHtml([lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(" / "))}`,
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
