import "server-only";

import { getPrisma } from "./prisma";

export const GOOGLE_SETTINGS_KEY = "google_tracking";

export type GoogleTrackingSettings = {
  ga4Enabled: boolean;
  ga4MeasurementId: string;
  googleAdsEnabled: boolean;
  googleAdsId: string;
  leadConversionLabel: string;
  phoneConversionLabel: string;
  consentBannerEnabled: boolean;
  searchConsoleVerification: string;
  bingSiteVerification: string;
};

export const defaultGoogleTrackingSettings: GoogleTrackingSettings = {
  ga4Enabled: process.env.GOOGLE_ANALYTICS_ENABLED === "true",
  ga4MeasurementId: process.env.GOOGLE_ANALYTICS_ID ?? "",
  googleAdsEnabled: process.env.GOOGLE_ADS_ENABLED === "true",
  googleAdsId: process.env.GOOGLE_ADS_ID ?? "",
  leadConversionLabel: process.env.GOOGLE_ADS_LEAD_CONVERSION_LABEL ?? "",
  phoneConversionLabel: process.env.GOOGLE_ADS_PHONE_CONVERSION_LABEL ?? "",
  consentBannerEnabled: true,
  searchConsoleVerification: process.env.GOOGLE_SITE_VERIFICATION ?? "",
  bingSiteVerification: process.env.BING_SITE_VERIFICATION ?? "",
};

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

export function normalizeGoogleTrackingSettings(value: unknown): GoogleTrackingSettings {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  return {
    ga4Enabled: booleanValue(source.ga4Enabled, defaultGoogleTrackingSettings.ga4Enabled),
    ga4MeasurementId: stringValue(source.ga4MeasurementId, defaultGoogleTrackingSettings.ga4MeasurementId),
    googleAdsEnabled: booleanValue(source.googleAdsEnabled, defaultGoogleTrackingSettings.googleAdsEnabled),
    googleAdsId: stringValue(source.googleAdsId, defaultGoogleTrackingSettings.googleAdsId),
    leadConversionLabel: stringValue(source.leadConversionLabel, defaultGoogleTrackingSettings.leadConversionLabel),
    phoneConversionLabel: stringValue(source.phoneConversionLabel, defaultGoogleTrackingSettings.phoneConversionLabel),
    consentBannerEnabled: booleanValue(source.consentBannerEnabled, true),
    searchConsoleVerification: stringValue(source.searchConsoleVerification, defaultGoogleTrackingSettings.searchConsoleVerification),
    bingSiteVerification: stringValue(source.bingSiteVerification, defaultGoogleTrackingSettings.bingSiteVerification),
  };
}

export async function getGoogleTrackingSettings() {
  const prisma = getPrisma();
  if (!prisma) return defaultGoogleTrackingSettings;
  const setting = await prisma.siteSetting.findUnique({ where: { key: GOOGLE_SETTINGS_KEY } }).catch(() => null);
  return normalizeGoogleTrackingSettings(setting?.value);
}
