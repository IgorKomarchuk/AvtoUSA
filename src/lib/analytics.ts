"use client";

type AnalyticsParameters = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    brilliantCarsGoogle?: {
      ga4Enabled: boolean;
      googleAdsEnabled: boolean;
      googleAdsId: string;
      leadConversionLabel: string;
      phoneConversionLabel: string;
    };
  }
}

export function trackEvent(name: string, parameters: AnalyticsParameters = {}) {
  if (typeof window === "undefined" || !window.gtag || !window.brilliantCarsGoogle?.ga4Enabled) return;
  window.gtag("event", name, parameters);
}

function trackAdsConversion(label: string, parameters: AnalyticsParameters = {}) {
  const config = typeof window === "undefined" ? null : window.brilliantCarsGoogle;
  if (!window.gtag || !config?.googleAdsEnabled || !config.googleAdsId || !label) return;
  window.gtag("event", "conversion", { send_to: `${config.googleAdsId}/${label}`, ...parameters });
}

export function trackLeadConversion(parameters: AnalyticsParameters = {}) {
  trackEvent("generate_lead", parameters);
  if (typeof window !== "undefined") trackAdsConversion(window.brilliantCarsGoogle?.leadConversionLabel ?? "", parameters);
}

export function trackPhoneConversion(location: string) {
  trackEvent("click_phone", { contact_method: "phone", link_location: location });
  if (typeof window !== "undefined") trackAdsConversion(window.brilliantCarsGoogle?.phoneConversionLabel ?? "", { link_location: location });
}
