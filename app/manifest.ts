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
    // Mikado Yellow is the primary brand color (Color 4).
    theme_color: site.colors.gold,
    categories: ["shopping", "lifestyle"],
    lang: "en-US",
    dir: "ltr",
    icons: [
      // Brand mark from /public — also the tab favicon (see layout metadata).
      { src: "/favicon.png", sizes: "445x445", type: "image/png" },
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
