import type { VehicleData } from "./types";

export interface PublicationFilterConfig {
  minYear: number;
  maxPrice: number | null;
  allowedMakes: string[];
  excludedMakes: string[];
  allowedDamages: string[];
  minPhotos: number;
}

export const DEFAULT_PUBLICATION_FILTERS: PublicationFilterConfig = {
  minYear: 2015,
  maxPrice: null,
  allowedMakes: [],
  excludedMakes: [],
  allowedDamages: [],
  minPhotos: 1,
};

export function publicationQuality(vehicle: VehicleData, config: PublicationFilterConfig = DEFAULT_PUBLICATION_FILTERS, now = new Date()) {
  const reasons: string[] = [];
  const price = vehicle.buyNowPrice ?? vehicle.currentBid;
  const usablePhotos = vehicle.photos.filter((photo) => /^https?:\/\//.test(photo.url) && !/placeholder|demo/i.test(photo.url));
  const make = vehicle.make?.toLowerCase();
  const status = vehicle.auctionStatus?.toLowerCase() ?? "";
  if (usablePhotos.length < config.minPhotos) reasons.push(`потрібно фото: ${config.minPhotos}`);
  if (!vehicle.vin && !vehicle.lotNumber) reasons.push("немає VIN або lot number");
  if (!vehicle.make) reasons.push("немає марки");
  if (!vehicle.model) reasons.push("немає моделі");
  if (!vehicle.year) reasons.push("немає року");
  if (price == null) reasons.push("немає ціни або ставки");
  if (vehicle.odometerMiles == null && vehicle.odometerKm == null) reasons.push("немає пробігу");
  if (!vehicle.primaryDamage) reasons.push("немає пошкодження");
  if (!vehicle.isActive) reasons.push("лот неактивний");
  if (vehicle.isDemo) reasons.push("DEMO-лот");
  if (["sold", "ended", "removed", "closed"].some((value) => status.includes(value))) reasons.push("торги завершені");
  if (vehicle.auctionDate && vehicle.auctionDate.getTime() < now.getTime() - 86_400_000) reasons.push("лот прострочений");
  if (vehicle.year && vehicle.year < config.minYear) reasons.push(`рік менше ${config.minYear}`);
  if (config.maxPrice != null && price != null && price > config.maxPrice) reasons.push(`ціна понад ${config.maxPrice}`);
  if (make && config.allowedMakes.length && !config.allowedMakes.some((item) => item.toLowerCase() === make)) reasons.push("марка не дозволена");
  if (make && config.excludedMakes.some((item) => item.toLowerCase() === make)) reasons.push("марка виключена");
  if (vehicle.primaryDamage && config.allowedDamages.length && !config.allowedDamages.some((item) => vehicle.primaryDamage?.toLowerCase().includes(item.toLowerCase()))) reasons.push("тип пошкодження не дозволений");
  return { eligible: reasons.length === 0, reasons, usablePhotos };
}
