import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BRILLIANTCARS — авто зі США",
    short_name: "BRILLIANTCARS",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
    description: "Каталог автомобілів з аукціонів США та доставка в Україну",
    start_url: "/",
    display: "standalone",
    background_color: "#070807",
    theme_color: "#ff6b00",
  };
}
