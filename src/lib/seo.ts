import type { Metadata } from "next";
import type { CatalogSearchParams } from "@/components/catalog-page";

export const SITE_NAME = "BRILLIANTCARS";

const trackingParameters = new Set([
  "gclid", "gbraid", "wbraid", "fbclid", "msclkid",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
]);

export function catalogSegment(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function catalogName(value: string) {
  const aliases: Record<string, string> = {
    bmw: "BMW",
    iaai: "IAAI",
    mercedes: "Mercedes-Benz",
    "mercedes-benz": "Mercedes-Benz",
  };
  const normalized = value.toLowerCase();
  return aliases[normalized] ?? value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function catalogRobotsAndCanonical(basePath: string, searchParams: CatalogSearchParams = {}) {
  const meaningful = Object.entries(searchParams).filter(([key, value]) => value != null && first(value) !== "" && !trackingParameters.has(key));
  const cleanPageOnly = meaningful.length === 1 && meaningful[0]?.[0] === "page" && Number(first(meaningful[0]?.[1])) > 1;
  const hasFilters = meaningful.length > 0 && !cleanPageOnly;
  const page = cleanPageOnly ? Math.max(2, Number(first(meaningful[0]?.[1]))) : null;
  return {
    canonical: page ? `${basePath}?page=${page}` : basePath,
    robots: hasFilters ? ({ index: false, follow: true } satisfies Metadata["robots"]) : undefined,
    page,
  };
}

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
