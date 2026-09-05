import "server-only";

import { slugify } from "./utils";
import type { ApiUsageData, AuctionPlatform, VehicleData } from "./types";

const DEFAULT_BASE_URL = "https://apibara.tech/api/v1/vehicle-auction";
const HTTP_ERRORS: Record<number, string> = {
  400: "Некоректні параметри запиту до Apibara",
  401: "Ключ Apibara відсутній або недійсний",
  403: "Ключ Apibara не має доступу до ресурсу",
  404: "Запис Apibara не знайдено",
  422: "Apibara відхилила параметри запиту",
  429: "Місячний ліміт або rate limit Apibara вичерпано",
  500: "Внутрішня помилка Apibara",
};

type UnknownRecord = Record<string, unknown>;

export class ApibaraError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = "ApibaraError";
  }
}

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as UnknownRecord) : {};
}

function stringValue(...values: unknown[]) {
  const value = values.find((item) => typeof item === "string" && item.trim());
  return typeof value === "string" ? value.trim() : null;
}

function numberValue(...values: unknown[]) {
  for (const value of values) {
    const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value.replace(/[^0-9.-]/g, "")) : NaN;
    if (Number.isFinite(parsed)) return Math.round(parsed);
  }
  return null;
}

function floatValue(...values: unknown[]) {
  for (const value of values) {
    const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value.replace(/[^0-9.-]/g, "")) : NaN;
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function booleanValue(...values: unknown[]) {
  const value = values.find((item) => typeof item === "boolean");
  return typeof value === "boolean" ? value : null;
}

function dateValue(...values: unknown[]) {
  for (const value of values) {
    if (typeof value !== "string" || !value) continue;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

function mediaUrls(media: UnknownRecord) {
  const candidates = [media.photos, media.images, media.full, media.thumbnails].flatMap((value) =>
    Array.isArray(value) ? value : [],
  );
  return candidates
    .map((item) => {
      if (typeof item === "string") return item;
      const entry = record(item);
      return stringValue(entry.url, entry.full, entry.large, entry.src);
    })
    .filter((url): url is string => Boolean(url));
}

export function mapApibaraVehicle(input: unknown): VehicleData {
  const raw = record(input);
  const auction = record(raw.auction);
  const pricing = record(raw.pricing);
  const location = record(raw.location);
  const facility = record(raw.facility);
  const condition = record(raw.condition);
  const odometer = record(raw.odometer);
  const specs = record(raw.vehicle_specs);
  const seller = record(raw.seller);
  const document = record(raw.sale_document);
  const media = record(raw.media);
  const platformRaw = stringValue(raw.platform, raw.auction_platform)?.toUpperCase();
  const platform: AuctionPlatform = platformRaw === "IAAI" ? "IAAI" : "COPART";
  const lotNumber = stringValue(raw.lot_number, raw.lotNumber, raw.platform_id) ?? "unknown";
  const vin = stringValue(raw.vin, raw.slug_vin);
  const year = numberValue(raw.year);
  const make = stringValue(raw.make);
  const model = stringValue(raw.model);
  const title = stringValue(raw.title) ?? ([year, make, model].filter(Boolean).join(" ") || `${platform} lot ${lotNumber}`);
  const slugBase = `${year ?? "car"}-${make ?? platform}-${model ?? "lot"}-${platform}-${lotNumber}`;
  const photos = mediaUrls(media);
  const miles = numberValue(odometer.mi, odometer.miles, raw.odometer);
  const kilometers = numberValue(odometer.km) ?? (miles == null ? null : Math.round(miles * 1.60934));

  return {
    id: `${platform.toLowerCase()}-${lotNumber}`,
    externalId: stringValue(raw.external_id, raw.id, raw.slug_vin),
    slug: slugify(slugBase),
    vin,
    lotNumber,
    platform,
    title,
    year,
    make,
    model,
    trim: stringValue(raw.trim, specs.trim),
    vehicleType: stringValue(raw.type, raw.vehicle_type),
    bodyStyle: stringValue(specs.body_style, raw.body_style),
    engine: stringValue(specs.engine, raw.engine),
    fuel: stringValue(specs.fuel_type, raw.fuel_type),
    transmission: stringValue(specs.transmission, raw.transmission),
    drive: stringValue(specs.drive_type, raw.drive_type),
    color: stringValue(specs.color, raw.color),
    odometerMiles: miles,
    odometerKm: kilometers,
    primaryDamage: stringValue(condition.primary_damage, raw.damage),
    secondaryDamage: stringValue(condition.secondary_damage),
    lossType: stringValue(condition.loss_type),
    keysAvailable: booleanValue(condition.has_key, raw.has_key),
    runCondition: stringValue(condition.run_condition, condition.run_cond, raw.run_cond),
    currentBid: numberValue(pricing.current_bid_usd, raw.current_bid),
    buyNowPrice: numberValue(pricing.buy_now_usd, raw.buy_now_price),
    estimatedValue: numberValue(pricing.estimated_value_usd, pricing.estimated_retail_value_usd),
    lastSoldPrice: numberValue(pricing.sale_price_usd, pricing.last_sold_price_usd),
    auctionDate: dateValue(auction.auction_at, auction.date, raw.auction_date),
    auctionStatus: stringValue(auction.state, auction.lot_sub_status, auction.lot_status),
    seller: stringValue(seller.name, raw.seller),
    sellerType: stringValue(seller.type, seller.seller_type),
    facility: stringValue(facility.name, location.display, location.office_name),
    city: stringValue(facility.city, location.city),
    state: stringValue(facility.state, facility.state_code, location.state),
    zip: stringValue(facility.zip, location.zip),
    latitude: floatValue(facility.latitude, location.latitude),
    longitude: floatValue(facility.longitude, location.longitude),
    saleDocument: stringValue(document.name, document.document_name),
    titleType: stringValue(document.type, document.normalized_type),
    sourceUrl: stringValue(raw.source_url, raw.url),
    videoUrl: stringValue(media.video_url, media.video),
    media360Url: stringValue(media.media_360_url, media.view_360_url),
    isDemo: false,
    isActive: true,
    rawData: raw,
    lastSyncedAt: new Date(),
    photos: photos.map((url, index) => ({ url, position: index, alt: `${title}, фото ${index + 1}` })),
  };
}

export class ApibaraClient {
  private readonly baseUrl = process.env.APIBARA_BASE_URL ?? DEFAULT_BASE_URL;
  private readonly apiKey = process.env.APIBARA_API_KEY;

  get configured() {
    return Boolean(this.apiKey);
  }

  private async request<T>(path: string, params?: URLSearchParams): Promise<T> {
    if (!this.apiKey) throw new ApibaraError("APIBARA_API_KEY не налаштовано", 401);
    const url = new URL(`${this.baseUrl}${path}`);
    params?.forEach((value, key) => url.searchParams.append(key, value));
    const response = await fetch(url, {
      headers: { Accept: "application/json", "X-API-Key": this.apiKey },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new ApibaraError(HTTP_ERRORS[response.status] ?? `Apibara повернула HTTP ${response.status}`, response.status, payload);
    }
    return payload as T;
  }

  async vehicles(options: { platform?: "copart" | "iaai"; identifier?: string } = {}) {
    const params = new URLSearchParams({
      lot_status: "All",
      lot_sub_status: "Open",
      upcoming: "only",
      per_page: String(Math.min(20, Math.max(1, Number(process.env.AUCTION_SYNC_PER_PAGE) || 20))),
    });
    if (options.platform) params.set("platform", options.platform);
    if (options.identifier) params.set("s", options.identifier);
    const response = await this.request<{ ok: boolean; data?: unknown[]; meta?: UnknownRecord }>("/vehicles", params);
    return { vehicles: (response.data ?? []).map(mapApibaraVehicle), meta: response.meta ?? {} };
  }

  async singleVehicle(identifier: string) {
    const response = await this.request<{ ok: boolean; data?: unknown }>(`/vehicles/${encodeURIComponent(identifier)}`);
    if (!response.data) throw new ApibaraError("Автомобіль не знайдено у відповіді Apibara", 404);
    return mapApibaraVehicle(response.data);
  }

  async usage(): Promise<ApiUsageData> {
    const response = await this.request<{ ok?: boolean; data?: UnknownRecord }>("/usage");
    const data = record(response.data);
    return {
      plan: stringValue(data.plan, data.plan_name),
      used: numberValue(data.used, data.requests_used, data.usage),
      remaining: numberValue(data.remaining, data.requests_remaining),
      limit: numberValue(data.limit, data.monthly_limit, data.requests_limit),
      updatedAt: new Date(),
    };
  }
}
