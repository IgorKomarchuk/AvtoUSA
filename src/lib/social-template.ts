import { formatDate, formatNumber, formatUsd } from "./format";
import { absoluteUrl } from "./utils";
import { UTM_BY_CHANNEL } from "./social-config";
import type { SocialChannel } from "@prisma/client";
import type { VehicleData } from "./types";

const variables = ["year", "make", "model", "trim", "auction", "currentBid", "buyNowPrice", "odometer", "primaryDamage", "auctionDate", "vehicleUrl"] as const;

export function vehicleSocialUrl(vehicle: Pick<VehicleData, "slug">, channel: SocialChannel) {
  const url = new URL(absoluteUrl(`/cars/${vehicle.slug}`));
  const utm = UTM_BY_CHANNEL[channel];
  url.searchParams.set("utm_source", utm.source);
  url.searchParams.set("utm_medium", utm.medium);
  url.searchParams.set("utm_campaign", utm.campaign);
  return url.toString();
}

export function renderSocialTemplate(template: string, vehicle: VehicleData, channel: SocialChannel) {
  const bid = vehicle.buyNowPrice ?? vehicle.currentBid;
  const values: Record<(typeof variables)[number], string> = {
    year: vehicle.year?.toString() ?? "—",
    make: vehicle.make ?? "—",
    model: vehicle.model ?? "—",
    trim: vehicle.trim ?? "",
    auction: vehicle.platform === "IAAI" ? "IAAI" : "Copart",
    currentBid: formatUsd(bid),
    buyNowPrice: formatUsd(vehicle.buyNowPrice),
    odometer: vehicle.odometerMiles == null ? "—" : `${formatNumber(vehicle.odometerMiles)} mi`,
    primaryDamage: vehicle.primaryDamage ?? "—",
    auctionDate: formatDate(vehicle.auctionDate),
    vehicleUrl: vehicleSocialUrl(vehicle, channel),
  };
  return variables.reduce((body, key) => body.replaceAll(`{{${key}}}`, values[key]), template).replace(/[ \t]+\n/g, "\n").trim();
}

export function unknownTemplateVariables(template: string) {
  const supported = new Set<string>(variables);
  return [...template.matchAll(/{{\s*([a-zA-Z0-9_]+)\s*}}/g)].map((match) => match[1]).filter((key): key is string => Boolean(key) && !supported.has(key));
}
