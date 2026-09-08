import { getSeoInventory } from "@/lib/vehicle-repository";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" })[character] ?? character);
}

export async function GET() {
  const inventory = await getSeoInventory();
  const urls = inventory.filter((vehicle) => vehicle.photos.length).map((vehicle) => {
    const images = vehicle.photos.slice(0, 20).map((photo) => `<image:image><image:loc>${escapeXml(photo.url)}</image:loc>${photo.alt ? `<image:title>${escapeXml(photo.alt)}</image:title>` : ""}</image:image>`).join("");
    return `<url><loc>${escapeXml(absoluteUrl(`/cars/${vehicle.slug}`))}</loc>${images}</url>`;
  }).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls}</urlset>`, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=1800, stale-while-revalidate=86400" },
  });
}
