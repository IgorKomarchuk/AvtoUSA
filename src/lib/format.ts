export function formatUsd(value?: number | null) {
  if (value == null) return "За запитом";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value?: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("uk-UA").format(value);
}

export function formatDate(value?: Date | string | null, locale = "uk-UA") {
  if (!value) return "Уточнюється";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value?: Date | string | null, locale = "uk-UA") {
  if (!value) return "Немає даних";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function auctionCountdown(value?: Date | string | null) {
  if (!value) return null;
  const ms = new Date(value).getTime() - Date.now();
  if (ms <= 0) return "Торги розпочалися";
  const hours = Math.floor(ms / 3_600_000);
  const days = Math.floor(hours / 24);
  const rest = hours % 24;
  return days > 0 ? `До торгів: ${days} д ${rest} год` : `До торгів: ${rest} год`;
}

export function vehicleFreshness(value?: Date | string | null, timeZone = "Europe/Kyiv") {
  if (!value) return null;
  const synced = new Date(value);
  if (Number.isNaN(synced.getTime())) return null;
  const now = new Date();
  const dateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
  if (dateFormatter.format(synced) === dateFormatter.format(now)) return "Сьогодні";
  return now.getTime() - synced.getTime() <= 72 * 60 * 60_000 ? "Свіжий лот" : null;
}
