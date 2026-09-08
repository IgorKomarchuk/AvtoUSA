import Script from "next/script";
import type { GoogleTrackingSettings } from "@/lib/google-settings";
import { GoogleConsentBanner } from "./google-consent-banner";
import { GooglePageView } from "./google-page-view";

export function GoogleTracking({ settings }: { settings: GoogleTrackingSettings }) {
  const ga4Active = settings.ga4Enabled && Boolean(settings.ga4MeasurementId);
  const adsActive = settings.googleAdsEnabled && Boolean(settings.googleAdsId);
  if (!ga4Active && !adsActive) return null;

  const primaryId = ga4Active ? settings.ga4MeasurementId : settings.googleAdsId;
  const publicConfig = {
    ga4Enabled: ga4Active,
    googleAdsEnabled: adsActive,
    googleAdsId: settings.googleAdsId,
    leadConversionLabel: settings.leadConversionLabel,
    phoneConversionLabel: settings.phoneConversionLabel,
  };
  const bootstrap = `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments)}
window.gtag=gtag;
window.brilliantCarsGoogle=${JSON.stringify(publicConfig)};
var consent=${settings.consentBannerEnabled ? "localStorage.getItem('brilliantcars-google-consent')" : "'all'"};
var granted=consent==='all';
gtag('consent','default',{analytics_storage:granted?'granted':'denied',ad_storage:granted?'granted':'denied',ad_user_data:granted?'granted':'denied',ad_personalization:granted?'granted':'denied',wait_for_update:500});
gtag('set','url_passthrough',true);
gtag('set','ads_data_redaction',true);
gtag('js',new Date());
${ga4Active ? `gtag('config',${JSON.stringify(settings.ga4MeasurementId)},{anonymize_ip:true,send_page_view:false});` : ""}
${adsActive ? `gtag('config',${JSON.stringify(settings.googleAdsId)});` : ""}
`;

  return (
    <>
      <Script id="google-consent-and-config" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: bootstrap }} />
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryId)}`} strategy="afterInteractive" />
      <GooglePageView />
      {settings.consentBannerEnabled && <GoogleConsentBanner />}
    </>
  );
}
