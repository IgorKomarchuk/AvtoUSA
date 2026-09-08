import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/language-provider";
import { absoluteUrl } from "@/lib/utils";
import { GoogleTracking } from "@/components/google-tracking";
import { getGoogleTrackingSettings } from "@/lib/google-settings";
import { getSiteContacts } from "@/lib/site-contacts";
import { jsonLd, SITE_NAME } from "@/lib/seo";

const baseMetadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: { default: "BRILLIANTCARS — авто зі США під ключ", template: "%s | BRILLIANTCARS" },
  description: "Підбір, перевірка, купівля та доставка автомобілів з аукціонів Copart та IAAI в Україну.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "uk_UA",
    siteName: "BRILLIANTCARS",
    title: "BRILLIANTCARS — авто зі США під ключ",
    description: "Живий каталог аукціонних автомобілів, прозорий розрахунок і доставка в Україну.",
    images: [{ url: "/assets/hero-car.png", width: 1816, height: 866, alt: "BRILLIANTCARS — авто зі США" }],
  },
  twitter: { card: "summary_large_image", title: "BRILLIANTCARS — авто зі США під ключ", images: ["/assets/hero-car.png"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getGoogleTrackingSettings();
  return {
    ...baseMetadata,
    verification: settings.searchConsoleVerification ? { google: settings.searchConsoleVerification } : undefined,
    other: settings.bingSiteVerification ? { "msvalidate.01": settings.bingSiteVerification } : undefined,
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#070807", colorScheme: "dark" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [googleSettings, contacts] = await Promise.all([getGoogleTrackingSettings(), getSiteContacts()]);
  const sameAs = [contacts.telegramUrl, contacts.instagramUrl].filter((url) => url && url !== "https://t.me/" && url !== "https://instagram.com/");
  const structured = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": absoluteUrl("/#organization"),
        name: SITE_NAME,
        url: absoluteUrl("/"),
        logo: absoluteUrl("/icon.svg"),
        email: contacts.email,
        telephone: contacts.phoneHref,
        contactPoint: { "@type": "ContactPoint", telephone: contacts.phoneHref, contactType: "customer service", areaServed: "UA", availableLanguage: ["uk", "ru"] },
        sameAs: sameAs.length ? sameAs : undefined,
      },
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        url: absoluteUrl("/"),
        name: SITE_NAME,
        publisher: { "@id": absoluteUrl("/#organization") },
        inLanguage: "uk-UA",
        potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: absoluteUrl("/cars?search={search_term_string}") }, "query-input": "required name=search_term_string" },
      },
    ],
  };
  return (
    <html lang="uk" suppressHydrationWarning>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />
        <LanguageProvider>{children}<GoogleTracking settings={googleSettings} /></LanguageProvider>
      </body>
    </html>
  );
}
