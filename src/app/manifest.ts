import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BRILLIANTCARS — авто зі США",
    short_name: "BRILLIANTCARS",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    description: "Каталог автомобілів з аукціонів США та доставка в Україну",
    start_url: "/",
    display: "standalone",
    background_color: "#070807",
    theme_color: "#ff6b00",
  };
}
