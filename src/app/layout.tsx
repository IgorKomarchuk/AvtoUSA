import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/language-provider";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
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
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#070807", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
