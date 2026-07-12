import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.tagline}`,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    id: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: site.colors.darkBg,
    theme_color: site.colors.brand,
    categories: ["shopping", "lifestyle"],
    lang: "en-US",
    dir: "ltr",
    icons: [
      // Rounded brand favicon (app/icon.png) is auto-linked by Next in <head>.
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
      // The full-bleed square mark serves as the maskable install icon.
      {
        src: "/buyology-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
