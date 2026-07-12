import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { buyobot, productCategories, services } from "@/lib/nav-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site.url, lastModified, changeFrequency: "daily", priority: 1 },
    {
      url: `${site.url}/search`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  // Signature services get their own high-priority routes.
  const serviceRoutes: MetadataRoute.Sitemap = [...services, buyobot].map(
    (s) => ({
      url: `${site.url}${s.href}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    }),
  );

  const categoryRoutes: MetadataRoute.Sitemap = productCategories.map((c) => ({
    url: `${site.url}${c.href}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...serviceRoutes, ...categoryRoutes];
}
